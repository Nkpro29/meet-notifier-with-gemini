import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';

export async function GET() {
  try {
    const authUrl = getAuthUrl();
    return NextResponse.json({ url: authUrl });
  } catch (error) {
    console.error('Failed to generate auth URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    );
  }
}
