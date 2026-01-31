import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Admin routes - only admin can access
  if (pathname.startsWith('/admin')) {
    if (!token || token.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protected routes - require login (account, checkout)
  if (pathname.startsWith('/account')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  if (pathname.startsWith('/checkout')) {
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes (login/register) - redirect if already logged in
  if (pathname.startsWith('/auth')) {
    if (token) {
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
      const redirectTo = callbackUrl ?? '/account';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/checkout/:path*',
    '/auth/:path*',
  ],
};
