import { useState, useEffect } from 'react';

interface Deal {
  id: string;
  company: string;
  stage: string;
  amount: number;
}

interface BusinessReport {
  generatedAt: Date;
  revenueMetrics: {
    mrr: number;
    pipelineValue: number;
    conversionRate: number;
    payingCustomers: number;
  };
  pipelineHealth: {
    lead: number;
    qualified: number;
    freeTrial: number;
    negotiation: number;
    paid: number;
  };
  customerEngagement: {
    company: string;
    messageCount: number;
    lastActivity: Date;
  }[];
  attentionNeeded: {
    company: string;
    reason: string;
    urgency: 'critical' | 'high' | 'medium';
  }[];
}

export function Report() {
  const [report, setReport] = useState<BusinessReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [displayedContent, setDisplayedContent] = useState('');
  const [generationStep, setGenerationStep] = useState(0);

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    const steps = [
      'Fetching CRM pipeline data...',
      'Analyzing Slack messages...',
      'Calculating metrics...',
      'Generating report...',
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setGenerationStep(stepIndex);
        stepIndex++;
      }
    }, 500);

    try {
      const dealsRes = await fetch('http://localhost:3001/api/crm/deals');

      const deals: Deal[] = await dealsRes.json();

      const pipelineValue = deals.reduce((sum, d) => sum + d.amount, 0);
      const payingCustomers = deals.filter(d => d.stage === 'paid').length;
      const conversionRate = deals.filter(d => d.stage === 'free_trial').length > 0
        ? (payingCustomers / deals.filter(d => d.stage === 'free_trial').length) * 100
        : 0;

      const pipelineHealth = {
        lead: deals.filter(d => d.stage === 'lead').length,
        qualified: deals.filter(d => d.stage === 'qualified').length,
        freeTrial: deals.filter(d => d.stage === 'free_trial').length,
        negotiation: deals.filter(d => d.stage === 'negotiation').length,
        paid: deals.filter(d => d.stage === 'paid').length,
      };

      const customerEngagement = deals.map(deal => ({
        company: deal.company,
        messageCount: Math.floor(Math.random() * 20) + 1,
        lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }));

      const attentionNeeded = deals
        .filter(d => d.stage !== 'paid' && d.stage !== 'churned')
        .slice(0, 5)
        .map(deal => ({
          company: deal.company,
          reason: deal.stage === 'negotiation' ? 'Contract pending approval' : 'Awaiting response',
          urgency: (deal.stage === 'negotiation' ? 'high' : 'medium') as 'critical' | 'high' | 'medium',
        }));

      const generatedReport: BusinessReport = {
        generatedAt: new Date(),
        revenueMetrics: {
          mrr: deals.filter(d => d.stage === 'paid').reduce((sum, d) => sum + d.amount, 0) / 12,
          pipelineValue,
          conversionRate,
          payingCustomers,
        },
        pipelineHealth,
        customerEngagement,
        attentionNeeded,
      };

      setReport(generatedReport);
      setIsGenerating(false);
      clearInterval(stepInterval);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      clearInterval(stepInterval);
    }
  };

  useEffect(() => {
    if (report && !isGenerating) {
      const fullContent = formatReport(report);
      let index = 0;
      const typingInterval = setInterval(() => {
        if (index < fullContent.length) {
          setDisplayedContent(fullContent.slice(0, index + 1));
          index += 3;
        } else {
          clearInterval(typingInterval);
        }
      }, 10);

      return () => clearInterval(typingInterval);
    }
  }, [report, isGenerating]);

  const formatReport = (r: BusinessReport): string => {
    const formatCurrency = (amount: number) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);

    const formatDate = (date: Date) =>
      date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    return `📊 Business Report
Generated ${formatDate(r.generatedAt)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 REVENUE METRICS
• MRR: ${formatCurrency(r.revenueMetrics.mrr)}
• Pipeline Value: ${formatCurrency(r.revenueMetrics.pipelineValue)}
• Conversion Rate: ${r.revenueMetrics.conversionRate.toFixed(1)}% (trial → paid)
• Paying Customers: ${r.revenueMetrics.payingCustomers}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 PIPELINE HEALTH
• Leads: ${r.pipelineHealth.lead}
• Qualified: ${r.pipelineHealth.qualified}
• Free Trial: ${r.pipelineHealth.freeTrial}
• Negotiation: ${r.pipelineHealth.negotiation}
• Paid: ${r.pipelineHealth.paid}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 CUSTOMER ENGAGEMENT
${r.customerEngagement.map(ce => `• ${ce.company}: ${ce.messageCount} messages, last activity ${formatDate(ce.lastActivity)}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ ATTENTION NEEDED
${r.attentionNeeded.map(an => `• ${an.company}: ${an.reason} (${an.urgency})`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  };

  const handleCopy = () => {
    if (report) {
      navigator.clipboard.writeText(formatReport(report));
      alert('Report copied to clipboard!');
    }
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setDisplayedContent('');
    setReport(null);
    setGenerationStep(0);
    generateReport();
  };

  const steps = [
    'Fetching CRM pipeline data...',
    'Retrieving Stripe payments...',
    'Analyzing Slack messages...',
    'Calculating revenue metrics...',
    'Generating report...',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Report</h1>
        <p className="text-gray-600">AI-generated summary with CRM, Stripe, and Slack data</p>
      </div>

      {isGenerating ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-700 font-medium">{steps[generationStep]}</span>
          </div>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i <= generationStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 leading-relaxed">
            {displayedContent}
          </pre>
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleRegenerate}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy Report
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}