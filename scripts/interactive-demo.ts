import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';
import Anthropic from '@anthropic-ai/sdk';
import * as readline from 'readline';

dotenv.config();

const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION - Customize these values for your demo
// ═══════════════════════════════════════════════════════════════════════════

// 30 Customer channels
const CUSTOMER_CHANNELS = [
  '#customer-acme-corp',
  '#customer-techflow',
  '#customer-datawise',
  '#customer-cloudnine',
  '#customer-megasystems',
  '#customer-innovatex',
  '#customer-brightpath',
  '#customer-synergy-io',
  '#customer-quantum-labs',
  '#customer-nexgen',
  '#customer-alphatech',
  '#customer-betaworks',
  '#customer-gammaforce',
  '#customer-deltaco',
  '#customer-epsilon-ai',
  '#customer-zetacloud',
  '#customer-etahub',
  '#customer-thetasoft',
  '#customer-iotadigital',
  '#customer-kappaventures',
  '#customer-lambdalabs',
  '#customer-musigma',
  '#customer-nuwave',
  '#customer-omicron-tech',
  '#customer-pidata',
  '#customer-rhoanalytics',
  '#customer-sigmaflow',
  '#customer-tauscale',
  '#customer-upsilon-sys',
  '#customer-phiworks',
];

// Your Slack user ID for @mentions (find this in your Slack profile)
const YOUR_SLACK_USER_ID = process.env.DEMO_SLACK_USER_ID || 'U123456789';

// Customer bot user ID (for inviting to channels)
const CUSTOMER_BOT_USER_ID = process.env.CUSTOMER_BOT_USER_ID;

// Base URL for the API
const API_BASE = 'http://localhost:3001/api';

// ═══════════════════════════════════════════════════════════════════════════
// DEMO DATA - Generate messages for all 30 channels
// ═══════════════════════════════════════════════════════════════════════════

interface CustomerMessage {
  channel: string;
  text: string;
  customer: string;
  mentionUser?: boolean;
  urgency?: 'high' | 'medium' | 'low';
}

