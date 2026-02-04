import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { TrialRequest } from '../types.js';

const oauth2Client = new OAuth2Client(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

export class GmailService {
  async checkForTrialRequests(): Promise<TrialRequest[]> {
    try {
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'in:inbox (trial OR "interested in" OR "try" OR "demo")',
        maxResults: 10,
      });

      if (!response.data.messages) {
        return [];
      }

      const trialRequests: TrialRequest[] = [];

      for (const message of response.data.messages) {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        const headers = msg.data.payload?.headers || [];
        const fromHeader = headers.find(h => h.name === 'From')?.value || '';
        const subjectHeader = headers.find(h => h.name === 'Subject')?.value || '';
        const dateHeader = headers.find(h => h.name === 'Date')?.value || '';

        const emailMatch = fromHeader.match(/<(.+)>/);
        const email = emailMatch ? emailMatch[1] : fromHeader;
        const name = fromHeader.replace(/<.+>/, '').trim().replace(/"/g, '');
        const company = email.split('@')[1]?.split('.')[0] || 'Unknown';

        trialRequests.push({
          id: message.id!,
          from: name,
          email,
          company: company.charAt(0).toUpperCase() + company.slice(1),
          message: subjectHeader,
          timestamp: new Date(dateHeader),
        });
      }

      return trialRequests;
    } catch (error) {
      console.error('Error checking Gmail for trial requests:', error);
      return [];
    }
  }
}

export const gmailService = new GmailService();