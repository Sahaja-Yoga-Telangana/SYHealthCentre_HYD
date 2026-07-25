import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Check if request comes from Vercel URL (.vercel.app) or admin subdomain
  const isVercelOrAdminHost = hostname.includes('.vercel.app') || hostname.startsWith('admin.');

  // If visiting root on Vercel URL or admin subdomain, rewrite to /admin
  if (isVercelOrAdminHost && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/admin', req.url));
  }

  // Protect /admin routes and Vercel/admin host
  if (url.pathname.startsWith('/admin') || (isVercelOrAdminHost && url.pathname !== '/login')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // If not authenticated or not Admin role, redirect to login page with callback to /admin
    if (!token || token.role !== 'Admin') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('callbackUrl', '/admin');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/'],
};
