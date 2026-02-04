import { SlackMessage } from '../types';

interface SlackMessageProps {
  message: SlackMessage;
  isHighlighted?: boolean;
  onActionClick?: () => void;
}

export function SlackMessageCard({ message, isHighlighted, onActionClick }: SlackMessageProps) {
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-400 bg-orange-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-gray-300 bg-gray-50';
      case 'noise': return 'border-gray-200 bg-gray-50 opacity-60';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getAvatarColor = (avatar: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'
    ];
    const index = avatar.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className={`
        border-l-4 p-4 rounded-r-lg mb-3 transition-all duration-200
        ${isHighlighted ? 'border-red-500 bg-red-50 shadow-lg ring-2 ring-red-200' : getImportanceColor(message.importance)}
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${getAvatarColor(message.avatar || message.from[0])} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
          {message.avatar || message.from[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900">{message.from}</span>
            <span className="text-xs text-gray-500">{getRelativeTime(message.timestamp)}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">{message.channel}</span>
          </div>
          <p className="text-gray-800 text-sm leading-relaxed">{message.message}</p>
          {isHighlighted && onActionClick && (
            <button
              onClick={onActionClick}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Send Contract to Acme Corp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}