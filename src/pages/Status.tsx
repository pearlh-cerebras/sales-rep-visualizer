import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const Status: React.FC = () => {
  const deals = useSelector((state: RootState) => state.deals.deals);
  const summary = useSelector((state: RootState) => state.summary.summary);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  if (!summary) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-600">Loading pipeline summary...</p>
      </div>
    );
  }

  const hotDealsWithDetails = summary.hotDeals.map(hd => ({
    ...hd,
    deal: deals.find(d => d.id === hd.dealId),
  })).filter(hd => hd.deal);

  const atRiskDealsWithDetails = summary.atRiskDeals.map(ad => ({
    ...ad,
    deal: deals.find(d => d.id === ad.dealId),
  })).filter(ad => ad.deal);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Status</h2>
          <p className="text-gray-600 mt-1">
            Generated {summary.generatedAt.toLocaleDateString()} at {summary.generatedAt.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => alert('Report shared! (Demo)')}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          >
            📤 Share Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Expected to Close</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(summary.projectedCloseThisMonth)}</p>
              <p className="text-sm text-gray-600 mt-1">{hotDealsWithDetails.length} deals</p>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">At Risk</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {formatCurrency(atRiskDealsWithDetails.reduce((sum, ad) => sum + (ad.deal?.amount || 0), 0))}
              </p>
              <p className="text-sm text-gray-600 mt-1">{atRiskDealsWithDetails.length} deals</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{summary.avgResponseTime}h</p>
              <p className="text-sm text-green-600 mt-1">↓ 12% vs last week</p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            Hot Deals (Likely to Close)
          </h3>
          {hotDealsWithDetails.length === 0 ? (
            <p className="text-gray-500 text-sm">No hot deals identified</p>
          ) : (
            <div className="space-y-3">
              {hotDealsWithDetails.map((hd) => (
                <div key={hd.dealId} className="flex items-start justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{hd.deal?.company.name}</h4>
                      <span className="text-sm text-gray-600">{formatCurrency(hd.deal?.amount || 0)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{hd.reason}</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${hd.likelihood}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{hd.likelihood}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">⚠️</span>
            At Risk
          </h3>
          {atRiskDealsWithDetails.length === 0 ? (
            <p className="text-gray-500 text-sm">No deals at risk</p>
          ) : (
            <div className="space-y-3">
              {atRiskDealsWithDetails.map((ad) => (
                <div key={ad.dealId} className="flex items-start justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{ad.deal?.company.name}</h4>
                      <span className="text-sm text-gray-600">{formatCurrency(ad.deal?.amount || 0)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{ad.reason}</p>
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${ad.riskLevel}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">{ad.riskLevel}% risk</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 This Week</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Deals Needing Action</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{summary.dealsNeedingAction}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(deals.reduce((sum, d) => sum + d.amount, 0))}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active Deals</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{deals.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
};