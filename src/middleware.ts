import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { createServerClient } from "@supabase/ssr";

const publicPaths = ['/', '/login', '/register', '/forgot-password', '/verify-email'];
const authPaths = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  // Refresh session first
  const response = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Public paths (non-auth) — pass through
  if (publicPaths.includes(pathname) && !authPaths.includes(pathname)) {
    return response;
  }

  // API routes handle their own auth — pass through
  if (pathname.startsWith('/api/')) {
    return response;
  }

  // Create supabase client to inspect the current user
  // NOTE: user_metadata.role must be set at registration time for role-based
  // redirects to work. Currently the register endpoint sets full_name and
  // phone in user_metadata but does NOT set role. Role-based redirects for
  // already-authenticated users on auth pages will fall back to /dashboard until
  // this gap is addressed in the registration flow.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll() { /* cookies already set by updateSession */ },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Auth pages when already logged in → redirect to the appropriate portal
  if (authPaths.includes(pathname) && user) {
    const role = user.user_metadata?.role as string | undefined;
    if (role === 'platform_admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'bakery_admin') return NextResponse.redirect(new URL('/bakery', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Landing page — no auth needed
  if (pathname === '/') return response;

  // All other routes are protected — require a valid session
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = user.user_metadata?.role as string | undefined;

  // Role-based access control
  if (pathname.startsWith('/admin') && role !== 'platform_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  if (pathname.startsWith('/bakery') && role !== 'bakery_admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
