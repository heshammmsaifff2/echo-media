import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run the session proxy on page requests only.
     *
     * Every static asset extension the site serves must be listed here. Media
     * left off this list gets treated as a page, fails the auth check, and is
     * redirected to /auth/login — which silently breaks the asset for every
     * signed-out visitor.
     */
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|mov|MOV|m4v|mp3|m4a|wav|woff|woff2|ttf|otf|txt|xml|json)$).*)",
  ],
};
