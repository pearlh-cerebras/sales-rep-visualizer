import { Deal, PrioritySuggestion, Action } from '../types';

export function generateActions(deals: Deal[], suggestions: PrioritySuggestion[]): Action[] {
  const actions: Action[] = [];
  const now = new Date();

  for (const deal of deals) {
    const suggestion = suggestions.find(s => s.dealId === deal.id);
    if (!suggestion) continue;

    const daysSinceActivity = Math.floor((now.getTime() - deal.lastActivityAt.getTime()) / (1000 * 60 * 60 * 24));
    const primaryContact = deal.contacts[0];

    if (suggestion.bucket === 'eager_to_sign') {
      if (deal.stage === 'negotiation') {
        actions.push({
          id: `action-${deal.id}-contract`,
          dealId: deal.id,
          type: 'send_contract',
          priority: daysSinceActivity >= 2 ? 'critical' : 'high',
          title: `Send contract to ${primaryContact.name} at ${deal.company.name}`,
          reason: `They're ready to sign and have budget approval. ${daysSinceActivity} days since last activity.`,
          suggestedResponse: `Hi ${primaryContact.name},\n\nGreat news - I've attached the final contract for your review. As discussed, we're targeting an end-of-month signature to hit your Q1 timeline.\n\nLet me know if you have any questions or need anything from legal.\n\nBest,\n[Your Name]`,
          dueBy: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          createdAt: now,
        });
      } else {
        actions.push({
          id: `action-${deal.id}-call`,
          dealId: deal.id,
          type: 'call',
          priority: daysSinceActivity >= 2 ? 'critical' : 'high',
          title: `Call ${primaryContact.name} at ${deal.company.name}`,
          reason: `They've shown strong buying signals. ${daysSinceActivity} days since last activity.`,
          suggestedResponse: `Hi ${primaryContact.name},\n\nI noticed you mentioned ${suggestion.reasons[0]?.toLowerCase() || 'moving forward'} in our last conversation. I'd love to discuss next steps and see if we can get this across the finish line.\n\nAre you free for a quick 15-min call today or tomorrow?\n\nBest,\n[Your Name]`,
          dueBy: new Date(now.getTime() + 24 * 60 * 60 * 1000),
          createdAt: now,
        });
      }
    } else if (suggestion.bucket === 'churn_risk') {
      actions.push({
        id: `action-${deal.id}-resolve`,
        dealId: deal.id,
        type: 'resolve_issue',
        priority: 'critical',
        title: `Resolve issue for ${deal.company.name}`,
        reason: `${primaryContact.name} is frustrated and considering alternatives.`,
        suggestedResponse: `Hi ${primaryContact.name},\n\nI wanted to personally reach out regarding the issues you've been experiencing. I understand how frustrating this has been and I want to make sure we resolve this immediately.\n\nI've escalated this to our engineering team and we're prioritizing a fix. Can we schedule a call today to discuss the specific issues and ensure we're addressing everything?\n\nI'm committed to making this right.\n\nBest,\n[Your Name]`,
        dueBy: new Date(now.getTime() + 12 * 60 * 60 * 1000),
        createdAt: now,
      });
    } else if (suggestion.bucket === 'least_eager') {
      if (daysSinceActivity >= 7) {
        actions.push({
          id: `action-${deal.id}-followup`,
          dealId: deal.id,
          type: 'follow_up',
          priority: 'medium',
          title: `Follow up with ${primaryContact.name} at ${deal.company.name}`,
          reason: `No activity for ${daysSinceActivity}+ days. They mentioned this isn't a priority right now.`,
          suggestedResponse: `Hi ${primaryContact.name},\n\nI know timing wasn't quite right when we last spoke, but I wanted to check in and see if anything has changed on your end.\n\nNo pressure at all - just wanted to keep you in the loop in case your priorities have shifted.\n\nBest,\n[Your Name]`,
          dueBy: new Date(now.getTime() + 48 * 60 * 60 * 1000),
          createdAt: now,
        });
      }
    } else if (suggestion.bucket === 'upsell_opportunity') {
      actions.push({
        id: `action-${deal.id}-upsell`,
        dealId: deal.id,
        type: 'schedule_meeting',
        priority: 'high',
        title: `Schedule upsell call with ${primaryContact.name} at ${deal.company.name}`,
        reason: `They've shown strong expansion signals: ${suggestion.reasons[0]?.toLowerCase() || 'usage increase'}.`,
        suggestedResponse: `Hi ${primaryContact.name},\n\nI noticed your team has been getting great value from the product - ${suggestion.reasons[0]?.toLowerCase() || 'usage has increased significantly'}.\n\nI'd love to discuss how we can support your growth and explore options for expanding your deployment.\n\nAre you free for a quick call this week?\n\nBest,\n[Your Name]`,
        dueBy: new Date(now.getTime() + 72 * 60 * 60 * 1000),
        createdAt: now,
      });
    }
  }

  return actions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}