import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@insforge/sdk/ssr/middleware";

// Paths that are always reachable without an authenticated session.
const PUBLIC_PATHS = ["/", "/products", "/about", "/contact", "/login", "/register", "/cart"];

/**
 * Next.js 16 proxy (replaces the deprecated `middleware` convention).
 * Refreshes the InsForge auth session cookie on every request and redirects
 * unauthenticated users away from protected page routes (/account, /checkout,
 * /admin). API routes and static assets are never blocked.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico";

  // Public assets / API: refresh the session cookie when possible, but never block.
  if (isPublic) {
    const response = NextResponse.next({ request });
    try {
      await updateSession({
        baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
        anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
        requestCookies: request.cookies as any,
        responseCookies: response.cookies as any,
      });
    } catch {
      // Cookie refresh is best-effort; do not break the response on failure.
    }
    return response;
  }

  // Protected page: refresh session, and redirect to login if refresh fails
  // (which means there is no valid session).
  const response = NextResponse.next({ request });
  try {
    await updateSession({
      baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
      anonKey: process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
      requestCookies: request.cookies as any,
      responseCookies: response.cookies as any,
    });
  } catch {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match everything except static assets.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.gif|.*\\.webp|.*\\.svg).*)",
  ],
};
