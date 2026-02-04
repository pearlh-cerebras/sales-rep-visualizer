import dotenv from 'dotenv';
import { gmailService } from '../server/services/gmailService.js';
import { crmStore } from '../server/store/crmStore.js';

dotenv.config();

async function checkEmail() {
  console.log('📧 Checking Gmail for trial requests...');

  const trialRequests = await gmailService.checkForTrialRequests();

  if (trialRequests.length === 0) {
    console.log('✅ No new trial requests found.');
    return;
  }

  console.log(`\n🎯 Found ${trialRequests.length} trial request(s):\n`);

  for (const request of trialRequests) {
    const existing = crmStore.getTrialRequests().find(
      r => r.email === request.email && !r.dismissed
    );

    if (existing) {
      console.log(`⏭️  Skipping (already exists): ${request.from} (${request.email})`);
    } else {
      crmStore.createTrialRequest(request);
      console.log(`✨ New trial request:`);
      console.log(`   From: ${request.from}`);
      console.log(`   Email: ${request.email}`);
      console.log(`   Company: ${request.company}`);
      console.log(`   Subject: ${request.message}`);
      console.log(`   Time: ${request.timestamp.toLocaleString()}\n`);
    }
  }

  console.log(`\n📊 Total pending trial requests: ${crmStore.getTrialRequests().length}`);
}

checkEmail().catch(console.error);