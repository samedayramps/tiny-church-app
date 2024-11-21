import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',  // Homepage
  '/login', 
  '/signup', 
  '/forgot-password', 
  '/reset-password'
];

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/settings',
  '/members',
  '/events',
  '/groups',
  '/messaging',
  '/profile'
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req, res });

  // Get session
  const { data: { session } } = await supabase.auth.getSession();

  // Get the current path
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(path)) {
    return res;
  }

  // Check if the path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    path.startsWith(route)
  );

  // If it's a protected route and user is not authenticated
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages
  if (session && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

// Update the matcher to exclude the homepage and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - / (homepage)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    '/((?!$|_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
}; 