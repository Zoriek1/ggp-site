import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers.js";
import type { NextRequest } from "next/server";
import { PortalError } from "./repository";

export const sessionCookie = "ggp_session";
type User = {
  id: string;
  username: string;
  passwordHash: string;
  active?: boolean;
};
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}
export function verifyPassword(password: string, encoded: string): boolean {
  const [algorithm, salt, hash] = encoded.split(":");
  if (
    algorithm !== "scrypt" ||
    !/^[a-f0-9]{32}$/.test(salt || "") ||
    !/^[a-f0-9]{128}$/.test(hash || "")
  )
    return false;
  const actual = scryptSync(password, salt, 64),
    expected = Buffer.from(hash, "hex");
  return timingSafeEqual(actual, expected);
}
function users(): User[] {
  try {
    const values: unknown = JSON.parse(process.env.PANEL_USERS_JSON || "[]");
    if (!Array.isArray(values)) return [];
    return values.filter(
      (u): u is User =>
        !!u &&
        typeof u.id === "string" &&
        typeof u.username === "string" &&
        typeof u.passwordHash === "string" &&
        u.active !== false,
    );
  } catch {
    return [];
  }
}
function secret(): Uint8Array {
  const key = process.env.SESSION_SECRET;
  if (!key || key.length < 32)
    throw new PortalError(
      "Configure SESSION_SECRET com pelo menos 32 caracteres.",
      503,
    );
  return new TextEncoder().encode(key);
}
const version = (user: User) =>
  createHash("sha256").update(user.passwordHash).digest("hex");
export async function createSession(
  username: string,
  password: string,
): Promise<string> {
  const configured = users();
  if (!configured.length)
    throw new PortalError(
      "O acesso ao painel ainda não foi configurado no servidor.",
      503,
    );
  const user = configured.find((u) => u.username === username);
  // Keep expensive verification even for an unknown username.
  const valid = verifyPassword(
    password,
    user?.passwordHash || `scrypt:${"0".repeat(32)}:${"0".repeat(128)}`,
  );
  if (!user || !valid)
    throw new PortalError("Usuário ou senha incorretos.", 401);
  return new SignJWT({ version: version(user) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("ggp-portal")
    .setAudience("ggp-panel")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}
export async function sessionUser(
  token?: string,
): Promise<{ id: string; username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "ggp-portal",
      audience: "ggp-panel",
    });
    const user = users().find(
      (u) => u.id === payload.sub && version(u) === payload.version,
    );
    return user ? { id: user.id, username: user.username } : null;
  } catch {
    return null;
  }
}
export async function currentUser() {
  return sessionUser((await cookies()).get(sessionCookie)?.value);
}
export function assertOrigin(req: Request): void {
  const expected = new URL(
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || req.url,
  ).origin;
  if (req.headers.get("origin") !== expected)
    throw new PortalError("Origem da requisição não permitida.", 403);
}
export async function requireUser(req: NextRequest, mutation = false) {
  if (mutation) assertOrigin(req);
  const user = await sessionUser(req.cookies.get(sessionCookie)?.value);
  if (!user) throw new PortalError("Entre no painel para continuar.", 401);
  return user;
}
const attemptsGlobal = globalThis as typeof globalThis & {
  ggpAttempts?: Map<string, { count: number; expires: number }>;
};
const attempts = (attemptsGlobal.ggpAttempts ??= new Map());
export function limitLogin(username: string, ip: string): void {
  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.expires < now) attempts.delete(key);
  for (const [key, limit] of [
    [`ip:${ip}`, 30],
    [`user:${username.toLowerCase()}`, 10],
  ] as const) {
    const entry = attempts.get(key) || { count: 0, expires: now + 15 * 60000 };
    if (entry.count >= limit)
      throw new PortalError(
        "Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.",
        429,
      );
    entry.count++;
    attempts.set(key, entry);
  }
}
