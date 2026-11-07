import { NextRequest, NextResponse } from "next/server";
import { assertOrigin, sessionCookie } from "@/lib/server/auth";
import { failure } from "@/lib/server/http";

export async function POST(req: NextRequest) {
  try {
    assertOrigin(req);
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set(sessionCookie, "", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return response;
  } catch (error) {
    return failure(error);
  }
}
