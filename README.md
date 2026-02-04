# Sales Rep Visualizer

A full-stack sales prioritization dashboard with real-time Slack integration, simulated email trial requests, Stripe payment tracking, and an in-memory HubSpot-style CRM.

## Features

- **📧 Email Integration**: Simulated trial request detection (spoof mode)
- **💬 Slack Integration**: Real-time message prioritization based on revenue potential
- **💳 Stripe Integration**: Track payments and MRR from your sandbox
- **📊 HubSpot Clone**: In-memory CRM with drag-and-drop pipeline management
- **📈 Business Reports**: Auto-generated reports with PDF export
- **🤖 Customer Bot**: Simulate customer messages for testing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

You'll need:
- **Slack**: Bot token (see setup below)
- **Stripe**: Secret key (see setup below)
- **Gmail**: Optional - leave empty to use spoof mode (recommended for testing)

### 3. Start the Backend Server

```bash
npm run server
```

The server will run on `http://localhost:3001`

### 4. Start the Frontend

In a new terminal:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Setup Instructions

### Slack Setup

1. Go to [Slack API](https://api.slack.com/apps) and click "Create New App"
2. Choose "From scratch"
3. Enter an app name (e.g., "Sales Rep Visualizer") and select your workspace
4. Navigate to **OAuth & Permissions** in the left sidebar
5. Under **Bot Token Scopes**, add these scopes:
   - `channels:history` - Read channel history
   - `channels:join` - Join channels
   - `chat:write` - Post messages
   - `groups:history` - Read private channel history
   - `im:history` - Read DM history
   - `mpim:history` - Read group DM history
6. Scroll to **OAuth Tokens for Your Workspace** and click "Install to Workspace"
7. Copy the **Bot User OAuth Token** (starts with `xoxb-`) to `SLACK_BOT_TOKEN` in your `.env` file

### Stripe Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Make sure you're in **Test mode** (toggle in top-left)
3. Navigate to **Developers** > **API keys**
4. Copy the **Secret key** (starts with `sk_test_`) to `STRIPE_SECRET_KEY` in your `.env` file

That's it! No webhooks needed - just run the fetch script to sync data.

## Usage

### Quick Demo (Recommended)

Run the demo script to simulate both trial requests and customer messages:

```bash
npm run demo
```

This will:
1. Create a fake trial request
2. Send simulated customer messages to your Slack workspace
3. Show you where to find everything in the app

### Interactive Demo (For Presentations)

For a step-by-step interactive demo with pauses between each step:

```bash
npm run interactive-demo
```

This demo walks you through:
1. **Flooding Slack channels** with customer messages (some @mentioning you)
2. **Receiving a trial request** from Acme Corp
3. **Creating a Slack channel** for Acme Corp
4. **Moving Acme Corp to Free Trial** in the CRM
5. **Getting an alert** that Spaghetti O is ready to sign
6. **Generating a summary report**

**Setup for Interactive Demo:**

Add these to your `.env` file:
```bash
# Your Slack user ID for @mentions (find in your Slack profile settings)
DEMO_SLACK_USER_ID=U0123456789

# Optional: Customer bot user ID (for inviting to channels)
CUSTOMER_BOT_USER_ID=U9876543210
```

**Additional Slack Scopes Required:**
- `channels:manage` - Create channels
- `groups:write` - Create private channels
- `users:read` - Look up users

### Individual Scripts

**Simulate Trial Requests:**
```bash
npm run spoof-email
```

**Simulate Customer Messages:**
```bash
npm run simulate-customers
```

**Fetch Stripe Data:**
```bash
npm run fetch-stripe
```

This will:
- Fetch all customers from your Stripe sandbox
- Match them to deals by email
- Update matching deals to "Paid" stage
- Create payment records for successful charges

**Tip**: Create test customers in Stripe with emails that match your CRM deals (e.g., `sarah@acme.com`, `john@techcorp.com`) to see them sync automatically.

### Simulating Customer Messages

Run the customer bot to send fake messages to your Slack workspace:

```bash
npm run simulate-customers
```

This will send messages from various "customers" to your Slack channels.

### Using the Dashboard

1. **Inbox Tab**: View Slack messages and trial requests. Click "Create Channel" to approve a trial request and create a Slack channel.
2. **CRM Tab**: Drag and drop deals between pipeline stages.
3. **Stripe Tab**: View payments and MRR from your Stripe sandbox.
4. **Report Tab**: Generate a business report with aggregated data and export to PDF.

**Recommended Workflow:**
1. Start the backend: `npm run server`
2. Start the frontend: `npm run dev`
3. Run the demo: `npm run demo`
4. Check the Inbox tab to see trial requests and messages
5. Approve trial requests by clicking "Create Channel"
6. Check the CRM tab to see deals in the pipeline
7. Run `npm run fetch-stripe` to sync Stripe payments
8. Generate a report in the Report tab

## API Endpoints

### CRM
- `GET /api/crm/deals` - Get all deals
- `GET /api/crm/deals/:id` - Get a specific deal
- `POST /api/crm/deals` - Create a new deal
- `PATCH /api/crm/deals/:id/stage` - Update deal stage
- `GET /api/crm/trial-requests` - Get pending trial requests
- `POST /api/crm/trial-requests/:id/dismiss` - Dismiss a trial request

### Slack
- `GET /api/slack/messages?channels=channel1,channel2` - Get messages from channels
- `POST /api/slack/create-channel` - Create a new Slack channel
- `POST /api/slack/post-message` - Post a message to a channel

### Gmail (Spoof Mode)
- `POST /api/gmail/check` - Check Gmail for trial requests (currently in spoof mode)

### Stripe
- `GET /api/stripe/payments` - Get recent payments
- `GET /api/stripe/mrr` - Get monthly recurring revenue

## Project Structure

```
sales-rep-visualizer/
├── server/                 # Backend server
│   ├── index.ts           # Express server entry
│   ├── routes/            # API routes
│   ├── services/          # Service layer (Slack, Gmail, Stripe)
│   ├── store/             # In-memory data store
│   └── types.ts           # Backend types
├── src/                   # Frontend
│   ├── components/        # React components
│   ├── pages/             # Page components
│   ├── data/              # Mock data
│   ├── engine/            # AI/analysis engines
│   ├── store/             # Redux store
│   └── types/             # TypeScript types
├── scripts/               # Utility scripts
│   ├── check-email.ts     # Gmail checker
│   ├── simulate-customers.ts  # Customer bot
│   ├── get-gmail-token.ts # OAuth token generator
│   └── spoof-email.ts     # Spoof trial request
└── package.json
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Redux Toolkit, Recharts
- **Backend**: Node.js, Express, TypeScript
- **Integrations**: Slack Web API, Gmail API (spoof mode), Stripe API

## Development

### Building for Production

```bash
npm run build
```

### Type Checking

```bash
npx tsc --noEmit
```

## Troubleshooting

### Slack API errors
Make sure your bot token has the required scopes:
- `channels:history`
- `channels:join`
- `chat:write`
- `groups:history`
- `im:history`
- `mpim:history`

### No trial requests appearing
Run `npm run spoof-email` to create a fake trial request for testing.

### Stripe data not syncing
Make sure your Stripe customers have emails that match your CRM deals. Run `npm run fetch-stripe` to sync data.

## License

ISC