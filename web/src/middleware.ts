import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "./i18n/config";

const PUBLIC_FILE = /\.(.*)$/;

// Rotas de metadata geradas pelo Next (sem extensão) que NÃO devem receber
// prefixo de idioma — senão o crawler recebe um 307 em vez da imagem.
const METADATA_ROUTE = /^\/(opengraph-image|twitter-image|apple-icon|icon|manifest\.webmanifest)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    METADATA_ROUTE.test(pathname) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];
  if ((LOCALES as readonly string[]).includes(first)) {
    // Propaga o idioma resolvido nos headers da REQUISIÇÃO para que o layout
    // raiz (Server Component) o leia via headers() e defina <html lang>.
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-lang", first);
    return NextResponse.next({ request: { headers: requestHeaders } });
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
