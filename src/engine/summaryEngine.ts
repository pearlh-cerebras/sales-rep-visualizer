import { Deal, PrioritySuggestion, PipelineSummary } from '../types';

export function generatePipelineSummary(deals: Deal[], suggestions: PrioritySuggestion[]): PipelineSummary {
  const now = new Date();

  const eagerSuggestions = suggestions.filter(s => s.bucket === 'eager_to_sign');
  const riskSuggestions = suggestions.filter(s => s.bucket === 'churn_risk');

  const hotDeals = eagerSuggestions
    .map(s => {
      const deal = deals.find(d => d.id === s.dealId);
      if (!deal) return null;
      let likelihood = s.confidence;
      if (deal.stage === 'negotiation') likelihood += 20;
      if (deal.stage === 'trial') likelihood += 10;
      likelihood = Math.min(likelihood, 100);
      return {
        dealId: deal.id,
        reason: s.reasons[0] || 'Strong buying signals detected',
        likelihood,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.likelihood || 0) - (a?.likelihood || 0))
    .slice(0, 3) as { dealId: string; reason: string; likelihood: number }[];

  const atRiskDeals = riskSuggestions
    .map(s => {
      const deal = deals.find(d => d.id === s.dealId);
      if (!deal) return null;
      let riskLevel = s.confidence;
      const daysSinceActivity = Math.floor((now.getTime() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceActivity >= 5) riskLevel += 15;
      riskLevel = Math.min(riskLevel, 100);
      return {
        dealId: deal.id,
        reason: s.reasons[0] || 'Customer expressing frustration',
        riskLevel,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (b?.riskLevel || 0) - (a?.riskLevel || 0))
    .slice(0, 3) as { dealId: string; reason: string; riskLevel: number }[];

  const totalResponseTime = deals.reduce((sum, deal) => {
    const signalGaps = deal.signals
      .slice(1)
      .map((s, i) => deal.signals[i].timestamp.getTime() - s.timestamp.getTime())
      .filter(gap => gap > 0);
    const avgGap = signalGaps.length > 0 ? signalGaps.reduce((a, b) => a + b, 0) / signalGaps.length : 0;
    return sum + avgGap;
  }, 0);
  const avgResponseTime = deals.length > 0 ? (totalResponseTime / deals.length) / (1000 * 60 * 60) : 4.2;

  const dealsNeedingAction = suggestions.filter(s => !s.accepted && !s.rejected).length;

  const negotiationDeals = deals.filter(d => d.stage === 'negotiation');
  const projectedCloseThisMonth = negotiationDeals
    .filter(d => {
      const suggestion = suggestions.find(s => s.dealId === d.id);
      return suggestion?.bucket === 'eager_to_sign' && suggestion.confidence >= 70;
    })
    .reduce((sum, d) => sum + d.amount, 0);

  return {
    hotDeals,
    atRiskDeals,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    dealsNeedingAction,
    projectedCloseThisMonth,
    generatedAt: now,
  };
}