import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/api/wishlists', '/api/items'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Get token from cookie or Authorization header
    let token = request.cookies.get('authToken')?.value;
    if (!token) {
      token = extractTokenFromHeader(
        request.headers.get('Authorization') || ''
      );
    }

    if (!token || !verifyToken(token)) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/wishlists/:path*', '/api/items/:path*'],
};
