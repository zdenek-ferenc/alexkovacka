
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get('auth-session');
  
  if (!sessionCookie && req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  if (sessionCookie && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  return NextResponse.next();
}


export const config = {
  matcher: ['/admin/:path*', '/login'],
};