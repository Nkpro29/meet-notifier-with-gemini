import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    const authenticated = !!tokensCookie?.value;
    
    return NextResponse.json({ authenticated });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
