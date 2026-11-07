import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";

test("media backup restores stable URLs and detects a corrupt archive", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ggp-backup-")),
    run = promisify(execFile);
  try {
    const source = path.join(root, "media"),
      backup = path.join(root, "backup"),
      restored = path.join(root, "restored");
    await mkdir(source);
    const bytes = Buffer.from("%PDF-1.4\nbackup fixture\n%%EOF"),
      name = `${createHash("sha256").update(bytes).digest("hex")}.pdf`;
    await writeFile(path.join(source, name), bytes);
    const result = await run(process.execPath, [
      "scripts/media-backup.mjs",
      "backup",
      source,
      backup,
    ]);
    const archive = result.stdout.trim();
    await run(process.execPath, [
      "scripts/media-backup.mjs",
      "restore",
      archive,
      restored,
    ]);
    assert.deepEqual(await readFile(path.join(restored, name)), bytes);
    await writeFile(archive, "corrupted");
    await assert.rejects(
      run(process.execPath, [
        "scripts/media-backup.mjs",
        "restore",
        archive,
        path.join(root, "other"),
      ]),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
