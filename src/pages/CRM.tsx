import { useState, useEffect } from 'react';

interface Deal {
  id: string;
  company: string;
  email: string;
  stage: 'lead' | 'qualified' | 'free_trial' | 'negotiation' | 'paid' | 'churned';
  amount: number;
  createdAt: string;
  updatedAt: string;
  slackChannel?: string;
}

const stages = [
  { id: 'lead', label: 'Lead', color: 'bg-gray-100' },
  { id: 'qualified', label: 'Qualified', color: 'bg-blue-100' },
  { id: 'free_trial', label: 'Free Trial', color: 'bg-yellow-100' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
  { id: 'paid', label: 'Paid', color: 'bg-green-100' },
  { id: 'churned', label: 'Churned', color: 'bg-red-100' },
] as const;

export function CRM() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/crm/deals');
      const data = await response.json();
      setDeals(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (stage: string) => {
    if (!draggedDeal) return;

    try {
      await fetch(`http://localhost:3001/api/crm/deals/${draggedDeal}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      fetchDeals();
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }

    setDraggedDeal(null);
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(d => d.stage === stage);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CRM Pipeline</h1>
        <p className="text-gray-600">Drag and drop deals to update their stage</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => {
          const stageDeals = getDealsByStage(stage.id);
          const totalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 ${stage.color} rounded-xl p-4`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className="mb-4">
                <h2 className="font-semibold text-gray-900">{stage.label}</h2>
                <p className="text-sm text-gray-600">
                  {stageDeals.length} deal{stageDeals.length !== 1 ? 's' : ''} • {formatCurrency(totalAmount)}
                </p>
              </div>

              <div className="space-y-3">
                {stageDeals.map(deal => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => handleDragStart(deal.id)}
                    className="bg-white rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">{deal.company}</h3>
                    <p className="text-sm text-gray-600 mb-2">{deal.email}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(deal.amount)}
                      </span>
                      {deal.slackChannel && (
                        <span className="text-xs text-gray-500">{deal.slackChannel}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}