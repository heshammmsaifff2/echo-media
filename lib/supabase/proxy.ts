import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";
import { isLocale, localePath, DEFAULT_LOCALE, type Locale } from "../locale";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const cookieHeader = request.headers.get("cookie") || "";
  if (cookieHeader.length > 16384) {
    const response = NextResponse.next({ request });
    request.cookies.getAll().forEach(({ name }) => {
      if (name.startsWith("sb-")) {
        response.cookies.delete(name);
      }
    });
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split("/")[1] ?? "";

  // API routes must not be redirected to localized routes (/ar/api or /en/api)
  if (pathname.startsWith("/api/") || pathname === "/api") {
    return supabaseResponse;
  }

  // Rewrite any stray localized API requests (e.g. from cached 308 redirects) directly to /api
  if (pathname.startsWith("/en/api/") || pathname.startsWith("/ar/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/(?:en|ar)/, "");
    return NextResponse.rewrite(url);
  }

  // The portal keeps its own unlocalized URLs.
  const isPortal = PORTAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (!isPortal) {
    // Everything else belongs to the localized site tree. A path arriving
    // without a locale (/, /portfolio, an old bookmark) is permanently sent to
    // the right language so there is exactly one indexable URL per page.
    if (!isLocale(firstSegment)) {
      const url = request.nextUrl.clone();
      url.pathname = localePath(preferredLocale(request), pathname);
      return NextResponse.redirect(url, 307);
    }
    return supabaseResponse;
  }

  const isPublicPortal =
    pathname.startsWith("/auth") || pathname.startsWith("/login");

  if (!user && !isPublicPortal) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

const PORTAL_PREFIXES = ["/auth", "/login", "/admin", "/dashboard", "/protected"];

/** Default to Arabic, unless visitor explicitly has a saved choice */
function preferredLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("echo-locale")?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  return DEFAULT_LOCALE; // "ar"
}
