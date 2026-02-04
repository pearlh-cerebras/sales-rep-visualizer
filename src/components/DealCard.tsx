import React from 'react';
import { Deal, PrioritySuggestion } from '../types';

interface DealCardProps {
  deal: Deal;
  suggestion: PrioritySuggestion;
  onAccept: () => void;
  onReject: () => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, suggestion, onAccept, onReject }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case 'eager_to_sign':
        return 'bg-success-50 border-success-200';
      case 'least_eager':
        return 'bg-warning-50 border-warning-200';
      case 'churn_risk':
        return 'bg-danger-50 border-danger-200';
      case 'upsell_opportunity':
        return 'bg-primary-50 border-primary-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getBucketBadgeColor = (bucket: string) => {
    switch (bucket) {
      case 'eager_to_sign':
        return 'bg-success-100 text-success-700';
      case 'least_eager':
        return 'bg-warning-100 text-warning-700';
      case 'churn_risk':
        return 'bg-danger-100 text-danger-700';
      case 'upsell_opportunity':
        return 'bg-primary-100 text-primary-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getBucketLabel = (bucket: string) => {
    switch (bucket) {
      case 'eager_to_sign':
        return 'Eager to Sign';
      case 'least_eager':
        return 'Least Eager';
      case 'churn_risk':
        return 'Churn Risk';
      case 'upsell_opportunity':
        return 'Upsell Opportunity';
      default:
        return bucket;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBucketColor(suggestion.bucket)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{deal.company.name}</h3>
          <p className="text-sm text-gray-600">{deal.contacts[0]?.name} · {deal.contacts[0]?.role}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">{formatAmount(deal.amount)}</p>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getBucketBadgeColor(suggestion.bucket)}`}>
            {getBucketLabel(suggestion.bucket)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Stage: <span className="ml-1 font-medium capitalize">{deal.stage.replace('_', ' ')}</span>
          </span>
          <span className="flex items-center">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            Last activity: {formatDate(deal.lastActivityAt)}
          </span>
        </div>
      </div>

      <div className="bg-white rounded p-3 mb-3">
        <p className="text-sm text-gray-700">
          <span className="font-medium">Next step:</span> {deal.nextStep}
        </p>
      </div>

      <div className="bg-white rounded p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">AI Suggestion</span>
          <span className="text-xs text-gray-500">Confidence: {suggestion.confidence}%</span>
        </div>
        <ul className="text-sm text-gray-600 space-y-1">
          {suggestion.reasons.map((reason, idx) => (
            <li key={idx} className="flex items-start">
              <span className="text-primary-500 mr-2">•</span>
              {reason}
            </li>
          ))}
        </ul>
        {suggestion.suggestedStage && (
          <p className="text-sm text-primary-600 mt-2 font-medium">
            Suggested: Move to <span className="capitalize">{suggestion.suggestedStage.replace('_', ' ')}</span>
          </p>
        )}
      </div>

      {!suggestion.accepted && !suggestion.rejected && (
        <div className="flex space-x-2">
          <button
            onClick={onAccept}
            className="flex-1 bg-success-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-success-700 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={onReject}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {suggestion.accepted && (
        <div className="bg-success-100 text-success-700 px-4 py-2 rounded-md text-sm font-medium text-center">
          ✓ Suggestion accepted
        </div>
      )}

      {suggestion.rejected && (
        <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm font-medium text-center">
          ✗ Suggestion rejected
        </div>
      )}
    </div>
  );
};