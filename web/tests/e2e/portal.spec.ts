import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const shots = path.resolve(process.cwd(), "../work/review");
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Usuário", { exact: true }).fill("grupo");
  await page.getByLabel("Senha", { exact: true }).fill("fixture-only-password");
  await page
    .getByRole("button", { name: "Entrar no painel", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin$/);
}
async function create(page: Page, collection: string, title: string) {
  await page.goto(`/admin/new/${collection}`);
  await page.getByLabel("Título em português", { exact: true }).fill(title);
}
async function publish(page: Page, collection: string) {
  await page.getByRole("button", { name: "Publicar", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/admin/edit/${collection}/`));
  await expect(
    page.getByText("Existe uma versão publicada deste registro.", {
      exact: true,
    }),
  ).toBeVisible();
  return page.url().split("/").at(-1)!;
}
test("complete editorial path: PGPs, area, upload, article, guide, drafts, PT/EN and protection", async ({
  page,
}) => {
  await mkdir(shots, { recursive: true });
  const unauthorized = await page.request.get("/api/admin/records");
  expect(unauthorized.status()).toBe(401);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: path.join(shots, "login-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(shots, "login-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await login(page);
  await create(page, "pgps", "PGP de teste A");
  await publish(page, "pgps");
  await create(page, "pgps", "PGP de teste B");
  await publish(page, "pgps");
  await create(page, "areas", "Área interdisciplinar de teste");
  await publish(page, "areas");
  await create(page, "keywords", "Céu noturno de teste");
  await publish(page, "keywords");
  await create(page, "items", "Observação do céu na escola");
  await page
    .getByRole("combobox", { name: "Tipo de conteúdo", exact: true })
    .selectOption("article");
  await page
    .getByLabel("Autores — um por linha", { exact: true })
    .fill("Ana Professora\nBruno Estudante");
  await page
    .getByLabel("Resumo ou apresentação", { exact: true })
    .fill("Uma leitura compartilhada entre dois PGPs.");
  await page
    .locator(".markdown-editor [contenteditable=true]")
    .fill("Texto para estudar astronomia no portal.");
  await page
    .getByRole("checkbox", { name: "PGP de teste A", exact: true })
    .check();
  await page
    .getByRole("checkbox", { name: "PGP de teste B", exact: true })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Área interdisciplinar de teste",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", { name: "Céu noturno de teste", exact: true })
    .check();
  await page
    .getByLabel("Enviar arquivo", { exact: true })
    .setInputFiles({
      name: "leitura.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4\nfixture e2e\n%%EOF"),
    });
  await expect(
    page.getByText(
      "Arquivo enviado. Salve o registro para guardar o vínculo com o conteúdo.",
      { exact: true },
    ),
  ).toBeVisible();
  const itemId = await publish(page, "items");
  const crossOrigin = await page.request.post("/api/admin/records", {
    headers: { Origin: "https://other.example" },
    data: {},
  });
  expect(crossOrigin.status()).toBe(403);
  await create(page, "guides", "Guia de astronomia compartilhada");
  await page
    .getByRole("checkbox", { name: "Céu noturno de teste", exact: true })
    .check();
  await publish(page, "guides");
  await page.goto("/pt/guias/guia-de-astronomia-compartilhada");
  await expect(
    page.getByRole("link", {
      name: "Observação do céu na escola",
      exact: true,
    }),
  ).toHaveAttribute("href", "/pt/publicacoes/observacao-do-ceu-na-escola");
  for (const group of ["a", "b"]) {
    await page.goto(`/pt/pgps/pgp-de-teste-${group}`);
    await expect(
      page.getByRole("link", {
        name: "Observação do céu na escola",
        exact: true,
      }),
    ).toHaveAttribute("href", "/pt/publicacoes/observacao-do-ceu-na-escola");
  }
  await page.goto("/pt/publicacoes/observacao-do-ceu-na-escola");
  await expect(
    page.getByText("Ana Professora, Bruno Estudante", { exact: true }),
  ).toBeVisible();
  const pdf = await page
    .getByRole("link", { name: "leitura.pdf", exact: false })
    .getAttribute("href");
  const media = await page.request.get(pdf!);
  expect(media.status()).toBe(200);
  expect(media.headers()["content-type"]).toBe("application/pdf");
  expect(await page.locator('meta[name="citation_author"]').count()).toBe(2);
  await page.goto(`/admin/edit/items/${itemId}`);
  await page
    .getByLabel("Título em português", { exact: true })
    .fill("Rascunho ainda não publicado");
  await page
    .getByRole("button", { name: "Salvar rascunho", exact: true })
    .click();
  await expect(page.getByText(/Rascunho salvo\./)).toBeVisible();
  await page.goto("/pt/publicacoes/observacao-do-ceu-na-escola");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Observação do céu na escola",
  );
  await page.goto("/en/publications/observacao-do-ceu-na-escola");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Observação do céu na escola",
  );
  const xml = await (await page.request.get("/sitemap.xml")).text();
  expect(xml).toContain("/pt/publicacoes/observacao-do-ceu-na-escola");
  expect(xml).not.toContain("rascunho-ainda");
  expect(xml).not.toContain("/membros");
  await page.goto("/pt/busca?q=Rascunho+ainda");
  await expect(page.getByText("0 resultado(s)", { exact: true })).toBeVisible();
  await page.goto("/pt");
  await page.screenshot({
    path: path.join(shots, "portal-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(shots, "portal-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/admin");
  await expect(
    page.getByRole("link", {
      name: "Rascunho ainda não publicado",
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(shots, "admin-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: path.join(shots, "admin-mobile.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.goto(`/admin/edit/items/${itemId}`);
  await expect(
    page.locator(".markdown-editor [contenteditable=true]"),
  ).toBeVisible();
  await page.screenshot({
    path: path.join(shots, "editor-mobile.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: path.join(shots, "editor-desktop.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sair", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
});
