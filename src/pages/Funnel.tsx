import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { MetricCard } from '../components/MetricCard';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const Funnel: React.FC = () => {
  const deals = useSelector((state: RootState) => state.deals.deals);

  const inboundSources = [
    { name: 'Email', value: 35, color: '#3b82f6' },
    { name: 'LinkedIn', value: 25, color: '#10b981' },
    { name: 'Referrals', value: 20, color: '#f59e0b' },
    { name: 'Website', value: 15, color: '#8b5cf6' },
    { name: 'Events', value: 5, color: '#ec4899' },
  ];

  const outboundResponseRates = [
    { channel: 'Email', rate: 12 },
    { channel: 'LinkedIn', rate: 8 },
    { channel: 'Phone', rate: 15 },
    { channel: 'Video', rate: 18 },
  ];

  const getPipelineStages = () => {
    const stages = ['lead', 'qualified', 'demo_scheduled', 'trial', 'negotiation', 'closed_won', 'closed_lost'];
    return stages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const totalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);
      return {
        stage: stage.replace('_', ' '),
        count: stageDeals.length,
        amount: totalAmount,
      };
    });
  };

  const pipelineStages = getPipelineStages();

  const expectedToClose = deals
    .filter(d => d.stage === 'negotiation')
    .reduce((sum, d) => sum + d.amount, 0);

  const lostThisWeek = deals
    .filter(d => d.stage === 'closed_lost')
    .reduce((sum, d) => sum + d.amount, 0);

  const onTrial = deals.filter(d => d.stage === 'trial').length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Funnel & Pipeline</h2>
        <p className="text-gray-600 mt-1">Automatic pipeline health and conversion metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Expected to Close This Month"
          value={formatAmount(expectedToClose)}
          subtitle={`${deals.filter(d => d.stage === 'negotiation').length} deals in negotiation`}
          color="success"
          trend="up"
        />
        <MetricCard
          title="Lost This Week"
          value={formatAmount(lostThisWeek)}
          subtitle={`${deals.filter(d => d.stage === 'closed_lost').length} deals lost`}
          color="danger"
          trend="down"
        />
        <MetricCard
          title="Currently on Trial"
          value={onTrial}
          subtitle="Active trials"
          color="primary"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Inbound Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={inboundSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {inboundSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Outbound Response Rates</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outboundResponseRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" />
              <YAxis />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="rate" fill="#3b82f6" name="Response Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Stage Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pipelineStages} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="stage" type="category" width={120} />
            <Tooltip
              formatter={(value, name) => [
                name === 'count' ? `${value} deals` : formatAmount(value as number),
                name === 'count' ? 'Deals' : 'Amount'
              ]}
            />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Deals" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pipeline Value by Stage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pipelineStages}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => formatAmount(value as number)} />
            <Legend />
            <Bar dataKey="amount" fill="#10b981" name="Pipeline Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};