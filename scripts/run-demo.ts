import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

// Sample customer messages with varying urgency
const DEMO_MESSAGES = [
  { channel: '#customer-techflow', from: 'Sarah Chen', message: 'Our contract is up for renewal next week. Ready to sign if you can get us the docs today!', importance: 'high', mentionsUser: true },
  { channel: '#customer-datawise', from: 'Mike Johnson', message: 'Budget approved! Legal is ready to review the contract.', importance: 'high', mentionsUser: true },
  { channel: '#customer-cloudnine', from: 'Lisa Park', message: 'We need to discuss expanding our license count before the quarter ends.', importance: 'medium', mentionsUser: true },
  { channel: '#customer-megasystems', from: 'James Wilson', message: 'Can someone help me with the API integration?', importance: 'medium', mentionsUser: false },
  { channel: '#customer-innovatex', from: 'Emma Davis', message: 'Just checking in on our support ticket from last week.', importance: 'low', mentionsUser: false },
  { channel: '#customer-brightpath', from: 'Alex Turner', message: 'Thanks for the demo yesterday! Team loved it.', importance: 'low', mentionsUser: true },
  { channel: '#customer-synergy', from: 'Nicole Brown', message: 'FYI - we\'ll be out of office next week for the holidays.', importance: 'noise', mentionsUser: false },
  { channel: '#customer-quantum', from: 'Kevin Lee', message: 'Meeting notes from our call attached.', importance: 'noise', mentionsUser: false },
];

async function runDemo() {
  console.log('🚀 Running Sales Saver Demo\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Clear old demo data
    console.log('🧹 Clearing previous demo data...');
    await apiCall('/crm/reset', 'POST');

    // Step 2: Create trial request from Dannyshizzle
    console.log('📧 Creating trial request from Dannyshizzle...');
    await apiCall('/crm/trial-requests', 'POST', {
      from: 'Dannyshizzle',
      email: 'daniel.kim@cerebras.net',
      company: 'Daniel',
      message: `Hi. I'm extremely important CEO of my company.
I would like trial access to Cerebras, as it is super needed.

Please respond quickly, as I am very important.
Thank you,
Daniel "Dannyshizzle" Kim`
    });

    // Step 3: Create CRM deal for Daniel
    console.log('� Creating CRM deal for Daniel...');
    await apiCall('/crm/deals', 'POST', {
      company: 'Daniel',
      email: 'daniel.kim@cerebras.net',
      stage: 'lead',
      amount: 50000,
    });

    // Step 4: Add demo messages to inbox
    console.log('💬 Adding customer messages to inbox...');
    for (const msg of DEMO_MESSAGES) {
      await apiCall('/crm/demo-messages', 'POST', {
        ...msg,
        timestamp: new Date().toISOString(),
        avatar: msg.from.charAt(0).toUpperCase(),
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Demo data loaded!\n');
    console.log('💡 Open your app and explore:');
    console.log('   - Inbox tab: Customer messages (filter by urgency)');
    console.log('   - Trial Pending tab: Dannyshizzle\'s trial request');
    console.log('   - CRM tab: Daniel deal in Lead stage');
    console.log('   - Report tab: Generate a business report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Error running demo:', error);
    console.log('\n⚠️  Make sure the server is running: npm run server');
  }
}

runDemo();