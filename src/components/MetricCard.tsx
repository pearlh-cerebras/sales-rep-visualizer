import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, trend, color = 'primary' }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'danger':
        return 'bg-danger-50 border-danger-200';
      case 'primary':
      default:
        return 'bg-primary-50 border-primary-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-success-600">↑</span>;
      case 'down':
        return <span className="text-danger-600">↓</span>;
      case 'neutral':
        return <span className="text-gray-400">→</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getColorClasses(color)}`}>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <div className="flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {getTrendIcon(trend)}
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};