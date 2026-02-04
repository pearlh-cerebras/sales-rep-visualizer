export interface Deal {
  id: string;
  company: string;
  email: string;
  stage: 'lead' | 'qualified' | 'free_trial' | 'negotiation' | 'paid' | 'churned';
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  slackChannel?: string;
  stripeCustomerId?: string;
}

export interface TrialRequest {
  id: string;
  from: string;
  email: string;
  company: string;
  message: string;
  timestamp: Date;
  dismissed?: boolean;
}

export interface Payment {
  id: string;
  dealId: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: Date;
  stripeCustomerId: string;
}

export interface SlackMessage {
  id: string;
  channel: string;
  message: string;
  from: string;
  timestamp: Date;
  importance: 'critical' | 'high' | 'medium' | 'low' | 'noise';
  dealId?: string;
  avatar?: string;
}

export interface BusinessReport {
  generatedAt: Date;
  revenueMetrics: {
    mrr: number;
    pipelineValue: number;
    conversionRate: number;
    payingCustomers: number;
  };
  pipelineHealth: {
    lead: number;
    qualified: number;
    freeTrial: number;
    negotiation: number;
    paid: number;
  };
  customerEngagement: {
    company: string;
    messageCount: number;
    lastActivity: Date;
  }[];
  attentionNeeded: {
    company: string;
    reason: string;
    urgency: 'critical' | 'high' | 'medium';
  }[];
}

export interface Alert {
  id: string;
  type: 'ready_to_sign' | 'trial_ending' | 'churn_risk' | 'payment_received';
  title: string;
  message: string;
  company: string;
  dealId?: string;
  timestamp: Date;
  dismissed?: boolean;
}

export interface DemoMessage {
  id: string;
  channel: string;
  message: string;
  from: string;
  timestamp: Date;
  importance: 'critical' | 'high' | 'medium' | 'low' | 'noise';
  mentionsUser?: boolean;
  avatar?: string;
}