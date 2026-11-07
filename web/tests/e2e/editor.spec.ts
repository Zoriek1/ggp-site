import { test, expect, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import {
  createRecord,
  slugify,
  type Collection,
  type ContentRecord,
  type VersionedRecord,
} from "../../src/lib/content/model";

const origin = "http://127.0.0.1:3100";
const shots = path.resolve("../work/review-v2");
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário", { exact: true }).fill("grupo");
  await page.getByLabel("Senha", { exact: true }).fill("fixture-only-password");
  await page.getByRole("button", { name: "Entrar no painel" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function write(
  page: Page,
  record: ContentRecord,
  action: "publish" | "draft" = "publish",
  revision: string | null = null,
) {
  const response = await page.request.post("/api/admin/records", {
    headers: { Origin: origin },
    data: { record, action, revision },
  });
  const data = await response.json();
  expect(response.ok(), JSON.stringify(data)).toBeTruthy();
  return data.entry as VersionedRecord;
}
async function entity(
  page: Page,
  collection: Collection,
  title: string,
  overrides: Partial<ContentRecord> = {},
) {
  const id = `${collection}-${crypto.randomUUID()}`;
  return write(page, {
    ...createRecord(collection, id),
    title: { pt: title, en: "" },
    slug: { pt: slugify(`${title}-${id.slice(-5)}`), en: "" },
    ...overrides,
  });
}
async function seedArticle(page: Page, label: string) {
  const pgp = await entity(page, "pgps", `PGP ${label}`),
    area = await entity(page, "areas", `Área ${label}`),
    keyword = await entity(page, "keywords", `Assunto ${label}`);
  const item = await entity(page, "items", `Artigo ${label}`, {
    kind: "article",
    authors: ["Ana"],
    pgpIds: [pgp.record.id],
    areaIds: [area.record.id],
    keywordIds: [keyword.record.id],
    body: { pt: "Corpo publicado original.", en: "" },
  });
  return { item, pgp, area, keyword };
}
async function snapshot(page: Page, name: string) {
  await mkdir(shots, { recursive: true });
  for (const [mode, width, height] of [
    ["desktop", 1440, 1000],
    ["mobile", 390, 844],
  ] as const) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    await page.screenshot({
      path: path.join(shots, `${name}-${mode}.png`),
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
}

test("recovers local writing after reload and guards internal navigation", async ({
  page,
  context,
}) => {
  await login(page);
  await page.goto("/admin/new/items");
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Texto ainda não enviado ao acervo");
  await page
    .locator(".markdown-editor [contenteditable=true]")
    .fill("Minha escrita continua disponível depois de recarregar.");
  await expect(
    page.getByText("Cópia local salva neste navegador.", { exact: true }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Há alterações neste navegador" }),
  ).toBeVisible();
  await snapshot(page, "recovery");
  await page
    .getByRole("button", { name: "Recuperar cópia local", exact: true })
    .click();
  await expect(
    page.getByLabel("Título em português", { exact: true }),
  ).toHaveValue("Texto ainda não enviado ao acervo");
  await expect(
    page.locator(".markdown-editor [contenteditable=true]"),
  ).toContainText("Minha escrita continua disponível");
  page.once("dialog", (dialog) => dialog.dismiss());
  await page
    .getByRole("navigation", { name: "Seções do painel" })
    .getByRole("link", { name: "PGPs", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/new\/items$/);
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("navigation", { name: "Seções do painel" })
    .getByRole("link", { name: "PGPs", exact: true })
    .click();
  await expect(page).toHaveURL(/collection=pgps/);
  await page.goto("/admin/new/items");
  await expect(
    page.getByRole("heading", { name: "Há alterações neste navegador" }),
  ).toBeVisible();
  const recoveredTab = await context.newPage();
  await recoveredTab.goto("/admin/new/items");
  await recoveredTab
    .getByRole("button", { name: "Recuperar cópia local", exact: true })
    .click();
  await recoveredTab
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(recoveredTab).toHaveURL(/\/admin\/edit\/items\//);
  await page.reload();
  await expect(
    page.getByLabel("Título em português", { exact: true }),
  ).toHaveValue("");
  await recoveredTab.close();
});

test("slow saves preserve new typing and Ver publicação keeps the public address", async ({
  page,
}) => {
  await login(page);
  const { item } = await seedArticle(page, "salvamento lento");
  await page.goto(`/admin/edit/items/${item.record.id}`);
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Título enviado ao servidor");
  await page
    .locator(".markdown-editor [contenteditable=true]")
    .fill("Texto enviado ao servidor.");
  let release!: () => void, intercepted!: () => void;
  const pause = new Promise<void>((resolve) => {
      release = resolve;
    }),
    started = new Promise<void>((resolve) => {
      intercepted = resolve;
    });
  let delayed = false;
  await page.route("**/api/admin/records", async (route) => {
    if (route.request().method() !== "POST" || delayed) {
      await route.continue();
      return;
    }
    delayed = true;
    intercepted();
    await pause;
    await route.fulfill({ response: await route.fetch() });
  });
  await page
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await started;
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Título digitado durante o salvamento");
  await page
    .locator(".markdown-editor [contenteditable=true]")
    .fill("Texto mais recente digitado enquanto a rede estava lenta.");
  release();
  await expect(
    page.getByText(
      /As alterações feitas durante o salvamento foram preservadas/,
    ),
  ).toBeVisible();
  await expect(
    page.getByLabel("Título em português", { exact: true }),
  ).toHaveValue("Título digitado durante o salvamento");
  await expect(
    page.locator(".markdown-editor [contenteditable=true]"),
  ).toContainText("Texto mais recente");
  await page
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    page.getByText("Todas as alterações do formulário estão salvas.", {
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByText("Endereço da página e identificação", { exact: true })
    .click();
  await page
    .getByLabel("Endereço (PT)", { exact: true })
    .fill("endereco-ainda-em-rascunho");
  await page
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    page.getByText("Todas as alterações do formulário estão salvas.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Ver publicação", exact: false }),
  ).toHaveAttribute("href", `/pt/publicacoes/${item.record.slug.pt}`);
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Ver publicação", exact: false }),
  ).toHaveAttribute("href", "/pt/publicacoes/endereco-ainda-em-rascunho");
  const redirect = await page.request.get(
    `/pt/publicacoes/${item.record.slug.pt}`,
    { maxRedirects: 0 },
  );
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toContain("endereco-ainda-em-rascunho");
});

test("concurrent editors can compare, keep local writing or explicitly load the remote version", async ({
  page,
  context,
}) => {
  await login(page);
  const { item } = await seedArticle(page, "edição concorrente");
  await page.goto(`/admin/edit/items/${item.record.id}`);
  const second = await context.newPage();
  await second.goto(`/admin/edit/items/${item.record.id}`);
  await second.getByLabel("Título em português", { exact: true }).waitFor();
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Versão da primeira pessoa");
  await page
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    page.getByText("Todas as alterações do formulário estão salvas.", {
      exact: true,
    }),
  ).toBeVisible();
  await second
    .getByLabel("Título em português", { exact: true })
    .fill("Versão da segunda pessoa");
  await second
    .locator(".markdown-editor [contenteditable=true]")
    .fill("Texto local que não pode ser perdido.");
  await second
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    second.getByRole("heading", { name: "Compare as alterações" }),
  ).toBeVisible();
  await expect(
    second.getByLabel("Título em português", { exact: true }),
  ).toHaveValue("Versão da segunda pessoa");
  await snapshot(second, "conflict");
  await second
    .getByRole("button", {
      name: "Manter meu texto sobre a versão atual",
      exact: true,
    })
    .click();
  await second
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    second.getByText("Todas as alterações do formulário estão salvas.", {
      exact: true,
    }),
  ).toBeVisible();
  const payload = await (await second.request.get("/api/admin/records")).json();
  const current = payload.entries.find(
    (e: VersionedRecord) => e.record.id === item.record.id,
  ) as VersionedRecord;
  await write(
    second,
    {
      ...current.record,
      title: { pt: "Versão remota escolhida", en: "" },
      body: { pt: "Corpo remoto escolhido explicitamente.", en: "" },
    },
    "draft",
    current.revision,
  );
  await second
    .getByLabel("Título em português", { exact: true })
    .fill("Alteração local para descartar");
  await second
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(
    second.getByRole("heading", { name: "Compare as alterações" }),
  ).toBeVisible();
  await second
    .getByRole("button", {
      name: "Descartar minhas alterações e usar a versão do acervo",
      exact: true,
    })
    .click();
  await expect(
    second.getByLabel("Título em português", { exact: true }),
  ).toHaveValue("Versão remota escolhida");
  await expect(
    second.locator(".markdown-editor [contenteditable=true]"),
  ).toContainText("Corpo remoto escolhido explicitamente.");
  await second.close();
});

test("full previews show guide aggregation and image attachments; forms show field errors and relevant metadata", async ({
  page,
}) => {
  await login(page);
  const { item, area, keyword } = await seedArticle(page, "prévia completa");
  const manual = await entity(page, "items", "Leitura manual da prévia", {
    kind: "text",
    authors: ["Bruno"],
    areaIds: [area.record.id],
    body: { pt: "Texto da leitura manual.", en: "" },
  });
  await page.goto("/admin/new/guides");
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Guia em prévia");
  await page
    .getByRole("checkbox", { name: keyword.record.title.pt, exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: manual.record.title.pt, exact: true })
    .check();
  await page
    .getByRole("button", { name: "Pré-visualizar", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Leituras deste guia", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".full-preview")
      .getByRole("link", { name: item.record.title.pt, exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".full-preview")
      .getByRole("link", { name: manual.record.title.pt, exact: true }),
  ).toBeVisible();
  await snapshot(page, "guide-preview");
  const opened = page.waitForEvent("popup");
  await page
    .locator(".full-preview")
    .getByRole("link", { name: item.record.title.pt, exact: true })
    .click();
  const reading = await opened;
  await expect(reading).toHaveURL(
    new RegExp(`/pt/publicacoes/${item.record.slug.pt}$`),
  );
  await reading.close();
  page.once("dialog", (dialog) => dialog.accept());
  await page.goto(`/admin/edit/items/${item.record.id}`);
  const image = await sharp({
    create: { width: 24, height: 24, channels: 3, background: "#12336b" },
  })
    .png()
    .toBuffer();
  await page.getByLabel("Enviar arquivo", { exact: true }).setInputFiles({
    name: "imagem.png",
    mimeType: "image/png",
    buffer: image,
  });
  await page
    .getByLabel("Texto alternativo da imagem", { exact: true })
    .fill("Imagem enviada para conferir a prévia");
  await page
    .getByRole("button", { name: "Pré-visualizar", exact: true })
    .click();
  await expect(
    page.getByRole("img", {
      name: "Imagem enviada para conferir a prévia",
      exact: true,
    }),
  ).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.goto("/admin/new/items");
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(
    page.getByLabel("Título em português", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Comunicado com formulário simples");
  await page
    .getByRole("combobox", { name: "Tipo de conteúdo", exact: true })
    .selectOption("notice");
  await expect(
    page.getByText("Dados acadêmicos (opcionais)", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(
    page.getByLabel("Autores — um por linha", { exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
  await snapshot(page, "notice-validation");
});
