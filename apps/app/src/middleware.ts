import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/modules/auth/lib/auth";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

// Reserved paths that should not be treated as organization slugs
const RESERVED_PATHS = [
  // Core app paths
  'docs',
  'api',
  '_next',
  'setup',
  'account',

  // SEO & Bot files
  'robots.txt',
  'sitemap.xml',
  'sitemap',
  'sitemaps',
  'rss.xml',
  'rss',
  'feed.xml',
  'feed',
  'atom.xml',
  'atom',

  // Web App Manifest & PWA 
  'manifest.json',
  'sw.js',
  'service-worker.js',
  'workbox-sw.js',

  // Favicons & Icons
  'favicon.ico',
  'favicon.png',
  'favicon.svg',
  'apple-touch-icon.png',
  'icon.png',
  'icon.svg',
  'apple-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'mstile-150x150.png',

  // OpenGraph & Social Media
  'og-image.png',
  'og-image.jpg',
  'twitter-image.png',
  'twitter-image.jpg',
  'social.png',
  'social.jpg',

  // Well-known paths (for verification, security, etc)
  '.well-known',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and other assets
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the path starts with a reserved path
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  if (firstSegment && RESERVED_PATHS.includes(firstSegment)) {
    // Let reserved paths pass through (will be handled by Vercel rewrites or 404)
    return NextResponse.next();
  }

  // Routes that should redirect authenticated users
  const authRedirectRoutes = ["/", "/sign-in"];

  // Routes that are always public (no redirect even if authenticated)
  const alwaysPublicRoutes = ["/verify-email", "/accept-invitation"];

  // Check if current path is always public
  const isAlwaysPublicRoute = alwaysPublicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's an always public route, allow access
  if (isAlwaysPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, check authentication
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    // Check if current path should redirect authenticated users
    const shouldRedirectIfAuthenticated = authRedirectRoutes.some(route =>
      pathname === route || pathname.startsWith(`${route}/`)
    );

    // If no session and it's an auth redirect route, allow access (show landing/login page)
    if (!session && shouldRedirectIfAuthenticated) {
      return NextResponse.next();
    }

    // If no session for any other route, redirect to sign-in
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    // If authenticated and on auth redirect routes, redirect to appropriate page
    if (session && shouldRedirectIfAuthenticated) {
      // Get user's organizations
      const organizations = await auth.api.listOrganizations({ headers: requestHeaders });

      // If user has no organizations, redirect to setup
      if (!organizations || organizations.length === 0) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }

      // If user has organizations, redirect to first org
      const firstOrg = organizations[0];
      if (!firstOrg) {
        // Fallback: if somehow no orgs exist, redirect to setup
        return NextResponse.redirect(new URL("/setup", request.url));
      }
      return NextResponse.redirect(new URL(`/${firstOrg.slug}/sites`, request.url));
    }

    // Handle setup route - user is authenticated but might not have orgs
    if (pathname === "/setup") {
      return NextResponse.next();
    }

    // Handle account routes - user is authenticated and can access account pages
    if (pathname.startsWith("/account")) {
      return NextResponse.next();
    }

    // For organization routes (core routes), check if user has organizations
    const orgRouteMatch = pathname.match(/^\/([^\/]+)(?:\/.*)?$/);

    if (orgRouteMatch) {
      const [, orgSlug] = orgRouteMatch;

      // Get user's organizations 
      const organizations = await auth.api.listOrganizations({ headers: requestHeaders });

      // If user has no organizations, redirect to setup
      if (!organizations || organizations.length === 0) {
        return NextResponse.redirect(new URL("/setup", request.url));
      }

      // Check if the requested org exists and user has access
      const requestedOrg = organizations?.find((org: Organization) => org.slug === orgSlug);

      if (!requestedOrg) {
        // If org doesn't exist or user doesn't have access, redirect to first available org
        const firstOrg = organizations[0];
        if (!firstOrg) {
          // Fallback: if somehow no orgs exist, redirect to setup
          return NextResponse.redirect(new URL("/setup", request.url));
        }
        return NextResponse.redirect(new URL(`/${firstOrg.slug}/sites`, request.url));
      }

      // For organization root routes, redirect to sites
      if (pathname === `/${orgSlug}` || pathname === `/${orgSlug}/`) {
        return NextResponse.redirect(new URL(`/${orgSlug}/sites`, request.url));
      }
    }

  } catch (error) {
    // If there's an error getting the session, redirect to sign-in
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs", // Enable Node.js runtime for Next.js 15.2+
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