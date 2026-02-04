import { Deal, PrioritySuggestion, DealDecay } from '../types';

export function calculateDecay(deals: Deal[], suggestions: PrioritySuggestion[]): DealDecay[] {
  const decayScores: DealDecay[] = [];
  const now = new Date();

  for (const deal of deals) {
    const suggestion = suggestions.find(s => s.dealId === deal.id);
    if (!suggestion) continue;

    const daysSinceActivity = Math.floor((now.getTime() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24));

    let lastSignalType: 'eager' | 'risk' | 'neutral' = 'neutral';
    if (suggestion.bucket === 'eager_to_sign') {
      lastSignalType = 'eager';
    } else if (suggestion.bucket === 'churn_risk') {
      lastSignalType = 'risk';
    }

    let bottleneck: 'you' | 'them' | 'external' = 'them';
    let decayScore = 0;

    if (lastSignalType === 'eager') {
      if (daysSinceActivity <= 1) {
        decayScore = 20;
        bottleneck = 'them';
      } else if (daysSinceActivity <= 3) {
        decayScore = 50;
        bottleneck = 'you';
      } else if (daysSinceActivity <= 5) {
        decayScore = 75;
        bottleneck = 'you';
      } else {
        decayScore = 90;
        bottleneck = 'you';
      }
    } else if (lastSignalType === 'risk') {
      if (daysSinceActivity <= 1) {
        decayScore = 40;
        bottleneck = 'you';
      } else if (daysSinceActivity <= 3) {
        decayScore = 70;
        bottleneck = 'you';
      } else {
        decayScore = 95;
        bottleneck = 'you';
      }
    } else {
      if (daysSinceActivity <= 7) {
        decayScore = 10;
        bottleneck = 'them';
      } else if (daysSinceActivity <= 14) {
        decayScore = 30;
        bottleneck = 'them';
      } else {
        decayScore = 50;
        bottleneck = 'them';
      }
    }

    decayScore = Math.min(decayScore + (deal.amount > 100000 ? 10 : 0), 100);

    decayScores.push({
      dealId: deal.id,
      decayScore,
      daysSinceResponse: daysSinceActivity,
      lastSignalType,
      bottleneck,
    });
  }

  return decayScores.sort((a, b) => b.decayScore - a.decayScore);
}