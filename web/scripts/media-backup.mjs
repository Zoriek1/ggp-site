import {
  mkdir,
  readdir,
  readFile,
  writeFile,
  copyFile,
  mkdtemp,
  rm,
  rename,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
const run = promisify(execFile);
const [mode, sourceArg, destinationArg] = process.argv.slice(2);
const allowed = /^[a-f0-9]{64}\.(jpg|png|webp|pdf)$/;
if (!["backup", "restore"].includes(mode) || !sourceArg || !destinationArg)
  throw new Error(
    "Uso: node scripts/media-backup.mjs backup MEDIA_DIR BACKUP_DIR | restore ARQUIVO.tar.gz MEDIA_DIR",
  );
const source = path.resolve(sourceArg),
  destination = path.resolve(destinationArg);
const digest = async (file) => {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
};
if (mode === "backup") {
  if (destination === source || destination.startsWith(`${source}${path.sep}`))
    throw new Error("Guarde o backup fora do diretório de mídias.");
  const files = await readdir(source, { withFileTypes: true });
  if (files.some((file) => !file.isFile() || !allowed.test(file.name)))
    throw new Error("O diretório de mídias contém entradas inesperadas.");
  await mkdir(destination, { recursive: true });
  const archive = path.join(
    destination,
    `media-${new Date().toISOString().replace(/[:.]/g, "-")}.tar.gz`,
  );
  await run("tar", ["-czf", archive, "-C", source, "."]);
  await writeFile(`${archive}.sha256`, `${await digest(archive)}\n`);
  console.log(archive);
} else {
  const expected = (await readFile(`${source}.sha256`, "utf8")).trim();
  if ((await digest(source)) !== expected)
    throw new Error("O checksum do backup não confere.");
  const { stdout } = await run("tar", ["-tzf", source], {
    maxBuffer: 20 * 1024 * 1024,
  });
  if (
    stdout
      .split("\n")
      .filter(Boolean)
      .some(
        (entry) => entry !== "./" && !allowed.test(entry.replace(/^\.\//, "")),
      )
  )
    throw new Error("Entradas inválidas no backup.");
  const listing = await run("tar", ["-tvzf", source], {
    maxBuffer: 20 * 1024 * 1024,
  });
  if (
    listing.stdout
      .split("\n")
      .filter(Boolean)
      .some((line) => !line.startsWith("-") && !line.startsWith("d"))
  )
    throw new Error("O backup contém links ou tipos não permitidos.");
  await mkdir(destination, { recursive: true });
  const temporary = await mkdtemp(
    path.join(path.dirname(destination), ".restore-"),
  );
  try {
    await run("tar", [
      "-xzf",
      source,
      "-C",
      temporary,
      "--no-same-owner",
      "--no-same-permissions",
    ]);
    for (const entry of await readdir(temporary, { withFileTypes: true })) {
      if (!entry.isFile() || !allowed.test(entry.name))
        throw new Error("O backup contém links ou entradas inesperadas.");
      const file = path.join(temporary, entry.name),
        expectedName = entry.name.split(".")[0];
      if ((await digest(file)) !== expectedName)
        throw new Error(`Arquivo corrompido: ${entry.name}`);
    }
    for (const name of await readdir(temporary)) {
      const staged = path.join(destination, `.${name}.restore`);
      await copyFile(path.join(temporary, name), staged);
      await rename(staged, path.join(destination, name));
    }
    console.log("Mídias restauradas e verificadas.");
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}
