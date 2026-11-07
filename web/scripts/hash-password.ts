import { readFileSync } from "node:fs";
import { hashPassword } from "../src/lib/server/auth";
if (process.stdin.isTTY) {
  console.error(
    "Receba a senha pela entrada padrão. Consulte docs/DEPLOY.md; não passe a senha como argumento.",
  );
  process.exit(1);
}
const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
if (password.length < 12 || password.length > 512)
  throw new Error("Use uma senha entre 12 e 512 caracteres.");
console.log(hashPassword(password));
