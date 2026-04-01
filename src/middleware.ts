import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // If the root URL has auth params (from Supabase email confirmation),
  // redirect to the auth callback page which handles it client-side
  if (request.nextUrl.pathname === '/' && request.nextUrl.searchParams.has('access_token')) {
    return NextResponse.redirect(new URL('/kea/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/kea/:path*'],
};
