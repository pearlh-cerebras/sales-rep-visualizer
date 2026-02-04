import dotenv from 'dotenv';
import { WebClient } from '@slack/web-api';

dotenv.config();

const botClient = new WebClient(process.env.SLACK_BOT_TOKEN);

interface CustomerMessage {
  channel: string;
  text: string;
  customer: string;
}

const customerMessages: CustomerMessage[] = [
  {
    channel: '#sales-inquiries',
    text: 'Hi! We\'re interested in starting a trial for our team of 20 people. When can we get started?',
    customer: 'Sarah from Acme Corp',
  },
  {
    channel: '#sales-inquiries',
    text: 'We\'ve been using the product for a week now and love it! Ready to discuss enterprise pricing.',
    customer: 'John from TechCorp',
  },
  {
    channel: '#customer-support',
    text: 'Our team is ready to upgrade to the paid plan. How do we proceed?',
    customer: 'Lisa from GrowthCo',
  },
  {
    channel: '#customer-support',
    text: 'We\'ve been waiting 5 days for a response on our contract. Is everything okay?',
    customer: 'Alex from DataFlow',
  },
  {
    channel: '#customer-support',
    text: 'Can you help with some onboarding issues? Our team is having trouble getting started.',
    customer: 'Robert from FinanceHub',
  },
  {
    channel: '#sales-inquiries',
    text: 'We need to discuss pricing for our annual contract. Budget is approved.',
    customer: 'Nicole from SecureNet',
  },
  {
    channel: '#customer-support',
    text: 'We\'re considering alternatives due to some performance issues we\'ve been experiencing.',
    customer: 'James from CloudScale',
  },
  {
    channel: '#sales-inquiries',
    text: 'Legal has approved the contract! Can we get it signed today?',
    customer: 'Jennifer from HealthTech',
  },
  {
    channel: '#customer-support',
    text: 'We want to expand to 3 more departments next month. What\'s the process?',
    customer: 'Kevin from GreenEnergy',
  },
  {
    channel: '#sales-inquiries',
    text: 'Our board meeting is tomorrow and we need the contract before EOD. Can you help?',
    customer: 'Amanda from AutoParts',
  },
  {
    channel: '#customer-support',
    text: 'The trial is going great! We\'re ready to move forward with the paid plan.',
    customer: 'Mike from StartupXYZ',
  },
  {
    channel: '#sales-inquiries',
    text: 'We have some questions about the enterprise features before we commit.',
    customer: 'Emma from EnterpriseCo',
  },
];

async function simulateCustomers() {
  console.log('🤖 Starting customer bot simulation...\n');

  for (const msg of customerMessages) {
    try {
      await botClient.chat.postMessage({
        channel: msg.channel,
        text: msg.text,
        username: msg.customer,
        icon_emoji: ':bust_in_silhouette:',
      });

      console.log(`✅ Sent message from ${msg.customer} to ${msg.channel}`);
      console.log(`   "${msg.text}"\n`);

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    } catch (error) {
      console.error(`❌ Error sending message from ${msg.customer}:`, error);
    }
  }

  console.log('\n🎉 Simulation complete! Check your Slack channels for the messages.');
}

simulateCustomers().catch(console.error);