// Variety of customer message templates (urgency will be determined by Claude)
const messageTemplates = [
  // Urgent-sounding messages
  { text: `<@${YOUR_SLACK_USER_ID}> URGENT: Need to discuss contract before our board meeting today!`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Production issue! Can you help immediately?`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> CEO is asking about the proposal - need response ASAP!`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Critical bug affecting our users - please help!`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Deal is at risk - competitor just reached out to us!`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Our system is down and we're losing money every minute!`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Board presentation in 1 hour - need updated numbers NOW`, mentionUser: true },
  // High priority messages
  { text: `<@${YOUR_SLACK_USER_ID}> Legal approved the contract! Ready to sign today.`, mentionUser: true },
  { text: `<@${YOUR_SLACK_USER_ID}> Budget has been approved - let's finalize pricing.`, mentionUser: true },
  { text: 'We need to finalize the contract by EOW. What are next steps?', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> Can we schedule a call to discuss enterprise pricing?`, mentionUser: true },
  { text: 'Ready to upgrade to annual plan. Please send invoice.', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> CFO wants to see ROI analysis before Friday`, mentionUser: true },
  { text: 'Contract is with legal, expecting approval tomorrow', mentionUser: false },
  // Medium priority messages
  { text: `<@${YOUR_SLACK_USER_ID}> Quick question about the API integration.`, mentionUser: true },
  { text: 'Team is loving the product! Any new features coming soon?', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> Can you share the latest case studies?`, mentionUser: true },
  { text: 'Wanted to follow up on our conversation from last week.', mentionUser: false },
  { text: 'Looking at expanding to more departments next quarter.', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> When is the next product update scheduled?`, mentionUser: true },
  { text: 'Can you send over the security documentation?', mentionUser: false },
  // Lower priority messages
  { text: `<@${YOUR_SLACK_USER_ID}> Thanks for the great demo yesterday!`, mentionUser: true },
  { text: 'Just checking in - everything is going smoothly.', mentionUser: false },
  { text: 'FYI - shared the product with some colleagues.', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> Do you have any upcoming webinars?`, mentionUser: true },
  { text: 'The new dashboard looks great!', mentionUser: false },
  { text: 'Happy Friday! Hope you have a great weekend.', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> Just wanted to say thanks for all your help!`, mentionUser: true },
  { text: 'Our team had their offsite last week, will reconnect soon.', mentionUser: false },
  { text: 'No rush, but when you get a chance can you send those docs?', mentionUser: false },
  { text: `<@${YOUR_SLACK_USER_ID}> Quick FYI - we're on holiday next week`, mentionUser: true },
];

// Company name suffixes for generating customer names
const companyNames = [
  'Acme Corp', 'TechFlow', 'DataWise', 'CloudNine', 'MegaSystems',
  'InnovateX', 'BrightPath', 'Synergy.io', 'Quantum Labs', 'NexGen',
  'AlphaTech', 'BetaWorks', 'GammaForce', 'DeltaCo', 'Epsilon AI',
  'ZetaCloud', 'EtaHub', 'ThetaSoft', 'IotaDigital', 'KappaVentures',
  'LambdaLabs', 'MuSigma', 'NuWave', 'Omicron Tech', 'PiData',
  'RhoAnalytics', 'SigmaFlow', 'TauScale', 'Upsilon Sys', 'PhiWorks',
];

const contactNames = [
  'Sarah', 'John', 'Emily', 'Michael', 'Jessica', 'David', 'Ashley', 'Chris',
  'Amanda', 'Ryan', 'Nicole', 'Kevin', 'Stephanie', 'Brian', 'Lauren',
  'Matthew', 'Rachel', 'Daniel', 'Megan', 'Andrew', 'Jennifer', 'James',
  'Michelle', 'Robert', 'Elizabeth', 'William', 'Samantha', 'Joseph', 'Kayla', 'Thomas',
];

// Generate messages - at least one mention per channel (urgency will be set by Claude)
function generateCustomerMessages(): CustomerMessage[] {
  const messages: CustomerMessage[] = [];
  
  CUSTOMER_CHANNELS.forEach((channel, index) => {
    const companyName = companyNames[index];
    const contactName = contactNames[index];
    
    // Pick random templates for this channel
    const shuffledTemplates = [...messageTemplates].sort(() => Math.random() - 0.5);
    
    // First message always mentions the user
    const mentionTemplate = shuffledTemplates.find(t => t.mentionUser) || shuffledTemplates[0];
    messages.push({
      channel,
      text: mentionTemplate.text,
      customer: `${contactName} from ${companyName}`,
      mentionUser: true,
    });
    
    // Add 1-2 additional messages per channel
    const additionalCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < additionalCount; i++) {
      const template = shuffledTemplates[i % shuffledTemplates.length];
      messages.push({
        channel,
        text: template.text,
        customer: `${contactName} from ${companyName}`,
        mentionUser: template.mentionUser,
      });
    }
  });
  
  // Shuffle messages to make it feel more realistic
  return messages.sort(() => Math.random() - 0.5);
}

