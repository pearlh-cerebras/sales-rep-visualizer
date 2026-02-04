import { useState, useEffect } from 'react';
import { SlackMessageCard } from '../components/SlackMessage';
import { SlackMessage } from '../types';

interface TrialRequest {
  id: string;
  from: string;
  email: string;
  company: string;
  message: string;
  timestamp: string;
}

interface Alert {
  id: string;
  type: 'ready_to_sign' | 'trial_ending' | 'churn_risk' | 'payment_received';
  title: string;
  message: string;
  company: string;
  dealId?: string;
  timestamp: string;
}

export function Inbox() {
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [slackMessages, setSlackMessages] = useState<SlackMessage[]>([]);
  const [contractSent, setContractSent] = useState(false);
  const [channelCreated, setChannelCreated] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'high' | 'medium' | 'low' | 'noise'>('all');

  useEffect(() => {
    fetchTrialRequests();
    fetchAlerts();
    fetchDemoMessages();
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchTrialRequests();
      fetchAlerts();
      fetchDemoMessages();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrialRequests = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/crm/trial-requests');
      const data = await response.json();
      setTrialRequests(data);
    } catch (error) {
      console.error('Error fetching trial requests:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/crm/alerts');
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const fetchDemoMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/crm/demo-messages');
      const data = await response.json();
      // Convert timestamps and map to SlackMessage format
      const messages: SlackMessage[] = data.map((msg: any) => ({
        id: msg.id,
        channel: msg.channel,
        message: msg.message,
        from: msg.from,
        timestamp: new Date(msg.timestamp),
        importance: msg.importance,
        avatar: msg.avatar || msg.from.charAt(0).toUpperCase(),
      }));
      setSlackMessages(messages);
    } catch (error) {
      console.error('Error fetching demo messages:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await fetch(`http://localhost:3001/api/crm/alerts/${alertId}/dismiss`, {
        method: 'POST',
      });
      fetchAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const handleSendContract = () => {
    setContractSent(true);
    setTimeout(() => {
      setContractSent(false);
    }, 3000);
  };

  const handleCreateChannel = async (request: TrialRequest) => {
    try {
      const channelRes = await fetch('http://localhost:3001/api/slack/create-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `trial-${request.company}` }),
      });

      const channelData = await channelRes.json();

      if (channelData.channelId) {
        await fetch('http://localhost:3001/api/slack/post-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: channelData.channelId,
            text: `Channel created for ${request.company}. Customer ${request.from} (${request.email}) has been invited to discuss their trial.`,
          }),
        });

        await fetch(`http://localhost:3001/api/crm/deals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company: request.company,
            email: request.email,
            stage: 'free_trial',
            amount: 0,
          }),
        });

        await fetch(`http://localhost:3001/api/crm/trial-requests/${request.id}/dismiss`, {
          method: 'POST',
        });

        setChannelCreated(request.company);
        setTimeout(() => setChannelCreated(null), 3000);
        fetchTrialRequests();
      }
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleDismiss = async (requestId: string) => {
    try {
      await fetch(`http://localhost:3001/api/crm/trial-requests/${requestId}/dismiss`, {
        method: 'POST',
      });
      fetchTrialRequests();
    } catch (error) {
      console.error('Error dismissing trial request:', error);
    }
  };

  const criticalMessages = slackMessages.filter(m => m.importance === 'critical' || m.importance === 'high');

  // Filter messages by urgency
  const highMessages = slackMessages.filter(m => m.importance === 'high' || m.importance === 'critical');
  const mediumMessages = slackMessages.filter(m => m.importance === 'medium');
  const lowMessages = slackMessages.filter(m => m.importance === 'low');
  const noiseMessages = slackMessages.filter(m => m.importance === 'noise' || !m.importance);

  const getFilteredMessages = () => {
    switch (urgencyFilter) {
      case 'high': return highMessages;
      case 'medium': return mediumMessages;
      case 'low': return lowMessages;
      default: return slackMessages;
    }
  };

  const filteredMessages = getFilteredMessages();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Slack Inbox</h1>
        <p className="text-gray-600">Aggregated notifications from all your channels - ranked by AI</p>
      </div>

      {/* Urgency Filter Tabs */}
      {slackMessages.length > 0 && (
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              urgencyFilter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({slackMessages.length})
          </button>
          <button
            onClick={() => setUrgencyFilter('high')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              urgencyFilter === 'high'
                ? 'bg-red-600 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            High ({highMessages.length})
          </button>
          <button
            onClick={() => setUrgencyFilter('medium')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              urgencyFilter === 'medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Medium ({mediumMessages.length})
          </button>
          <button
            onClick={() => setUrgencyFilter('low')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              urgencyFilter === 'low'
                ? 'bg-green-600 text-white'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Low ({lowMessages.length})
          </button>
        </div>
      )}

      {contractSent && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-medium">Contract sent to Acme Corp!</span>
        </div>
      )}

      {channelCreated && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-blue-800 font-medium">Channel created for {channelCreated}!</span>
        </div>
      )}

      {/* Ready to Sign Alerts */}
      {alerts.filter(a => a.type === 'ready_to_sign').length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-gray-900">
              🎉 {alerts.filter(a => a.type === 'ready_to_sign').length} Ready to Sign!
            </h2>
          </div>
          <div className="space-y-3">
            {alerts.filter(a => a.type === 'ready_to_sign').map(alert => (
              <div key={alert.id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600">{alert.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismissAlert(alert.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-700 mb-4">{alert.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSendContract()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Send Contract
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {trialRequests.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg font-semibold text-gray-900">
              🎯 {trialRequests.length} Trial Request{trialRequests.length > 1 ? 's' : ''}
            </h2>
          </div>
          <div className="space-y-3">
            {trialRequests.map(request => (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.from}</h3>
                    <p className="text-sm text-gray-600">{request.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">{request.company}</span>
                </div>
                <p className="text-sm text-gray-700 mb-4">{request.message}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDismiss(request.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleCreateChannel(request)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Create Channel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Urgency Filter Tabs */}
      {slackMessages.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">📬 Messages by Urgency</h2>
          </div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setUrgencyFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                urgencyFilter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({slackMessages.length})
            </button>
            <button
              onClick={() => setUrgencyFilter('high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                urgencyFilter === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              High ({criticalMessages.length})
            </button>
            <button
              onClick={() => setUrgencyFilter('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                urgencyFilter === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              Medium ({mediumMessages.length})
            </button>
            <button
              onClick={() => setUrgencyFilter('low')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                urgencyFilter === 'low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Low ({lowMessages.length})
            </button>
            <button
              onClick={() => setUrgencyFilter('noise')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                urgencyFilter === 'noise'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              Noise ({noiseMessages.length})
            </button>
          </div>
          
          {/* Filtered Messages */}
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No messages in this category</p>
              </div>
            ) : (
              filteredMessages.map(message => (
                <SlackMessageCard
                  key={message.id}
                  message={message}
                  isHighlighted={message.importance === 'critical' || message.importance === 'high'}
                  onActionClick={handleSendContract}
                />
              ))
            )}
          </div>
        </div>
      )}

      {slackMessages.length === 0 && trialRequests.length === 0 && alerts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Inbox is Empty</h3>
          <p className="text-gray-600 mb-4">
            No messages or notifications yet. Run the interactive demo to populate the inbox.
          </p>
          <code className="bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
            npm run interactive-demo
          </code>
        </div>
      )}
    </div>
  );
}