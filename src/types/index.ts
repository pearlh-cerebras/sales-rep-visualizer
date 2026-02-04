export type Stage = 'lead' | 'qualified' | 'demo_scheduled' | 'trial' | 'negotiation' | 'closed_won' | 'closed_lost';
export type SignalSource = 'call_notes' | 'email' | 'slack' | 'product_usage';
export type BucketType = 'eager_to_sign' | 'least_eager' | 'churn_risk' | 'upsell_opportunity';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ActionType = 'call' | 'email' | 'follow_up' | 'send_contract' | 'schedule_meeting' | 'resolve_issue';

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  domain: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

export interface Signal {
  id: string;
  dealId: string;
  timestamp: Date;
  source: SignalSource;
  summary: string;
  sentiment: Sentiment;
  intentTags: string[];
  keyPhrases: string[];
  rawContent?: string;
  from?: string;
  read?: boolean;
}

export interface Deal {
  id: string;
  company: Company;
  contacts: Contact[];
  stage: Stage;
  amount: number;
  owner: string;
  lastActivityAt: Date;
  nextStep: string;
  createdAt: Date;
  signals: Signal[];
}

export interface PrioritySuggestion {
  dealId: string;
  bucket: BucketType;
  suggestedStage?: Stage;
  confidence: number;
  reasons: string[];
  accepted?: boolean;
  rejected?: boolean;
}

export interface Action {
  id: string;
  dealId: string;
  type: ActionType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  suggestedResponse?: string;
  dueBy?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface DealDecay {
  dealId: string;
  decayScore: number;
  daysSinceResponse: number;
  lastSignalType: 'eager' | 'risk' | 'neutral';
  bottleneck: 'you' | 'them' | 'external';
}

export interface PipelineSummary {
  hotDeals: { dealId: string; reason: string; likelihood: number }[];
  atRiskDeals: { dealId: string; reason: string; riskLevel: number }[];
  avgResponseTime: number;
  dealsNeedingAction: number;
  projectedCloseThisMonth: number;
  generatedAt: Date;
}

export interface FunnelMetrics {
  inboundSources: { source: string; count: number; percentage: number }[];
  outboundResponseRates: { channel: string; rate: number }[];
  pipelineStages: { stage: Stage; count: number; amount: number }[];
  expectedToClose: { amount: number; count: number };
  lostThisWeek: { amount: number; count: number };
  onTrial: number;
  conversionRates: { from: Stage; to: Stage; rate: number }[];
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

export interface PipelineReport {
  generatedAt: Date;
  readyToClose: { dealId: string; company: string; amount: number; reason: string; action: string }[];
  atRisk: { dealId: string; company: string; amount: number; reason: string }[];
  keySignals: { positive: number; risk: number; upsell: number };
  totalPipeline: number;
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