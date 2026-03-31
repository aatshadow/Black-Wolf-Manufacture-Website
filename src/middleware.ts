import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // KEA auth is handled client-side via Supabase JS SDK
  // This middleware only handles non-auth concerns
  return NextResponse.next();
}

export const config = {
  matcher: ['/kea/:path*'],
};
