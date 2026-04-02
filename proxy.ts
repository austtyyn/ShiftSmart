import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  // Skip if env vars not yet available (e.g. cold start before .env loads)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const publicPaths = ["/login", "/login/verify", "/onboarding", "/join", "/auth"];
  const isPublicPath = publicPaths.some((p) => pathname.startsWith(p)) || pathname === "/";
  const isApiPath = pathname.startsWith("/api");
  const isAdminPath = pathname.startsWith("/admin");

  // Guard admin routes — must be the configured ADMIN_EMAIL
  if (isAdminPath && user?.email !== process.env.ADMIN_EMAIL) {
    const url = new URL(user ? "/chat" : "/login", request.url);
    return NextResponse.redirect(url);
  }
  const isRootPath = pathname === "/";

  // Redirect unauthenticated users to login
  if (!user && !isPublicPath && !isApiPath) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login
  if (user && pathname === "/login") {
    const dest = user.email === process.env.ADMIN_EMAIL ? "/admin" : "/chat";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Redirect root to correct destination
  if (isRootPath && user) {
    const dest = user.email === process.env.ADMIN_EMAIL ? "/admin" : "/chat";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
