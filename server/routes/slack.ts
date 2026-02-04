import { Router, Request, Response } from 'express';
import { slackService } from '../services/slackService.js';

const router = Router();

router.get('/messages', async (req: Request, res: Response) => {
  try {
    const channels = req.query.channels as string;
    const channelIds = channels ? channels.split(',') : [];
    const messages = await slackService.getMessagesFromChannels(channelIds);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Slack messages' });
  }
});

router.post('/create-channel', async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const channelId = await slackService.createChannel(name);
    if (!channelId) {
      return res.status(500).json({ error: 'Failed to create channel' });
    }
    res.json({ channelId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

router.post('/post-message', async (req: Request, res: Response) => {
  try {
    const { channel, text } = req.body;
    const success = await slackService.postMessage(channel, text);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to post message' });
  }
});

router.post('/invite', async (req: Request, res: Response) => {
  try {
    const { channel, email } = req.body;
    const success = await slackService.inviteToChannel(channel, email);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

router.post('/invite-user', async (req: Request, res: Response) => {
  try {
    const { channel, userId } = req.body;
    const success = await slackService.inviteUserById(channel, userId);
    res.json({ success });
  } catch (error) {
    res.status(500).json({ error: 'Failed to invite user' });
  }
});

export default router;