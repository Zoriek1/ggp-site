import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(first)) {
    return NextResponse.next();
  }

  const preferred = pickPreferredLocale(req.headers.get("accept-language"));
  const url = req.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

function pickPreferredLocale(header: string | null): string {
  if (!header) return DEFAULT_LOCALE;
  const langs = header
    .split(",")
    .map((s) => s.trim().split(";")[0].toLowerCase());
  for (const l of langs) {
    if (l.startsWith("en")) return "en";
    if (l.startsWith("pt")) return "pt";
  }
  return DEFAULT_LOCALE;
}

export const config = {
  matcher: ["/((?!_next|api|sitemap.*|robots.txt|favicon\\.ico).*)"],
};
