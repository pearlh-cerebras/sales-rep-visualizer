import { Deal, TrialRequest, Payment, Alert, DemoMessage } from '../types.js';

class CRMStore {
  private deals: Map<string, Deal> = new Map();
  private trialRequests: Map<string, TrialRequest> = new Map();
  private payments: Map<string, Payment> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private demoMessages: Map<string, DemoMessage> = new Map();
  private demoMode: boolean = false;

  constructor() {
    // Don't initialize sample data by default - start clean for demo
    // Call initializeSampleData() if you want pre-populated data
  }

  setDemoMode(enabled: boolean) {
    this.demoMode = enabled;
    if (enabled) {
      this.clearAllDataForDemo();
    }
  }

  private clearAllDataForDemo() {
    this.deals.clear();
    this.trialRequests.clear();
    this.payments.clear();
    this.alerts.clear();
    this.demoMessages.clear();
  }

  private initializeSampleData() {
    const sampleDeals: Deal[] = [
      {
        id: 'd1',
        company: 'Acme Corp',
        email: 'sarah@acme.com',
        stage: 'negotiation',
        amount: 50000,
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-02-01'),
        slackChannel: '#deals-acme',
      },
      {
        id: 'd2',
        company: 'TechCorp',
        email: 'john@techcorp.com',
        stage: 'free_trial',
        amount: 25000,
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-02-02'),
        slackChannel: '#trial-techcorp',
      },
      {
        id: 'd3',
        company: 'GrowthCo',
        email: 'lisa@growthco.com',
        stage: 'lead',
        amount: 75000,
        createdAt: new Date('2026-01-25'),
        updatedAt: new Date('2026-02-02'),
      },
      {
        id: 'd4',
        company: 'DataFlow',
        email: 'alex@dataflow.com',
        stage: 'paid',
        amount: 35000,
        createdAt: new Date('2026-01-10'),
        updatedAt: new Date('2026-01-28'),
        slackChannel: '#deals-dataflow',
        stripeCustomerId: 'cus_test_123',
      },
      {
        id: 'd5',
        company: 'FinanceHub',
        email: 'robert@financehub.com',
        stage: 'qualified',
        amount: 60000,
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-02-01'),
      },
    ];

    sampleDeals.forEach(deal => this.deals.set(deal.id, deal));
  }

  getDeals(): Deal[] {
    return Array.from(this.deals.values());
  }

  getDeal(id: string): Deal | undefined {
    return this.deals.get(id);
  }

  getDealsByStage(stage: Deal['stage']): Deal[] {
    return Array.from(this.deals.values()).filter(d => d.stage === stage);
  }

  createDeal(deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Deal {
    const id = `d${Date.now()}`;
    const newDeal: Deal = {
      ...deal,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.deals.set(id, newDeal);
    return newDeal;
  }

  updateDealStage(id: string, stage: Deal['stage']): Deal | null {
    const deal = this.deals.get(id);
    if (!deal) return null;
    deal.stage = stage;
    deal.updatedAt = new Date();
    this.deals.set(id, deal);
    return deal;
  }

  updateDeal(id: string, updates: Partial<Deal>): Deal | null {
    const deal = this.deals.get(id);
    if (!deal) return null;
    const updated = { ...deal, ...updates, updatedAt: new Date() };
    this.deals.set(id, updated);
    return updated;
  }

  getTrialRequests(): TrialRequest[] {
    return Array.from(this.trialRequests.values()).filter(r => !r.dismissed);
  }

  createTrialRequest(request: Omit<TrialRequest, 'id' | 'timestamp'>): TrialRequest {
    const id = `tr${Date.now()}`;
    const newRequest: TrialRequest = {
      ...request,
      id,
      timestamp: new Date(),
    };
    this.trialRequests.set(id, newRequest);
    return newRequest;
  }

  dismissTrialRequest(id: string): boolean {
    const request = this.trialRequests.get(id);
    if (!request) return false;
    request.dismissed = true;
    this.trialRequests.set(id, request);
    return true;
  }

  getPayments(): Payment[] {
    return Array.from(this.payments.values());
  }

  createPayment(payment: Omit<Payment, 'id' | 'timestamp'>): Payment {
    const id = `pay${Date.now()}`;
    const newPayment: Payment = {
      ...payment,
      id,
      timestamp: new Date(),
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  getPaymentsByDeal(dealId: string): Payment[] {
    return Array.from(this.payments.values()).filter(p => p.dealId === dealId);
  }

  // Alert methods
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => !a.dismissed);
  }

  createAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Alert {
    const id = `alert${Date.now()}`;
    const newAlert: Alert = {
      ...alert,
      id,
      timestamp: new Date(),
    };
    this.alerts.set(id, newAlert);
    return newAlert;
  }

  dismissAlert(id: string): boolean {
    const alert = this.alerts.get(id);
    if (!alert) return false;
    alert.dismissed = true;
    this.alerts.set(id, alert);
    return true;
  }

  // Demo message methods
  getDemoMessages(): DemoMessage[] {
    return Array.from(this.demoMessages.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  addDemoMessage(message: Omit<DemoMessage, 'id' | 'timestamp'>): DemoMessage {
    const id = `msg${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
    const newMessage: DemoMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    this.demoMessages.set(id, newMessage);
    return newMessage;
  }

  clearDemoMessages(): void {
    this.demoMessages.clear();
  }

  clearAllData() {
    this.deals.clear();
    this.trialRequests.clear();
    this.payments.clear();
    this.alerts.clear();
    this.demoMessages.clear();
    // Don't reinitialize sample data - keep it clean for demo
  }
}

export const crmStore = new CRMStore();