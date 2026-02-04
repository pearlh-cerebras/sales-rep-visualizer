import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:3001/api';

async function spoofEmail() {
  console.log('📧 Spoofing a trial request email...\n');

  const response = await fetch(`${API_BASE}/crm/trial-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Dannyshizzle',
      email: 'daniel.kim@cerebras.net',
      company: 'Daniel',
      message: `Hi. I'm extremely important CEO of my company.
I would like trial access to Cerebras, as it is super needed.

Please respond quickly, as I am very important.
Thank you,
Daniel "Dannyshizzle" Kim`
    }),
  });

  const trialRequest = await response.json();

  console.log('✅ Trial request created!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 Trial Request Details:\n');
  console.log(`   From: ${trialRequest.from}`);
  console.log(`   Email: ${trialRequest.email}`);
  console.log(`   Company: ${trialRequest.company}`);
  console.log(`   Message: ${trialRequest.message}`);
  console.log(`   Time: ${trialRequest.timestamp}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Check the Inbox tab in your app to see this trial request!');
}

spoofEmail().catch(console.error);