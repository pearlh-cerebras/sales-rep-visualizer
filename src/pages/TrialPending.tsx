import { useState, useEffect } from 'react';

interface TrialRequest {
  id: string;
  from: string;
  email: string;
  company: string;
  message: string;
  timestamp: string;
}

interface EmailThread {
  id: string;
  subject: string;
  from: string;
  company: string;
  messages: {
    id: string;
    from: string;
    content: string;
    timestamp: string;
  }[];
}

export function TrialPending() {
  const [trialRequests, setTrialRequests] = useState<TrialRequest[]>([]);
  const [channelCreated, setChannelCreated] = useState<string | null>(null);

  useEffect(() => {
    fetchTrialRequests();
    const interval = setInterval(fetchTrialRequests, 5000);
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

  const handleCreateChannel = async (request: TrialRequest) => {
    // Just dismiss the request and show success (no actual Slack channel creation)
    await fetch(`http://localhost:3001/api/crm/trial-requests/${request.id}/dismiss`, {
      method: 'POST',
    });
    setChannelCreated(request.company);
    setTimeout(() => setChannelCreated(null), 3000);
    fetchTrialRequests();
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

  // Group trial requests by company for email thread summary
  const getEmailThreadSummary = (request: TrialRequest): EmailThread => {
    return {
      id: request.id,
      subject: `Trial Request from ${request.company}`,
      from: request.from,
      company: request.company,
      messages: [
        {
          id: '1',
          from: request.from,
          content: request.message,
          timestamp: request.timestamp,
        },
      ],
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Trial Pending</h1>
        <p className="text-gray-600">Review incoming trial requests</p>
      </div>

      {channelCreated && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-800 font-medium">
            ✅ Channel created for {channelCreated}!
          </span>
        </div>
      )}

      {trialRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Trial Requests</h3>
          <p className="text-gray-600">
            When potential customers request a trial, they'll appear here for review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {trialRequests.map(request => {
            const thread = getEmailThreadSummary(request);
            return (
              <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Email Thread Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {request.company[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{thread.subject}</h3>
                        <p className="text-sm text-gray-600">
                          From: {request.from} &lt;{request.email}&gt;
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Pending Review
                    </span>
                  </div>
                </div>

                {/* Email Content / Thread Summary */}
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Email Thread Summary</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium text-sm">
                          {request.from[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{request.from}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(request.timestamp).toLocaleDateString()} at{' '}
                              {new Date(request.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700 italic">"{request.message}"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Company</div>
                      <div className="font-medium text-gray-900">{request.company}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500 mb-1">Contact Email</div>
                      <div className="font-medium text-gray-900">{request.email}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleDismiss(request.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleCreateChannel(request)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                      Create Channel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
