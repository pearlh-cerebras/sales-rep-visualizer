import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { acceptSuggestion, rejectSuggestion } from '../store/suggestionsSlice';
import { updateDealStage } from '../store/dealsSlice';
import { DealCard } from '../components/DealCard';
import { BucketCard } from '../components/BucketCard';
import { BucketType } from '../types';

export const Prioritization: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const deals = useSelector((state: RootState) => state.deals.deals);
  const suggestions = useSelector((state: RootState) => state.suggestions.suggestions);
  const [viewMode, setViewMode] = useState<'numbers' | 'list'>('numbers');

  const bucketTypes: BucketType[] = ['eager_to_sign', 'least_eager', 'churn_risk', 'upsell_opportunity'];

  const getBucketInfo = (bucket: BucketType) => {
    switch (bucket) {
      case 'eager_to_sign':
        return { title: 'Most Eager to Sign', color: 'success' as const, icon: '🚀' };
      case 'least_eager':
        return { title: 'Least Eager to Sign', color: 'warning' as const, icon: '🐢' };
      case 'churn_risk':
        return { title: 'Biggest Churn Risks', color: 'danger' as const, icon: '⚠️' };
      case 'upsell_opportunity':
        return { title: 'Upsell Opportunities', color: 'primary' as const, icon: '💰' };
    }
  };

  const handleAccept = (dealId: string) => {
    const suggestion = suggestions.find(s => s.dealId === dealId);
    if (suggestion?.suggestedStage) {
      dispatch(updateDealStage({ dealId, stage: suggestion.suggestedStage }));
    }
    dispatch(acceptSuggestion({ dealId }));
  };

  const handleReject = (dealId: string) => {
    dispatch(rejectSuggestion({ dealId }));
  };

  const activeSuggestions = suggestions.filter(s => !s.rejected);

  const getPipelineStageCounts = () => {
    const stageCounts: Record<string, number> = {};
    deals.forEach(deal => {
      stageCounts[deal.stage] = (stageCounts[deal.stage] || 0) + 1;
    });
    return stageCounts;
  };

  const stageCounts = getPipelineStageCounts();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prioritization</h2>
          <p className="text-gray-600 mt-1">
            AI analyzed {deals.reduce((sum, d) => sum + d.signals.length, 0)} signals across {deals.length} deals
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border">
          <button
            onClick={() => setViewMode('numbers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'numbers'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Numbers View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Priority List
          </button>
        </div>
      </div>

      {viewMode === 'numbers' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {bucketTypes.map(bucket => {
              const bucketSuggestions = activeSuggestions.filter(s => s.bucket === bucket);
              const bucketDeals = bucketSuggestions.map(s => deals.find(d => d.id === s.dealId)).filter(Boolean);
              const totalAmount = bucketDeals.reduce((sum, deal) => sum + (deal?.amount || 0), 0);
              const info = getBucketInfo(bucket);

              return (
                <BucketCard
                  key={bucket}
                  title={info.title}
                  count={bucketSuggestions.length}
                  totalAmount={totalAmount}
                  color={info.color}
                  icon={info.icon}
                />
              );
            })}
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage Distribution</h3>
            <div className="space-y-3">
              {Object.entries(stageCounts).map(([stage, count]) => (
                <div key={stage} className="flex items-center">
                  <span className="w-40 text-sm text-gray-600 capitalize">{stage.replace('_', ' ')}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(count / deals.length) * 100}%` }}
                    />
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {viewMode === 'list' && (
        <div className="space-y-6">
          {bucketTypes.map(bucket => {
            const bucketSuggestions = activeSuggestions.filter(s => s.bucket === bucket);
            if (bucketSuggestions.length === 0) return null;

            const info = getBucketInfo(bucket);

            return (
              <div key={bucket}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">{info.icon}</span>
                  {info.title} ({bucketSuggestions.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {bucketSuggestions.map(suggestion => {
                    const deal = deals.find(d => d.id === suggestion.dealId);
                    if (!deal) return null;

                    return (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        suggestion={suggestion}
                        onAccept={() => handleAccept(deal.id)}
                        onReject={() => handleReject(deal.id)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};