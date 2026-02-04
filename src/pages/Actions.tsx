import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { completeAction, snoozeAction } from '../store/actionsSlice';

export const Actions: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const deals = useSelector((state: RootState) => state.deals.deals);
  const actions = useSelector((state: RootState) => state.actions.actions);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const activeActions = actions.filter(a => !a.completedAt);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const handleComplete = (actionId: string) => {
    dispatch(completeAction(actionId));
    setExpandedAction(null);
  };

  const handleSnooze = (actionId: string) => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000);
    dispatch(snoozeAction({ id: actionId, until }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Top Actions</h2>
          <p className="text-gray-600 mt-1">
            {activeActions.length} actions prioritized by urgency
          </p>
        </div>
      </div>

      {activeActions.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-600">No pending actions. Great job staying on top of your deals.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeActions.map((action) => {
            const deal = deals.find(d => d.id === action.dealId);
            if (!deal) return null;

            const isExpanded = expandedAction === action.id;

            return (
              <div
                key={action.id}
                className={`bg-white rounded-lg border transition-all ${
                  isExpanded ? 'border-primary-300 shadow-md' : 'border-gray-200'
                }`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-2xl">{getPriorityIcon(action.priority)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(action.priority)}`}>
                            {action.priority.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatCurrency(deal.amount)}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{action.reason}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(action.id);
                        }}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        ✓ Done
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnooze(action.id);
                        }}
                        className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-300 transition-colors"
                      >
                        ⏰ Snooze
                      </button>
                    </div>
                  </div>
                </div>

                {isExpanded && action.suggestedResponse && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Response:</h4>
                    <div className="bg-white border border-gray-200 rounded-md p-3 text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {action.suggestedResponse}
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(action.suggestedResponse || '');
                        }}
                        className="px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() => {
                          const subject = encodeURIComponent(`Re: ${deal.company.name}`);
                          const body = encodeURIComponent(action.suggestedResponse || '');
                          window.open(`mailto:${deal.contacts[0]?.email}?subject=${subject}&body=${body}`);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                      >
                        ✉️ Open Email
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};