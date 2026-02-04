import { PipelineReport } from '../types';
import { mockDeals } from '../data/deals';

export function generatePipelineReport(): PipelineReport {
  const now = new Date();

  const readyToCloseDeals = mockDeals.filter(deal => {
    const isNegotiation = deal.stage === 'negotiation';
    const hasPositiveSignals = deal.signals.some(s => 
      s.sentiment === 'positive' && 
      (s.summary.toLowerCase().includes('ready to sign') ||
       s.summary.toLowerCase().includes('legal approved') ||
       s.summary.toLowerCase().includes('contract'))
    );
    return isNegotiation && hasPositiveSignals;
  });

  const atRiskDeals = mockDeals.filter(deal => {
    const hasNegativeSignals = deal.signals.some(s => s.sentiment === 'negative');
    const daysSinceActivity = Math.floor(
      (now.getTime() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    return hasNegativeSignals || daysSinceActivity > 10;
  });

  const positiveSignals = mockDeals.reduce((count, deal) => {
    return count + deal.signals.filter(s => s.sentiment === 'positive').length;
  }, 0);

  const riskSignals = mockDeals.reduce((count, deal) => {
    return count + deal.signals.filter(s => s.sentiment === 'negative').length;
  }, 0);

  const upsellSignals = mockDeals.reduce((count, deal) => {
    return count + deal.signals.filter(s => 
      s.intentTags.includes('upsell') || 
      s.intentTags.includes('team expansion') ||
      s.intentTags.includes('expansion')
    ).length;
  }, 0);

  const totalPipeline = mockDeals.reduce((sum, deal) => sum + deal.amount, 0);

  return {
    generatedAt: now,
    readyToClose: readyToCloseDeals.map(deal => ({
      dealId: deal.id,
      company: deal.company.name,
      amount: deal.amount,
      reason: deal.signals.find(s => s.sentiment === 'positive')?.summary || 'Positive signals detected',
      action: deal.nextStep,
    })),
    atRisk: atRiskDeals.slice(0, 3).map(deal => ({
      dealId: deal.id,
      company: deal.company.name,
      amount: deal.amount,
      reason: deal.signals.find(s => s.sentiment === 'negative')?.summary || 'No recent activity',
    })),
    keySignals: {
      positive: positiveSignals,
      risk: riskSignals,
      upsell: upsellSignals,
    },
    totalPipeline,
  };
}