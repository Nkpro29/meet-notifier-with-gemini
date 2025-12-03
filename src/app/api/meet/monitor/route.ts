import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthClient } from '@/lib/google-auth';
import { getTranscripts, getTranscriptEntries, getLatestConferenceByCode } from '@/lib/google-meet';
import { detectNameMentions } from '@/lib/gemini';
import { sendMentionNotification } from '@/lib/email';
import { oauth2Client } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let conferenceId = searchParams.get('conferenceId');
    const nameToDetect = searchParams.get('name');

    if (!conferenceId || !nameToDetect) {
      return NextResponse.json(
        { error: 'conferenceId and name are required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const tokensCookie = cookieStore.get('google_tokens');
    
    if (!tokensCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const tokens = JSON.parse(tokensCookie.value);
    const auth = createAuthClient(tokens);

    // Check if conferenceId is a meeting code (xxx-yyyy-zzz)
    const meetingCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
    if (meetingCodeRegex.test(conferenceId)) {
      const conference = await getLatestConferenceByCode(auth, conferenceId);
      if (!conference || !conference.name) {
        return NextResponse.json(
          { error: 'No conference record found for this meeting code' },
          { status: 404 }
        );
      }
      // conference.name is like "conferenceRecords/ID"
      conferenceId = conference.name.split('/').pop()!;
    }

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
        const mentionDetails = {
          text: entry.text,
          participant: entry.participant || 'Unknown',
          timestamp: entry.startTime || new Date().toISOString(),
          confidence: detection.confidence,
          context: detection.context[0] || entry.text,
          conferenceId
        };

        mentions.push(mentionDetails);

        // Get user email and send notification
        try {
          const { email } = await oauth2Client.getTokenInfo(tokens.access_token);
          if (email) {
            // TODO: Add better debouncing/deduplication here
            // For now, we rely on the client polling interval and maybe we should check if we already sent this?
            // But since this is a stateless route, we might send duplicates if the same transcript entry is processed again.
            // Ideally we should store sent mentions in a DB or check a "last processed time" param from client.
            // For this MVP, we'll just send it.
            await sendMentionNotification(email, mentionDetails);
          }
        } catch (err) {
          console.error('Failed to get user email or send notification:', err);
        }
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
