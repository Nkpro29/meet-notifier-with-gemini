import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const meet = google.meet('v2');

export async function getConferenceRecords(
  auth: OAuth2Client,
  pageSize: number = 10,
  pageToken?: string
) {
  try {
    const response = await meet.conferenceRecords.list({
      auth,
      pageSize,
      pageToken,
      filter: 'space.meetingCode != ""'
    });
    
    return {
      conferenceRecords: response.data.conferenceRecords || [],
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('Failed to list conferences:', error);
    throw error;
  }
}

export async function getLatestConferenceByCode(
  auth: OAuth2Client,
  meetingCode: string
) {
  try {
    // The filter format for meeting code is "space.meetingCode = 'abc-defg-hij'"
    // Note: The API might require exact match or specific filter syntax.
    // Based on docs, it's usually `space.meetingCode="code"`
    const response = await meet.conferenceRecords.list({
      auth,
      filter: `space.meetingCode="${meetingCode}"`
    });
    
    const records = response.data.conferenceRecords || [];
    
    if (records.length === 0) {
      return null;
    }

    // Sort by start time descending to get the latest one
    // The API might not guarantee order, so we sort manually
    return records.sort((a, b) => {
      const timeA = new Date(a.startTime || 0).getTime();
      const timeB = new Date(b.startTime || 0).getTime();
      return timeB - timeA;
    })[0];
  } catch (error) {
    console.error('Failed to get conference by code:', error);
    throw error;
  }
}

export async function getConferenceDetails(
  auth: OAuth2Client,
  conferenceId: string
) {
  try {
    const response = await meet.conferenceRecords.get({
      auth,
      name: `conferenceRecords/${conferenceId}`
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get conference:', error);
    throw error;
  }
}

export async function getRecordings(
  auth: OAuth2Client,
  conferenceId: string
) {
  try {
    const response = await meet.conferenceRecords.recordings.list({
      auth,
      parent: `conferenceRecords/${conferenceId}`
    });
    
    return response.data.recordings || [];
  } catch (error) {
    console.error('Failed to list recordings:', error);
    throw error;
  }
}

export async function getTranscripts(
  auth: OAuth2Client,
  conferenceId: string
) {
  try {
    const response = await meet.conferenceRecords.transcripts.list({
      auth,
      parent: `conferenceRecords/${conferenceId}`
    });
    
    return response.data.transcripts || [];
  } catch (error) {
    console.error('Failed to list transcripts:', error);
    throw error;
  }
}

export async function getTranscriptEntries(
  auth: OAuth2Client,
  conferenceId: string,
  transcriptId: string,
  pageSize: number = 100,
  pageToken?: string
) {
  try {
    const response = await meet.conferenceRecords.transcripts.entries.list({
      auth,
      parent: `conferenceRecords/${conferenceId}/transcripts/${transcriptId}`,
      pageSize,
      pageToken
    });
    
    return {
      entries: response.data.entries || [],
      nextPageToken: response.data.nextPageToken
    };
  } catch (error) {
    console.error('Failed to list transcript entries:', error);
    throw error;
  }
}
