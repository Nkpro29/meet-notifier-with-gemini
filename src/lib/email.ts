import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  secure: true, // true for 465, false for other ports
});

export interface MentionDetails {
  text: string;
  participant: string;
  timestamp: string;
  confidence: number;
  context: string;
  conferenceId: string;
}

export async function sendMentionNotification(to: string, mention: MentionDetails) {
  if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_USER) {
    console.warn('Email configuration missing, skipping notification');
    return;
  }

  const subject = `New Mention in Google Meet: ${mention.conferenceId}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>You were mentioned!</h2>
      <p><strong>Meeting:</strong> ${mention.conferenceId}</p>
      <p><strong>Participant:</strong> ${mention.participant}</p>
      <p><strong>Time:</strong> ${new Date(mention.timestamp).toLocaleString()}</p>
      
      <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-style: italic;">"${mention.context}"</p>
      </div>
      
      <p style="color: #666; font-size: 12px;">
        Confidence: ${(mention.confidence * 100).toFixed(1)}%
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to,
      subject,
      html,
    });
    console.log(`Mention notification sent to ${to}`);
  } catch (error) {
    console.error('Failed to send mention notification:', error);
    // Don't throw, just log error to avoid breaking the monitoring loop
  }
}
