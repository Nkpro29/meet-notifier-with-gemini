# MeetMention - Google Meet Name Monitoring App

AI-powered monitoring for Google Meet sessions. Get instant notifications when you're mentioned in meetings, even when you're away.

## Features

- 🔐 **Google OAuth Integration** - Secure authentication with Google
- 📹 **Meet API Access** - Fetch meeting recordings and transcripts
- 🤖 **AI-Powered Detection** - Uses Gemini AI to detect name mentions in context
- 🔔 **Real-Time Notifications** - Browser notifications when your name is mentioned
- 🔄 **Auto-Polling** - Automatically checks for new mentions every 10 seconds
- 📊 **Confidence Scores** - AI provides confidence levels for each detection

## Prerequisites

Before you begin, you need:

1. **Google Cloud Project** with:
   - Google Meet API enabled
   - OAuth 2.0 credentials
2. **Gemini API Key** from Google AI Studio

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Google Cloud Console

#### Enable APIs
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Library**
4. Enable the following APIs:
   - **Google Meet API**
   - **Google Drive API**

#### Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Select **Web Application**
4. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback` (development)
   - `https://yourdomain.com/api/auth/callback` (production)
5. Copy the **Client ID** and **Client Secret**

### 3. Get Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the generated API key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Next.js Secret (generate a random 32+ character string)
NEXTAUTH_SECRET=your_random_secret_key_min_32_chars
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

### 1. Authentication Flow
- User clicks "Sign in with Google"
- OAuth consent screen requests permissions:
  - View Google Meet recordings
  - Access meeting transcripts
  - Read basic profile information
- Tokens stored securely in HTTP-only cookies

### 2. Monitoring Process
- Select a past meeting from the dropdown
- Enter the name to monitor
- Click "Start Monitoring"
- App polls Google Meet API every 10 seconds
- Gemini AI analyzes transcript entries for name mentions
- Browser notifications appear for new mentions

### 3. AI Detection
Gemini AI analyzes each transcript entry to:
- Detect name variations (first name, last name, nicknames)
- Understand context to avoid false positives
- Provide confidence scores (0-100%)
- Extract relevant context around mentions

## Important Notes

⚠️ **Transcript Availability**
- Transcripts are only available **after** the meeting has ended
- Processing takes **15-60 minutes** after meeting conclusion
- Recording must be **enabled** during the meeting
- Meeting must have transcription feature enabled

⚠️ **API Limitations**
- Google Meet API only provides post-meeting artifacts
- No real-time streaming of live meeting audio
- Rate limits apply to API requests

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── google/route.ts      # OAuth URL generator
│   │   │   │   ├── callback/route.ts    # OAuth callback handler
│   │   │   │   └── check/route.ts       # Auth status checker
│   │   │   └── meet/
│   │   │       ├── conferences/route.ts # List meetings
│   │   │       └── monitor/route.ts     # Monitor for mentions
│   │   ├── auth/
│   │   │   ├── google/page.tsx          # Sign in page
│   │   │   └── error/page.tsx           # Auth error page
│   │   ├── meet/
│   │   │   └── monitor/page.tsx         # Main monitoring interface
│   │   └── page.tsx                     # Homepage
│   └── lib/
│       ├── google-auth.ts               # OAuth client setup
│       ├── google-meet.ts               # Meet API functions
│       └── gemini.ts                    # AI detection logic
├── .env.local                           # Environment variables
└── README.md
```

## API Routes

### Authentication
- `GET /api/auth/google` - Get OAuth authorization URL
- `GET /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/check` - Check authentication status

### Meet Monitoring
- `GET /api/meet/conferences` - List recent conferences
- `GET /api/meet/monitor?conferenceId=<id>&name=<name>` - Monitor for name mentions

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Google Meet API** - Access meeting data
- **Gemini AI** - Natural language understanding
- **googleapis** - Official Google API client
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide Icons** - Icon library

## Troubleshooting

### "Not authenticated" error
- Clear browser cookies and sign in again
- Check that OAuth credentials are correct in `.env.local`

### "No conferences found"
- Ensure you've attended at least one recorded Google Meet
- Wait for meetings to fully end and process
- Check that you have proper permissions to access the meetings

### "No transcripts available"
- Transcripts take 15-60 minutes to process after meeting ends
- Recording must have been enabled during the meeting
- Meeting language must be supported for transcription

### Gemini API errors
- Verify your `GEMINI_API_KEY` is correct
- Check API quota limits in Google AI Studio
- Fallback to simple text matching if AI unavailable

## Security Considerations

- OAuth tokens stored in HTTP-only cookies (not accessible via JavaScript)
- All API routes validate authentication
- Sensitive credentials in environment variables only
- No long-term token storage in browser

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI to production URL
5. Deploy

### Other Platforms

Ensure the platform supports:
- Node.js runtime
- Environment variables
- Next.js App Router

## Future Enhancements

- [ ] Support for live meeting monitoring (when API available)
- [ ] Email notifications in addition to browser notifications
- [ ] Multiple name monitoring simultaneously
- [ ] Historical mention analytics and reports
- [ ] Webhook support for external integrations
- [ ] Mobile app companion

## License

MIT

## Support

For issues and questions:
- Check troubleshooting section above
- Review [Google Meet API documentation](https://developers.google.com/workspace/meet/api)
- Review [Gemini API documentation](https://ai.google.dev/docs)

---

**Built with ❤️ using Google Meet API and Gemini AI**