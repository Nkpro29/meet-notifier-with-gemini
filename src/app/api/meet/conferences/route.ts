import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthClient } from '@/lib/google-auth';
import { getConferenceRecords } from '@/lib/google-meet';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    if (!tokensCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const tokens = JSON.parse(tokensCookie.value);
    const auth = createAuthClient(tokens);

    const { conferenceRecords } = await getConferenceRecords(auth, 20);
    
    return NextResponse.json({ conferences: conferenceRecords });
  } catch (error: any) {
    console.error('Failed to fetch conferences:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conferences' },
      { status: 500 }
    );
  }
}
