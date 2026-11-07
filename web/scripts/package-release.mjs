import { access, cp, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const web = fileURLToPath(new URL("../", import.meta.url));
const root = path.resolve(web, "..");
if (!process.argv[2])
  throw new Error("Uso: npm run package:release -- /caminho/para/nova-release");
const destination = path.resolve(process.argv[2]);
if (destination === root || destination.startsWith(`${web}${path.sep}`))
  throw new Error("Crie a release fora da pasta web/.");
await access(path.join(web, ".next/standalone/web/server.js"));
try {
  await access(destination);
  throw new Error("O destino já existe. Use uma nova pasta de release.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await mkdir(path.dirname(destination), { recursive: true });
const temporary = await mkdtemp(
  path.join(path.dirname(destination), ".release-"),
);
try {
  await cp(path.join(web, ".next/standalone"), temporary, {
    recursive: true,
    filter: (source) => !path.basename(source).startsWith(".env"),
  });
  await cp(
    path.join(web, ".next/static"),
    path.join(temporary, "web/.next/static"),
    { recursive: true },
  );
  try {
    await access(path.join(web, "public"));
    await cp(path.join(web, "public"), path.join(temporary, "web/public"), {
      recursive: true,
    });
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await mkdir(path.join(temporary, "web/scripts"), { recursive: true });
  await cp(
    path.join(web, "scripts/media-backup.mjs"),
    path.join(temporary, "web/scripts/media-backup.mjs"),
  );
  await cp(path.join(root, "deploy"), path.join(temporary, "deploy"), {
    recursive: true,
  });
  await cp(
    path.join(root, "docs/DEPLOY.md"),
    path.join(temporary, "DEPLOY.md"),
  );
  await rename(temporary, destination);
  console.log(`Release pronta: ${destination}`);
} catch (error) {
  await rm(temporary, { recursive: true, force: true });
  throw error;
}