// Use Claude to rank messages by urgency
async function rankMessagesWithClaude(messages: CustomerMessage[]): Promise<CustomerMessage[]> {
  console.log('  🤖 Using Claude to analyze and rank message urgency...\n');
  
  const messagesForAnalysis = messages.map((m, i) => ({
    id: i,
    text: m.text.replace(/<@[^>]+>/g, '@user'), // Clean up Slack mentions for readability
    customer: m.customer,
    channel: m.channel,
  }));

  const prompt = `You are a sales prioritization assistant. Analyze these customer messages and rank each one by urgency.

MESSAGES:
${JSON.stringify(messagesForAnalysis, null, 2)}

For each message, determine the urgency level:
- "high": Urgent action needed - mentions deadlines, emergencies, production issues, board meetings, deals at risk, ready to sign, budget approved, legal approved
- "medium": Important but not urgent - follow-ups, questions, interest in features, scheduling requests
- "low": Low priority - thank you notes, casual check-ins, FYIs, no action needed

Return a JSON array with the message id and urgency level for each message. Only return the JSON array, no other text.

Example format:
[{"id": 0, "urgency": "high"}, {"id": 1, "urgency": "medium"}, ...]`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Parse Claude's response
    const rankings: { id: number; urgency: 'high' | 'medium' | 'low' }[] = JSON.parse(content.text);
    
    // Apply rankings to messages
    const rankedMessages = messages.map((msg, index) => {
      const ranking = rankings.find(r => r.id === index);
      return {
        ...msg,
        urgency: ranking?.urgency || 'medium',
      };
    });

    // Sort by urgency (high first, then medium, then low)
    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    rankedMessages.sort((a, b) => urgencyOrder[a.urgency!] - urgencyOrder[b.urgency!]);

    const highCount = rankedMessages.filter(m => m.urgency === 'high').length;
    const mediumCount = rankedMessages.filter(m => m.urgency === 'medium').length;
    const lowCount = rankedMessages.filter(m => m.urgency === 'low').length;

    console.log(`  ✅ Claude ranked ${messages.length} messages:`);
    console.log(`     🔴 High:   ${highCount} messages`);
    console.log(`     🟡 Medium: ${mediumCount} messages`);
    console.log(`     🟢 Low:    ${lowCount} messages\n`);

    return rankedMessages;
  } catch (error: any) {
    console.error(`  ⚠️  Claude ranking failed: ${error.message}`);
    console.log('  ℹ️  Falling back to keyword-based ranking...\n');
    
    // Fallback: simple keyword-based ranking
    return messages.map(msg => {
      const text = msg.text.toLowerCase();
      let urgency: 'high' | 'medium' | 'low' = 'medium';
      
      if (text.includes('urgent') || text.includes('asap') || text.includes('immediately') ||
          text.includes('critical') || text.includes('down') || text.includes('board meeting') ||
          text.includes('ready to sign') || text.includes('approved') || text.includes('at risk')) {
        urgency = 'high';
      } else if (text.includes('thanks') || text.includes('fyi') || text.includes('no rush') ||
                 text.includes('checking in') || text.includes('great') || text.includes('happy')) {
        urgency = 'low';
      }
      
      return { ...msg, urgency };
    }).sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency!] - urgencyOrder[b.urgency!];
    });
  }
}

let customerFloodMessages = generateCustomerMessages();

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function waitForEnter(prompt: string): Promise<void> {
  return new Promise((resolve) => {
    rl.question(`\n${prompt}\n👉 Press ENTER to continue...`, () => {
      resolve();
    });
  });
}

function printHeader(step: number, title: string) {
  console.log('\n');
  console.log('═'.repeat(60));
  console.log(`  STEP ${step}: ${title}`);
  console.log('═'.repeat(60));
}

function printSubHeader(text: string) {
  console.log(`\n  📌 ${text}`);
  console.log('  ' + '─'.repeat(50));
}

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json();
}

// ═══════════════════════════════════════════════════════════════════════════
// DEMO STEPS
// ═══════════════════════════════════════════════════════════════════════════

async function step1_floodChannels() {
  printHeader(1, 'FLOODING SLACK CHANNELS WITH CUSTOMER MESSAGES');
  console.log('\n  This simulates a busy day with messages coming in from');
  console.log('  multiple customers across 30 different customer channels.');
  console.log(`\n  Channels: ${CUSTOMER_CHANNELS.length} customer channels`);
  console.log(`  Messages: ${customerFloodMessages.length} total`);
  console.log(`  Mentions: ${customerFloodMessages.filter(m => m.mentionUser).length} messages will @mention you`);

  await waitForEnter('Ready to analyze and rank messages with Claude?');

  // Use Claude to rank messages by urgency
  customerFloodMessages = await rankMessagesWithClaude(customerFloodMessages);

  await waitForEnter('Ready to flood the channels with ranked messages?');

  // Clear previous demo messages first
  try {
    await fetch(`${API_BASE}/crm/demo-messages`, { method: 'DELETE' });
  } catch (e) {
    // Ignore errors
  }

  console.log('\n  🚀 Sending messages...\n');

  for (const msg of customerFloodMessages) {
    try {
      const urgency = msg.urgency || 'medium';
      const urgencyEmoji = {
        high: '�',
        medium: '🟡',
        low: '🟢',
      }[urgency];

      // Post to Slack
      await botClient.chat.postMessage({
        channel: msg.channel,
        text: msg.text,
        username: msg.customer,
        icon_emoji: ':bust_in_silhouette:',
      });

      // Also add to the demo messages store for the UI
      await apiCall('/crm/demo-messages', 'POST', {
        channel: msg.channel,
        message: msg.text.replace(/<@[^>]+>/g, '@you'), // Replace Slack mention with readable text
        from: msg.customer,
        importance: urgency,
        mentionsUser: msg.mentionUser || false,
        avatar: msg.customer.split(' ')[0].charAt(0).toUpperCase(),
      });

      console.log(`  ${urgencyEmoji} [${urgency.toUpperCase()}] ${msg.customer} → ${msg.channel}`);
      if (msg.mentionUser) {
        console.log(`     📢 @mentioned you!`);
      }

      // Small delay between messages to make it feel realistic
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error: any) {
      console.error(`  ❌ Failed to send message to ${msg.channel}: ${error.message}`);
    }
  }

  console.log('\n  ✅ All messages sent!');
  console.log('  💡 Check your Slack workspace AND the Inbox tab to see the messages.');
  console.log('  💡 Use the High/Medium/Low tabs to filter by urgency.');
}

