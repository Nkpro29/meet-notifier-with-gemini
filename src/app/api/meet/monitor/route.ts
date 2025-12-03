import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthClient } from '@/lib/google-auth';
import { getTranscripts, getTranscriptEntries } from '@/lib/google-meet';
import { detectNameMentions } from '@/lib/gemini';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conferenceId = searchParams.get('conferenceId');
    const nameToDetect = searchParams.get('name');

    if (!conferenceId || !nameToDetect) {
      return NextResponse.json(
        { error: 'conferenceId and name are required' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    if (!tokensCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const tokens = JSON.parse(tokensCookie.value);
    const auth = createAuthClient(tokens);

    // Get transcripts for the conference
    const transcripts = await getTranscripts(auth, conferenceId);
    
    if (transcripts.length === 0) {
      return NextResponse.json({ 
        mentions: [],
        message: 'No transcripts available yet. Please wait for the meeting to end and transcripts to be processed.'
      });
    }

    // Get the first transcript (usually there's only one per meeting)
    const transcriptId = transcripts[0].name?.split('/').pop();
    
    if (!transcriptId) {
      return NextResponse.json({ mentions: [], message: 'Invalid transcript data' });
    }

    // Get all transcript entries
    const { entries } = await getTranscriptEntries(auth, conferenceId, transcriptId, 100);
    
    if (entries.length === 0) {
      return NextResponse.json({ mentions: [], message: 'No transcript entries available' });
    }

    // Analyze each entry for name mentions using Gemini
    const mentions = [];
    
    for (const entry of entries) {
      if (!entry.text) continue;
      
      const detection = await detectNameMentions(entry.text, nameToDetect);
      
      if (detection.mentioned) {
        mentions.push({
          text: entry.text,
          participant: entry.participant || 'Unknown',
          timestamp: entry.startTime || new Date().toISOString(),
          confidence: detection.confidence,
          context: detection.context[0] || entry.text
        });
      }
    }

    return NextResponse.json({ 
      mentions,
      totalEntries: entries.length,
      transcriptState: transcripts[0].state
    });
  } catch (error: any) {
    console.error('Monitor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to monitor meeting' },
      { status: 500 }
    );
  }
}
