import { Deal, PrioritySuggestion, BucketType, Stage } from '../types';

const eagerKeywords = [
  'pricing', 'procurement', 'legal review', 'security review', 'security questionnaire',
  'ready to move forward', 'budget approved', 'ready to sign', 'final approval',
  'good to go', 'proceed', 'executive sponsorship', 'executive buy-in',
  'contract', 'signed', 'signing', 'close', 'closing'
];

const leastEagerKeywords = [
  'ghosting', 'no response', 'pushed back', 'not a priority', 'revisit next quarter',
  'revisit', 'not ready', 'busy', 'other projects', 'other initiatives',
  'focusing on', 'delayed decision', 'think about it', 'get back to you',
  'postpone', 'reschedule', 'competing priorities'
];

const churnRiskKeywords = [
  'frustrated', 'issues', 'complaint', 'considering alternatives', 'low usage',
  'support escalation', 'escalated', 'struggling', 'problems', 'trouble',
  'performance', 'slow', 'not working', 'broken', 'dissatisfied'
];

const upsellKeywords = [
  'usage spike', 'team expansion', 'new use case', 'feature request',
  'add seats', 'adding seats', 'expand', 'expansion', 'more departments',
  'more regions', 'enterprise', 'larger deployment', 'increase', 'doubled',
  'adoption', 'fully onboarded', 'high adoption', 'excellent adoption'
];

const stageSuggestions: Record<BucketType, Stage | undefined> = {
  eager_to_sign: 'negotiation',
  least_eager: undefined,
  churn_risk: undefined,
  upsell_opportunity: undefined,
};

function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase();
  return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase())).length;
}

function calculateConfidence(deal: Deal, bucket: BucketType, matchCount: number): number {
  let confidence = Math.min(matchCount * 20, 100);

  const daysSinceActivity = Math.floor(
    (Date.now() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (bucket === 'eager_to_sign' && daysSinceActivity <= 3) {
    confidence = Math.min(confidence + 15, 100);
  } else if (bucket === 'least_eager' && daysSinceActivity >= 7) {
    confidence = Math.min(confidence + 15, 100);
  } else if (bucket === 'churn_risk' && deal.stage === 'closed_won') {
    confidence = Math.min(confidence + 10, 100);
  } else if (bucket === 'upsell_opportunity' && deal.stage === 'closed_won') {
    confidence = Math.min(confidence + 10, 100);
  }

  return confidence;
}

function generateReasons(deal: Deal, bucket: BucketType, matchedSignals: string[]): string[] {
  const reasons: string[] = [];

  if (bucket === 'eager_to_sign') {
    if (matchedSignals.some(s => s.includes('legal') || s.includes('security'))) {
      reasons.push('Legal/security review in progress');
    }
    if (matchedSignals.some(s => s.includes('budget') || s.includes('approved'))) {
      reasons.push('Budget has been approved');
    }
    if (matchedSignals.some(s => s.includes('ready') || s.includes('sign'))) {
      reasons.push('Expressed readiness to close');
    }
    if (deal.stage === 'negotiation') {
      reasons.push('Already in negotiation stage');
    }
  } else if (bucket === 'least_eager') {
    if (matchedSignals.some(s => s.includes('no response') || s.includes('ghosting'))) {
      reasons.push('No recent response to outreach');
    }
    if (matchedSignals.some(s => s.includes('priority') || s.includes('busy'))) {
      reasons.push('Indicated this is not a priority');
    }
    if (matchedSignals.some(s => s.includes('revisit') || s.includes('quarter'))) {
      reasons.push('Asked to revisit later');
    }
    const daysSinceActivity = Math.floor(
      (Date.now() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceActivity >= 7) {
      reasons.push(`No activity for ${daysSinceActivity}+ days`);
    }
  } else if (bucket === 'churn_risk') {
    if (matchedSignals.some(s => s.includes('frustrated') || s.includes('complaint'))) {
      reasons.push('Expressed frustration with product/service');
    }
    if (matchedSignals.some(s => s.includes('alternatives') || s.includes('considering'))) {
      reasons.push('Mentioned considering alternatives');
    }
    if (matchedSignals.some(s => s.includes('escalated') || s.includes('executive'))) {
      reasons.push('Issue escalated to executive team');
    }
    if (matchedSignals.some(s => s.includes('issues') || s.includes('problems'))) {
      reasons.push('Ongoing technical or support issues');
    }
  } else if (bucket === 'upsell_opportunity') {
    if (matchedSignals.some(s => s.includes('usage') || s.includes('spike') || s.includes('increase'))) {
      reasons.push('Significant usage increase detected');
    }
    if (matchedSignals.some(s => s.includes('expand') || s.includes('seats') || s.includes('add'))) {
      reasons.push('Expressed interest in expansion');
    }
    if (matchedSignals.some(s => s.includes('feature request') || s.includes('custom'))) {
      reasons.push('Requested additional features');
    }
    if (matchedSignals.some(s => s.includes('enterprise') || s.includes('larger'))) {
      reasons.push('Potential for enterprise upgrade');
    }
  }

  return reasons.slice(0, 4);
}

export function generateSuggestions(deals: Deal[]): PrioritySuggestion[] {
  const suggestions: PrioritySuggestion[] = [];

  for (const deal of deals) {
    const allText = deal.signals.map(s => s.summary + ' ' + s.keyPhrases.join(' ')).join(' ');

    const eagerMatches = countKeywordMatches(allText, eagerKeywords);
    const leastEagerMatches = countKeywordMatches(allText, leastEagerKeywords);
    const churnRiskMatches = countKeywordMatches(allText, churnRiskKeywords);
    const upsellMatches = countKeywordMatches(allText, upsellKeywords);

    let bucket: BucketType;
    let maxMatches = 0;

    if (eagerMatches > 0 && eagerMatches >= Math.max(leastEagerMatches, churnRiskMatches, upsellMatches)) {
      bucket = 'eager_to_sign';
      maxMatches = eagerMatches;
    } else if (churnRiskMatches > 0 && churnRiskMatches >= Math.max(leastEagerMatches, upsellMatches)) {
      bucket = 'churn_risk';
      maxMatches = churnRiskMatches;
    } else if (upsellMatches > 0 && upsellMatches >= leastEagerMatches) {
      bucket = 'upsell_opportunity';
      maxMatches = upsellMatches;
    } else if (leastEagerMatches > 0) {
      bucket = 'least_eager';
      maxMatches = leastEagerMatches;
    } else {
      continue;
    }

    const confidence = calculateConfidence(deal, bucket, maxMatches);
    const matchedSignals = deal.signals
      .filter(s => {
        const text = s.summary + ' ' + s.keyPhrases.join(' ');
        const keywords = bucket === 'eager_to_sign' ? eagerKeywords :
                        bucket === 'least_eager' ? leastEagerKeywords :
                        bucket === 'churn_risk' ? churnRiskKeywords : upsellKeywords;
        return countKeywordMatches(text, keywords) > 0;
      })
      .map(s => s.summary);

    const reasons = generateReasons(deal, bucket, matchedSignals);

    if (reasons.length === 0) {
      continue;
    }

    suggestions.push({
      dealId: deal.id,
      bucket,
      suggestedStage: stageSuggestions[bucket] as Stage | undefined,
      confidence,
      reasons,
    });
  }

  return suggestions;
}