async function step2_acmeCorpEmail() {
  printHeader(2, 'EMAIL FROM DANNYSHIZZLE');
  console.log('\n  A new prospect, Dannyshizzle, sends an email asking about');
  console.log('  trying out your product.');

  await waitForEnter('Ready to receive the email from Dannyshizzle?');

  printSubHeader('Creating trial request from Dannyshizzle...');

  try {
    const trialRequest = await apiCall('/crm/trial-requests', 'POST', {
      from: 'Dannyshizzle',
      email: 'daniel.kim@cerebras.net',
      company: 'Daniel',
      message: `Hi. I'm extremely important CEO of my company.
I would like trial access to Cerebras, as it is super needed.

Please respond quickly, as I am very important.
Thank you,
Daniel "Dannyshizzle" Kim`,
    });

    console.log('\n  📧 New Trial Request Received!');
    console.log('  ─'.repeat(25));
    console.log(`  From:    ${trialRequest.from}`);
    console.log(`  Email:   ${trialRequest.email}`);
    console.log(`  Company: ${trialRequest.company}`);
    console.log(`  Message: "${trialRequest.message}"`);
    console.log('  ─'.repeat(25));

    console.log('\n  ✅ Trial request created!');
    console.log('  💡 Check the "Trial Pending" tab in the app to see the request.');
    console.log('     (Look for the yellow badge on the tab showing pending trials!)');

    return trialRequest;
  } catch (error: any) {
    console.error(`  ❌ Failed to create trial request: ${error.message}`);
    return null;
  }
}

async function step4_moveAcmeToTrial() {
  printHeader(3, 'MOVE DANIEL TO "IN TRIAL" IN CRM');
  console.log('\n  Now we\'ll update the CRM to move Daniel from');
  console.log('  Lead → Free Trial stage.');

  await waitForEnter('Ready to update the CRM?');

  printSubHeader('Creating/updating deal for Daniel...');

  try {
    // First check if there's already a Daniel deal
    const deals = await apiCall('/crm/deals');
    let danielDeal = deals.find((d: any) => d.company === 'Daniel');

    if (danielDeal) {
      // Update existing deal to free_trial
      danielDeal = await apiCall(`/crm/deals/${danielDeal.id}/stage`, 'PATCH', {
        stage: 'free_trial',
      });
      console.log('\n  ✅ Updated existing Daniel deal');
    } else {
      // Create new deal in free_trial stage
      danielDeal = await apiCall('/crm/deals', 'POST', {
        company: 'Daniel',
        email: 'daniel.kim@cerebras.net',
        stage: 'free_trial',
        amount: 50000,
      });
      console.log('\n  ✅ Created new deal for Daniel');
    }

    console.log('\n  📊 Deal Updated:');
    console.log('  ─'.repeat(25));
    console.log(`  Company: ${danielDeal.company}`);
    console.log(`  Stage:   ${danielDeal.stage} (Free Trial)`);
    console.log(`  Amount:  $${danielDeal.amount?.toLocaleString() || 'TBD'}`);
    console.log('  ─'.repeat(25));

    console.log('\n  💡 Check the CRM tab to see Daniel in the Free Trial stage.');

    return danielDeal;
  } catch (error: any) {
    console.error(`  ❌ Failed to update CRM: ${error.message}`);
    return null;
  }
}

