import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  hashPassword,
  verifyPassword,
  createSession,
  sessionUser,
  assertOrigin,
  limitLogin,
} from "../src/lib/server/auth";
import { validateMedia, maxUpload } from "../src/lib/server/media";

test("own login validates hash, rejects invalid sessions and supports additional equal accounts", async () => {
  const originalUsers = process.env.PANEL_USERS_JSON,
    originalSecret = process.env.SESSION_SECRET;
  try {
    const passwordHash = hashPassword("fixture-password");
    assert.equal(verifyPassword("fixture-password", passwordHash), true);
    assert.equal(verifyPassword("wrong", passwordHash), false);
    process.env.SESSION_SECRET =
      "fixture-session-secret-at-least-32-characters";
    process.env.PANEL_USERS_JSON = JSON.stringify([
      { id: "grupo", username: "grupo", passwordHash },
      { id: "aluno", username: "aluno", passwordHash },
    ]);
    const token = await createSession("grupo", "fixture-password");
    assert.deepEqual(await sessionUser(token), {
      id: "grupo",
      username: "grupo",
    });
    assert.equal(await sessionUser(`${token}invalid`), null);
    await assert.rejects(createSession("grupo", "wrong"), { status: 401 });
    assert.equal(
      (await sessionUser(await createSession("aluno", "fixture-password")))?.id,
      "aluno",
    );
    process.env.PANEL_USERS_JSON = "[]";
    assert.equal(await sessionUser(token), null);
  } finally {
    if (originalUsers === undefined) delete process.env.PANEL_USERS_JSON;
    else process.env.PANEL_USERS_JSON = originalUsers;
    if (originalSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = originalSecret;
  }
});
test("mutations reject other origins and login attempts are bounded", () => {
  assert.throws(
    () =>
      assertOrigin(
        new Request("http://localhost:3000/api/admin/records", {
          headers: { Origin: "https://other.example" },
        }),
      ),
    { status: 403 },
  );
  for (let count = 0; count < 10; count++)
    limitLogin("limited-fixture", "test-ip");
  assert.throws(() => limitLogin("limited-fixture", "another-ip"), {
    status: 429,
  });
});
test("media accepts real JPEG/PNG/WebP/PDF and rejects forged or oversized uploads", async () => {
  for (const format of ["jpeg", "png", "webp"] as const) {
    const buffer = await sharp({
      create: { width: 2, height: 2, channels: 3, background: "white" },
    })
      .toFormat(format)
      .toBuffer();
    assert.equal(
      (await validateMedia(buffer, `image/${format}`)).extension,
      format === "jpeg" ? "jpg" : format,
    );
  }
  assert.equal(
    (
      await validateMedia(
        Buffer.from("%PDF-1.4\nfixture\n%%EOF"),
        "application/pdf",
      )
    ).extension,
    "pdf",
  );
  await assert.rejects(
    validateMedia(Buffer.from("<script>alert(1)</script>"), "image/png"),
    { status: 415 },
  );
  await assert.rejects(
    validateMedia(Buffer.from("<svg></svg>"), "image/svg+xml"),
    { status: 415 },
  );
  await assert.rejects(
    validateMedia(Buffer.alloc(maxUpload + 1), "application/pdf"),
    { status: 413 },
  );
});
