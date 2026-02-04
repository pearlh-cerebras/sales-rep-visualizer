import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SignalSource, Sentiment } from '../types';

export const Signals: React.FC = () => {
  const deals = useSelector((state: RootState) => state.deals.deals);

  const [filter, setFilter] = useState<'all' | 'eager' | 'risk' | 'upsell'>('all');

  const allSignals = deals.flatMap(deal =>
    deal.signals.map(signal => ({ ...signal, deal }))
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const filteredSignals = allSignals.filter(signal => {
    if (filter === 'all') return true;
    const hasEager = signal.intentTags.some(t => ['procurement', 'legal review', 'budget approved', 'ready to sign', 'ready to close'].includes(t));
    const hasRisk = signal.intentTags.some(t => ['frustrated', 'churn risk', 'considering alternatives', 'escalation'].includes(t));
    const hasUpsell = signal.intentTags.some(t => ['upsell', 'usage spike', 'team expansion', 'expand'].includes(t));

    if (filter === 'eager') return hasEager;
    if (filter === 'risk') return hasRisk;
    if (filter === 'upsell') return hasUpsell;
    return true;
  });

  const getSourceIcon = (source: SignalSource) => {
    switch (source) {
      case 'email': return '📧';
      case 'slack': return '💬';
      case 'call_notes': return '📞';
      case 'product_usage': return '📊';
      default: return '📌';
    }
  };

  const getSourceColor = (source: SignalSource) => {
    switch (source) {
      case 'email': return 'bg-blue-100 text-blue-700';
      case 'slack': return 'bg-purple-100 text-purple-700';
      case 'call_notes': return 'bg-green-100 text-green-700';
      case 'product_usage': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSentimentIcon = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return '🔥';
      case 'negative': return '⚠️';
      case 'neutral': return '📌';
      default: return '📌';
    }
  };

  const getSentimentColor = (sentiment: Sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const groupSignalsByDate = (signals: typeof allSignals) => {
    const groups: Record<string, typeof signals> = {};
    signals.forEach(signal => {
      const dateKey = signal.timestamp.toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(signal);
    });
    return groups;
  };

  const groupedSignals = groupSignalsByDate(filteredSignals);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Signal Feed</h2>
          <p className="text-gray-600 mt-1">
            {allSignals.length} signals across {deals.length} deals
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border">
          {(['all', 'eager', 'risk', 'upsell'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {Object.entries(groupedSignals).map(([date, signals]) => (
        <div key={date} className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {date === new Date().toDateString() ? 'Today' : date}
          </h3>
          <div className="space-y-3">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-2xl">{getSentimentIcon(signal.sentiment)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSourceColor(signal.source)}`}>
                          {getSourceIcon(signal.source)} {signal.source.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">{formatTime(signal.timestamp)}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{signal.deal.company.name}</h4>
                      <p className={`text-sm mt-1 ${getSentimentColor(signal.sentiment)}`}>
                        {signal.summary}
                      </p>
                      {signal.rawContent && (
                        <div className="mt-2 bg-gray-50 rounded-md p-3 text-sm text-gray-600 border-l-4 border-gray-300">
                          "{signal.rawContent}"
                          {signal.from && (
                            <span className="block mt-1 text-xs text-gray-400">- {signal.from}</span>
                          )}
                        </div>
                      )}
                      {signal.intentTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {signal.intentTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};