async function step5_spaghettiOReadyToSign() {
  printHeader(4, 'SPAGHETTI O READY TO SIGN!');
  console.log('\n  Another customer, Spaghetti O, has finished their trial');
  console.log('  and is expressing strong interest in signing.');

  await waitForEnter('Ready to receive the good news?');

  printSubHeader('Creating deal for Spaghetti O...');

  try {
    // Create/update Spaghetti O deal in negotiation stage
    const spaghettiDeal = await apiCall('/crm/deals', 'POST', {
      company: 'Spaghetti O',
      email: 'cto@spaghetti-o.com',
      stage: 'negotiation',
      amount: 75000,
    });

    console.log('\n  📊 Deal Created:');
    console.log('  ─'.repeat(25));
    console.log(`  Company: ${spaghettiDeal.company}`);
    console.log(`  Stage:   ${spaghettiDeal.stage} (Negotiation)`);
    console.log(`  Amount:  $${spaghettiDeal.amount?.toLocaleString()}`);
    console.log('  ─'.repeat(25));

    // Create an alert in the CRM
    printSubHeader('Creating "Ready to Sign" alert in the app...');

    await apiCall('/crm/alerts', 'POST', {
      type: 'ready_to_sign',
      title: 'Spaghetti O Ready to Sign!',
      message: 'They\'ve completed their trial and loved it. Ready to move forward with the $75K annual plan.',
      company: 'Spaghetti O',
      dealId: spaghettiDeal.id,
    });

    console.log('  ✅ Alert created in the app!');

    // Send alert message to a channel
    printSubHeader('Sending "Ready to Sign" alert to Slack...');

    const alertMessage = `🎉 *READY TO SIGN ALERT* 🎉\n\n` +
      `<@${YOUR_SLACK_USER_ID}> Great news! *Spaghetti O* has completed their trial and expressed strong interest in signing!\n\n` +
      `• Contact: CTO (cto@spaghetti-o.com)\n` +
      `• Deal Value: $75,000\n` +
      `• Status: Ready for contract\n\n` +
      `_"We've loved the trial! Ready to move forward with the annual plan."_`;

    await botClient.chat.postMessage({
      channel: '#sales-inquiries',
      text: alertMessage,
      username: 'Sales Bot',
      icon_emoji: ':moneybag:',
    });

    console.log('\n  🔔 Alert sent to #sales-inquiries!');
    console.log('  💡 Check the Inbox tab to see the "Ready to Sign" alert.');

    return spaghettiDeal;
  } catch (error: any) {
    console.error(`  ❌ Failed: ${error.message}`);
    return null;
  }
}

