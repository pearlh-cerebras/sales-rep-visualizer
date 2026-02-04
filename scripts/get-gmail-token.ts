import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function getRefreshToken() {
  console.log('🔑 Gmail OAuth Token Generator (Manual Code Entry)\n');

  const clientId = await question('Enter your Gmail Client ID: ');
  const clientSecret = await question('Enter your Gmail Client Secret: ');

  if (!clientId || !clientSecret) {
    console.log('❌ Client ID and Secret are required');
    rl.close();
    return;
  }

  const redirectUri = 'urn:ietf:wg:oauth:2.0:oob';

  const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent',
  });

  console.log('\n📋 Step 1: Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n⚠️  Make sure this redirect URI is added to your Google Cloud Console OAuth client:');
  console.log(`   ${redirectUri}`);
  console.log('\n📋 Step 2: After authorizing, you will see an authorization code.');
  console.log('   Copy that code and paste it below.\n');

  const code = await question('Paste the authorization code here: ');

  if (!code) {
    console.log('\n❌ No code provided');
    rl.close();
    return;
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.log('\n⚠️  No refresh token received. This usually happens when:');
      console.log('   1. You already authorized this app before (revoke access and try again)');
      console.log('   2. The prompt parameter was not set to "consent"');
      console.log('\n💡 To fix this, go to Google Account > Security > Third-party apps and revoke access, then try again.');
      rl.close();
      return;
    }

    console.log('\n✅ Authorization successful!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 Add these to your .env file:\n');
    console.log(`GMAIL_CLIENT_ID=${clientId}`);
    console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.log('\n❌ Error getting tokens:', error.message);
    if (error.response?.data?.error) {
      console.log(`   Details: ${error.response.data.error}`);
    }
  }

  rl.close();
}

getRefreshToken().catch(console.error);