// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['cs', 'en'];
const defaultLocale = 'cs';

function getLocale(request: NextRequest): string {
  // 1. Zkusíme cookie (pokud si uživatel jazyk přepnul)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Detekce z prohlížeče
  const acceptLanguage = request.headers.get('Accept-Language') || '';
  const preferredLocale = acceptLanguage.split(',')[0].split('-')[0];
  if (locales.includes(preferredLocale)) {
    return preferredLocale;
  }
  
  // 3. Výchozí
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('auth-session');

  // --- 1. Správa jazyků ---
  // Kontrolujeme, jestli cesta už obsahuje jazyk (např. /cs/projects)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Pokud cesta jazyk nemá (je to /, /admin, /login)
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    
    // Přesměrujeme / na /cs (nebo /en)
    // Přesměrujeme /admin na /cs/admin
    // Přesměrujeme /login na /cs/login
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // --- 2. Ochrana adminu (pokud už cesta jazyk má) ---
  
  // Pokud je na /cs/admin (nebo /en/admin) a NENÍ přihlášen
  if (pathname.includes('/admin') && !sessionCookie) {
    const locale = pathname.split('/')[1]; // Zachováme jazyk
    const loginUrl = new URL(`/${locale}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Pokud je na /cs/login (nebo /en/login) a JE přihlášen
  if (pathname.includes('/login') && sessionCookie) {
    const locale = pathname.split('/')[1];
    const adminUrl = new URL(`/${locale}/admin`, request.url);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

// 3. Klíčový Matcher
// Toto zachytí VŠECHNY cesty KROMĚ:
// - /api/...
// - /_next/static/...
// - /_next/image/...
// - jakéhokoliv souboru s příponou (např. .png, .ico, .svg, .jpg)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};