async function step6_generateReport() {
  printHeader(5, 'GENERATE SUMMARY REPORT');
  console.log('\n  Finally, let\'s generate a summary report of all the');
  console.log('  activity that happened during this demo.');

  await waitForEnter('Ready to generate the report?');

  printSubHeader('Fetching current pipeline data...');

  try {
    const deals = await apiCall('/crm/deals');
    const trialRequests = await apiCall('/crm/trial-requests');

    // Calculate metrics
    const totalPipeline = deals.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
    const byStage = {
      lead: deals.filter((d: any) => d.stage === 'lead'),
      qualified: deals.filter((d: any) => d.stage === 'qualified'),
      free_trial: deals.filter((d: any) => d.stage === 'free_trial'),
      negotiation: deals.filter((d: any) => d.stage === 'negotiation'),
      paid: deals.filter((d: any) => d.stage === 'paid'),
    };

    console.log('\n');
    console.log('  ╔══════════════════════════════════════════════════════╗');
    console.log('  ║           📊 BUSINESS SUMMARY REPORT                 ║');
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log(`  ║  Generated: ${new Date().toLocaleString().padEnd(39)}║`);
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log('  ║  PIPELINE OVERVIEW                                   ║');
    console.log('  ╟──────────────────────────────────────────────────────╢');
    console.log(`  ║  Total Pipeline Value: $${totalPipeline.toLocaleString().padEnd(29)}║`);
    console.log(`  ║  Total Deals: ${deals.length.toString().padEnd(40)}║`);
    console.log('  ╟──────────────────────────────────────────────────────╢');
    console.log('  ║  BY STAGE:                                           ║');
    console.log(`  ║    • Lead:        ${byStage.lead.length} deals`.padEnd(55) + '║');
    console.log(`  ║    • Qualified:   ${byStage.qualified.length} deals`.padEnd(55) + '║');
    console.log(`  ║    • Free Trial:  ${byStage.free_trial.length} deals`.padEnd(55) + '║');
    console.log(`  ║    • Negotiation: ${byStage.negotiation.length} deals`.padEnd(55) + '║');
    console.log(`  ║    • Paid:        ${byStage.paid.length} deals`.padEnd(55) + '║');
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log('  ║  🎯 KEY ACTIONS TAKEN                                ║');
    console.log('  ╟──────────────────────────────────────────────────────╢');
    console.log(`  ║  ✅ Flooded ${customerFloodMessages.length} messages across Slack channels`.padEnd(55) + '║');
    console.log('  ║  ✅ Received trial request from Acme Corp'.padEnd(55) + '║');
    console.log('  ║  ✅ Created #trial-acme-corp channel'.padEnd(55) + '║');
    console.log('  ║  ✅ Moved Acme Corp to Free Trial stage'.padEnd(55) + '║');
    console.log('  ║  ✅ Spaghetti O ready to sign ($75K deal)'.padEnd(55) + '║');
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log('  ║  ⚡ DEALS READY TO CLOSE                             ║');
    console.log('  ╟──────────────────────────────────────────────────────╢');
    for (const deal of byStage.negotiation) {
      const line = `  ║  • ${deal.company}: $${deal.amount?.toLocaleString() || '0'}`;
      console.log(line.padEnd(55) + '║');
    }
    console.log('  ╠══════════════════════════════════════════════════════╣');
    console.log('  ║  📝 PENDING TRIAL REQUESTS                           ║');
    console.log('  ╟──────────────────────────────────────────────────────╢');
    console.log(`  ║  ${trialRequests.length} pending request(s)`.padEnd(55) + '║');
    console.log('  ╚══════════════════════════════════════════════════════╝');

    console.log('\n  💡 Check the Report tab in the app for a visual report.');
  } catch (error: any) {
    console.error(`  ❌ Failed to generate report: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DEMO FLOW
// ═══════════════════════════════════════════════════════════════════════════

async function runInteractiveDemo() {
  console.clear();
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║         🚀 SALES REP VISUALIZER - INTERACTIVE DEMO 🚀        ║');
  console.log('║                                                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║                                                              ║');
  console.log('║  This demo will walk you through a typical sales workflow:   ║');
  console.log('║                                                              ║');
  console.log('║  1. Flood Slack channels with customer messages              ║');
  console.log('║  2. Receive a trial request email from Acme Corp             ║');
  console.log('║  3. Create a dedicated Slack channel for Acme Corp           ║');
  console.log('║  4. Move Acme Corp from Lead → Free Trial in CRM             ║');
  console.log('║  5. Get an alert that Spaghetti O is ready to sign           ║');
  console.log('║  6. Generate a summary report                                ║');
  console.log('║                                                              ║');
  console.log('║  Press ENTER between each step to proceed.                   ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  await waitForEnter('Ready to start the demo?');

  // Reset all data before starting
  console.log('\n  🔄 Resetting demo data...');
  try {
    await apiCall('/crm/reset', 'POST');
    console.log('  ✅ Data reset complete. Starting with a clean slate.\n');
  } catch (e) {
    console.log('  ⚠️  Could not reset data (server may not be running)\n');
  }

  try {
    // Step 1: Flood channels
    await step1_floodChannels();

    // Step 2: Dannyshizzle email
    await step2_acmeCorpEmail();

    // Step 3: Move Daniel to trial in CRM
    await step4_moveAcmeToTrial();

    // Step 4: Spaghetti O ready to sign
    await step5_spaghettiOReadyToSign();

    // Step 5: Generate report
    await step6_generateReport();

    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  🎉 DEMO COMPLETE!');
    console.log('═'.repeat(60));
    console.log('\n  Thank you for watching the demo!');
    console.log('\n  Explore the app to see:');
    console.log('    • Inbox tab - Alerts and prioritized messages');
    console.log('    • Trial Pending tab - Review and process trial requests');
    console.log('    • CRM tab - Updated deal pipeline');
    console.log('    • Report tab - Generate detailed business reports');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Demo error:', error);
  } finally {
    rl.close();
  }
}

runInteractiveDemo();
