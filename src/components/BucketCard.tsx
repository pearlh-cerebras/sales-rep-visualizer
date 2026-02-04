import React from 'react';

interface BucketCardProps {
  title: string;
  count: number;
  totalAmount: number;
  color: 'success' | 'warning' | 'danger' | 'primary';
  icon: string;
}

export const BucketCard: React.FC<BucketCardProps> = ({ title, count, totalAmount, color, icon }) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success-50 border-success-200 hover:bg-success-100';
      case 'warning':
        return 'bg-warning-50 border-warning-200 hover:bg-warning-100';
      case 'danger':
        return 'bg-danger-50 border-danger-200 hover:bg-danger-100';
      case 'primary':
        return 'bg-primary-50 border-primary-200 hover:bg-primary-100';
      default:
        return 'bg-gray-50 border-gray-200 hover:bg-gray-100';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'success':
        return 'text-success-600';
      case 'warning':
        return 'text-warning-600';
      case 'danger':
        return 'text-danger-600';
      case 'primary':
        return 'text-primary-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${getColorClasses(color)}`}>
      <div className="flex items-center justify-between mb-4">
        <span className={`text-3xl ${getIconColor(color)}`}>{icon}</span>
        <span className="text-4xl font-bold text-gray-900">{count}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{formatAmount(totalAmount)} at stake</p>
    </div>
  );
};