import { NextRequest, NextResponse } from 'next/server';
import { TempAuthService } from '@/lib/auth/temp-auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes, API routes, and static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/' ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  if (pathname.startsWith('/parent') || pathname.startsWith('/child')) {
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      // Redirect to sign in if no session
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const user = TempAuthService.validateSession(sessionToken);

      if (!user) {
        // Invalid session, redirect to sign in
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Check role-based access
      if (pathname.startsWith('/parent') && user.role !== 'parent') {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // Allow parents to access child dashboards for supervision
      // Only block child routes if user is not a parent and not a child
      if (pathname.startsWith('/child') && user.role !== 'child' && user.role !== 'parent') {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      // User is authenticated and authorized
      return NextResponse.next();

    } catch (error) {
      console.error('Auth middleware error:', error);
      // Redirect to sign in on error
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};