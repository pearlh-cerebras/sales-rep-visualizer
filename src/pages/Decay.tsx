import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const Decay: React.FC = () => {
  const deals = useSelector((state: RootState) => state.deals.deals);
  const decayScores = useSelector((state: RootState) => state.decay.decayScores);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const getDecayColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getDecayLabel = (score: number) => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  };

  const getBottleneckText = (bottleneck: string) => {
    switch (bottleneck) {
      case 'you': return 'Your inaction is the bottleneck';
      case 'them': return 'Waiting on them';
      case 'external': return 'External factors';
      default: return 'Unknown';
    }
  };

  const getSignalTypeIcon = (type: string) => {
    switch (type) {
      case 'eager': return '🔥';
      case 'risk': return '⚠️';
      case 'neutral': return '📌';
      default: return '📌';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Deal Decay</h2>
          <p className="text-gray-600 mt-1">
            {decayScores.length} deals analyzed for urgency
          </p>
        </div>
      </div>

      {decayScores.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600">No decay data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {decayScores.map((decay) => {
            const deal = deals.find(d => d.id === decay.dealId);
            if (!deal) return null;

            return (
              <div
                key={decay.dealId}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getSignalTypeIcon(decay.lastSignalType)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{deal.company.name}</h3>
                        <p className="text-sm text-gray-600">{formatCurrency(deal.amount)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">
                      {decay.lastSignalType === 'eager' && 'Eager buyer signals detected'}
                      {decay.lastSignalType === 'risk' && 'Churn risk signals detected'}
                      {decay.lastSignalType === 'neutral' && 'Neutral engagement level'}
                      {' - '}
                      {getBottleneckText(decay.bottleneck)}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <span
                      className={`px-3 py-1 text-sm font-bold rounded-full ${
                        decay.decayScore >= 80
                          ? 'bg-red-100 text-red-700'
                          : decay.decayScore >= 60
                          ? 'bg-orange-100 text-orange-700'
                          : decay.decayScore >= 40
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {getDecayLabel(decay.decayScore)}
                    </span>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{decay.decayScore}%</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">Decay Score</span>
                    <span className="text-sm text-gray-600">{decay.daysSinceResponse} days since response</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getDecayColor(decay.decayScore)}`}
                      style={{ width: `${decay.decayScore}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Stage: <span className="font-medium text-gray-900 capitalize">{deal.stage.replace('_', ' ')}</span></span>
                    <span>Last activity: <span className="font-medium text-gray-900">{decay.daysSinceResponse} days ago</span></span>
                  </div>
                  <button
                    onClick={() => alert(`Take action on ${deal.company.name}! (Demo)`)}
                    className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Take Action →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};