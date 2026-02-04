import { WebClient } from '@slack/web-api';
import { SlackMessage } from '../types.js';

export class SlackService {
  private slackClient: WebClient | null = null;

  constructor() {
    if (process.env.SLACK_BOT_TOKEN) {
      this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    } else {
      console.warn('⚠️  SLACK_BOT_TOKEN not found. Slack features will be disabled.');
    }
  }

  private checkSlackInitialized(): boolean {
    if (!this.slackClient) {
      console.warn('⚠️  Slack not initialized. Add SLACK_BOT_TOKEN to .env to enable Slack features.');
      return false;
    }
    return true;
  }

  async getMessagesFromChannels(channelIds: string[]): Promise<SlackMessage[]> {
    if (!this.checkSlackInitialized()) return [];

    const allMessages: SlackMessage[] = [];

    for (const channelId of channelIds) {
      try {
        const result = await this.slackClient!.conversations.history({
          channel: channelId,
          limit: 50,
        });

        if (result.messages) {
          const messages = result.messages
            .filter(msg => !msg.subtype && msg.text)
            .map(msg => ({
              id: msg.ts || '',
              channel: channelId,
              message: msg.text || '',
              from: msg.user || 'Unknown',
              timestamp: new Date(parseFloat(msg.ts || '0') * 1000),
              importance: this.calculateImportance(msg.text || ''),
            }));
          allMessages.push(...messages);
        }
      } catch (error) {
        console.error(`Error fetching messages from ${channelId}:`, error);
      }
    }

    return allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createChannel(name: string): Promise<string | null> {
    if (!this.checkSlackInitialized()) return null;

    try {
      const result = await this.slackClient!.conversations.create({
        name: name.toLowerCase().replace(/\s+/g, '-'),
      });
      return result.channel?.id || null;
    } catch (error) {
      console.error('Error creating Slack channel:', error);
      return null;
    }
  }

  async postMessage(channel: string, text: string): Promise<boolean> {
    if (!this.checkSlackInitialized()) return false;

    try {
      await this.slackClient!.chat.postMessage({
        channel,
        text,
      });
      return true;
    } catch (error) {
      console.error('Error posting message to Slack:', error);
      return false;
    }
  }

  async inviteToChannel(channel: string, email: string): Promise<boolean> {
    if (!this.checkSlackInitialized()) return false;

    try {
      await this.slackClient!.conversations.inviteShared({
        channel,
        emails: [email],
      });
      return true;
    } catch (error) {
      console.error('Error inviting user to channel:', error);
      return false;
    }
  }

  async inviteUserById(channel: string, userId: string): Promise<boolean> {
    if (!this.checkSlackInitialized()) return false;

    try {
      await this.slackClient!.conversations.invite({
        channel,
        users: userId,
      });
      return true;
    } catch (error: any) {
      if (error.data?.error === 'already_in_channel') {
        return true;
      }
      console.error('Error inviting user to channel:', error);
      return false;
    }
  }

  private calculateImportance(text: string): SlackMessage['importance'] {
    const lowerText = text.toLowerCase();
    const urgentKeywords = ['urgent', 'asap', 'emergency', 'critical', 'immediately'];
    const pricingKeywords = ['pricing', 'price', 'cost', 'budget', 'contract'];
    const legalKeywords = ['legal', 'review', 'approve', 'sign'];
    const riskKeywords = ['cancel', 'issue', 'problem', 'frustrated', 'alternative'];
    const noiseKeywords = ['lunch', 'happy hour', 'coffee', 'random', 'bot'];

    if (urgentKeywords.some(k => lowerText.includes(k))) {
      return 'critical';
    }
    if (pricingKeywords.some(k => lowerText.includes(k)) || legalKeywords.some(k => lowerText.includes(k))) {
      return 'high';
    }
    if (riskKeywords.some(k => lowerText.includes(k))) {
      return 'high';
    }
    if (noiseKeywords.some(k => lowerText.includes(k))) {
      return 'noise';
    }
    return 'medium';
  }
}

export const slackService = new SlackService();