import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  assertOrigin,
  createSession,
  limitLogin,
  sessionCookie,
} from "@/lib/server/auth";
import { failure, jsonBody } from "@/lib/server/http";

export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    assertOrigin(req);
    const { username, password } = z
      .object({
        username: z.string().trim().min(1).max(128),
        password: z.string().min(1).max(512),
      })
      .parse(await jsonBody(req, 4096));
    limitLogin(username, req.headers.get("x-real-ip") || "unknown");
    const token = await createSession(username, password);
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(sessionCookie, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 3600,
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
