import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/lib/server/auth";

const root = path.resolve(process.cwd(), "../work/e2e");
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });
await cp(
  path.resolve(process.cwd(), "../content"),
  path.join(root, "content"),
  { recursive: true },
);
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3100",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CONTENT_DRIVER: "local",
      CONTENT_ROOT: root,
      CONTENT_ALLOW_LOCAL_WRITES: "true",
      MEDIA_DIR: path.join(root, "media"),
      CONTENT_CACHE_DIR: path.join(root, "cache"),
      NEXT_DIST_DIR: ".next-e2e",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
      SESSION_SECRET: randomBytes(32).toString("hex"),
      PANEL_USERS_JSON: JSON.stringify([
        {
          id: "test-group",
          username: "grupo",
          passwordHash: hashPassword("fixture-only-password"),
        },
      ]),
    },
  },
);
for (const signal of ["SIGTERM", "SIGINT"] as const)
  process.on(signal, () => child.kill(signal));
child.on("exit", (code) => process.exit(code || 0));
