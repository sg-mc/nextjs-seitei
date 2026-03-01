import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const ua = req.headers.get("user-agent") || "";
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for") ||
    "";

  console.log(`[req] ${req.method} ${url.pathname}${url.search} ua="${ua}" ip="${ip}"`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 以下のパスで始まるもの以外の全てのリクエストにマッチさせる:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, sitemap.xml, robots.txt (メタデータファイル)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
