import { Router, Response } from 'express';
import { gmailService } from '../services/gmailService.js';
import { crmStore } from '../store/crmStore.js';

const router = Router();

router.post('/check', async (_req: any, res: Response) => {
  try {
    const trialRequests = await gmailService.checkForTrialRequests();

    for (const request of trialRequests) {
      const existing = crmStore.getTrialRequests().find(
        r => r.email === request.email && !r.dismissed
      );
      if (!existing) {
        crmStore.createTrialRequest(request);
      }
    }

    res.json({
      success: true,
      count: trialRequests.length,
      requests: crmStore.getTrialRequests(),
    });
  } catch (error) {
    console.error('Error checking Gmail:', error);
    res.status(500).json({ error: 'Failed to check Gmail' });
  }
});

export default router;