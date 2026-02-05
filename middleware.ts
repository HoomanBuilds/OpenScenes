import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { shouldEnforceAuth } from '@/lib/config/limits';

const protectedPaths = ['/api/render'];

export async function middleware(request: NextRequest) {
  if (!shouldEnforceAuth()) {
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/render/:path*'],
};
