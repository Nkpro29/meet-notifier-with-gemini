import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-auth';
import { serialize } from 'cookie';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
  }

  try {
    const tokens = await getTokensFromCode(code);
    
    // Store tokens in HTTP-only cookie
    const cookie = serialize('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    const response = NextResponse.redirect(new URL('/meet/monitor', request.url));
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.redirect(new URL('/auth/error?error=token_exchange_failed', request.url));
  }
}
