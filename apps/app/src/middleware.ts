import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and auth routes
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/verify-email") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // If accessing root and user is authenticated, they'll be redirected by the page component
  if (pathname === "/") {
    return NextResponse.next();
  }

  // For organization routes, ensure they follow the pattern /{orgSlug}/{page}
  const orgRouteMatch = pathname.match(/^\/([^\/]+)\/?(dashboard|analytics|settings)?$/);

  if (orgRouteMatch) {
    const [, orgSlug, page] = orgRouteMatch;

    // If no page specified, redirect to dashboard
    if (!page) {
      return NextResponse.redirect(new URL(`/${orgSlug}/dashboard`, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};