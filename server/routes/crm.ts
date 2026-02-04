import { Router, Request, Response } from 'express';
import { crmStore } from '../store/crmStore.js';

const router = Router();

router.get('/deals', (req: Request, res: Response) => {
  const deals = crmStore.getDeals();
  res.json(deals);
});

router.get('/deals/:id', (req: Request, res: Response) => {
  const deal = crmStore.getDeal(req.params.id as string);
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(deal);
});

router.get('/deals/stage/:stage', (req: Request, res: Response) => {
  const deals = crmStore.getDealsByStage(req.params.stage as any);
  res.json(deals);
});

router.post('/deals', (req: Request, res: Response) => {
  try {
    const deal = crmStore.createDeal(req.body);
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: 'Invalid deal data' });
  }
});

router.patch('/deals/:id/stage', (req: Request, res: Response) => {
  const { stage } = req.body;
  const deal = crmStore.updateDealStage(req.params.id as string, stage);
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(deal);
});

router.patch('/deals/:id', (req: Request, res: Response) => {
  const deal = crmStore.updateDeal(req.params.id as string, req.body);
  if (!deal) {
    return res.status(404).json({ error: 'Deal not found' });
  }
  res.json(deal);
});

router.get('/trial-requests', (req: Request, res: Response) => {
  const requests = crmStore.getTrialRequests();
  res.json(requests);
});

router.post('/trial-requests', (req: Request, res: Response) => {
  try {
    const request = crmStore.createTrialRequest(req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ error: 'Invalid trial request data' });
  }
});

router.post('/trial-requests/:id/dismiss', (req: Request, res: Response) => {
  const success = crmStore.dismissTrialRequest(req.params.id as string);
  if (!success) {
    return res.status(404).json({ error: 'Trial request not found' });
  }
  res.json({ success: true });
});

router.get('/payments', (req: Request, res: Response) => {
  const payments = crmStore.getPayments();
  res.json(payments);
});

router.get('/payments/deal/:dealId', (req: Request, res: Response) => {
  const payments = crmStore.getPaymentsByDeal(req.params.dealId as string);
  res.json(payments);
});

// Alert endpoints
router.get('/alerts', (req: Request, res: Response) => {
  const alerts = crmStore.getAlerts();
  res.json(alerts);
});

router.post('/alerts', (req: Request, res: Response) => {
  try {
    const alert = crmStore.createAlert(req.body);
    res.status(201).json(alert);
  } catch (error) {
    res.status(400).json({ error: 'Invalid alert data' });
  }
});

router.post('/alerts/:id/dismiss', (req: Request, res: Response) => {
  const success = crmStore.dismissAlert(req.params.id as string);
  if (!success) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  res.json({ success: true });
});

// Demo message endpoints
router.get('/demo-messages', (req: Request, res: Response) => {
  const messages = crmStore.getDemoMessages();
  res.json(messages);
});

router.post('/demo-messages', (req: Request, res: Response) => {
  try {
    const message = crmStore.addDemoMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Invalid message data' });
  }
});

router.delete('/demo-messages', (req: Request, res: Response) => {
  crmStore.clearDemoMessages();
  res.json({ success: true });
});

// Reset endpoint for demo
router.post('/reset', (req: Request, res: Response) => {
  crmStore.clearAllData();
  res.json({ success: true, message: 'All data has been reset' });
});

export default router;