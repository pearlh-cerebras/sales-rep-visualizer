# Sales Prioritization Dashboard

An AI-assisted sales prioritization dashboard that automatically categorizes deals and provides actionable suggestions, saving sales reps time on prioritization and reporting.

## Features

- **AI-Powered Prioritization**: Automatically categorizes deals into 4 buckets:
  - Most Eager to Sign
  - Least Eager to Sign
  - Biggest Churn Risks
  - Upsell Opportunities

- **Two View Modes**:
  - Numbers View: Quick overview with counts and pipeline distribution
  - Priority List: Detailed deal cards with AI suggestions and one-click actions

- **Funnel Visualization**: Automatic pipeline health metrics including:
  - Inbound sources breakdown
  - Outbound response rates
  - Pipeline stage distribution
  - Expected close value, lost deals, and active trials

- **Transparent AI**: Every suggestion shows:
  - Confidence score
  - Clear reasons (bullet points)
  - One-click accept/reject actions
  - Reversible suggestions

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Redux Toolkit
- **Charts**: Recharts
- **No Backend**: Uses mock data for demo purposes

## Getting Started

### Prerequisites

- Node.js 18+ installed

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Demo Script (90 seconds)

**[0:00] Opening Screen**
"This is an AI-powered sales prioritization dashboard. Instead of manually reviewing 50+ deals, AI categorizes them for you based on signals from calls, emails, Slack, and product usage."

**[0:15] Numbers View**
"Here are my 4 buckets: 4 deals ready to close, 5 going cold, 3 churn risks, and 4 upsell opportunities. The AI analyzed 54 signals across 18 deals to generate these insights."

**[0:25] Switch to Priority List**
*Click "Priority List" button*
"Let's look at the eager-to-sign deals in detail. Each deal shows the company, amount, stage, and last activity."

**[0:35] Deal Card - Acme Corp**
"Take Acme Corp - the AI flagged this because their legal team requested security documentation yesterday. The confidence is 95% with clear reasons: legal review in progress, budget approved, and they're already in negotiation."

**[0:50] Accept Suggestion**
*Click "Accept" button*
"The AI suggests moving this to Negotiation stage. I can see exactly why, and accept or reject with one click. Accepted - the deal is now updated."

**[1:00] Churn Risk Example**
*Scroll to Churn Risks section*
"Here's a churn risk - CloudScale. The AI detected frustration with onboarding and issues being escalated. This helps me proactively reach out before they leave."

**[1:12] Funnel Screen**
*Click "Funnel" tab*
"For reporting, I get automatic funnel analysis. No more building spreadsheets. Expected to close $490k this month, $240k lost this week, and 4 currently on trial."

**[1:25] Pipeline Charts**
"I can see my inbound sources - 35% from email, 25% from LinkedIn. Outbound response rates show video performs best at 18%. And my pipeline distribution shows where deals are at each stage."

**[1:35] Closing**
"This dashboard saves hours every week on prioritization and reporting. All suggestions are reversible and transparent - I'm always in control."

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx       # Navigation and page wrapper
│   ├── DealCard.tsx     # Single deal with suggestion
│   ├── BucketCard.tsx   # Category bucket card
│   └── MetricCard.tsx   # KPI display card
├── data/                # Mock data
│   └── deals.ts         # 18 sample deals with signals
├── engine/              # AI Suggestion Engine
│   └── suggestionEngine.ts  # Heuristic-based classification
├── pages/               # Main screens
│   ├── Prioritization.tsx   # Primary screen (2 views)
│   └── Funnel.tsx           # Pipeline visualizer
├── store/               # Redux state management
│   ├── index.ts
│   ├── dealsSlice.ts
│   └── suggestionsSlice.ts
├── types/               # TypeScript definitions
│   └── index.ts
├── App.tsx              # Main app with routing
├── main.tsx             # Entry point
└── index.css            # Tailwind imports
```

## How the AI Works

The suggestion engine uses heuristic-based keyword matching on deal signals:

| Bucket | Trigger Keywords |
|--------|------------------|
| **Eager to Sign** | pricing, procurement, legal review, security, budget approved, ready to sign |
| **Least Eager** | ghosting, no response, pushed back, not a priority, revisit next quarter |
| **Churn Risk** | frustrated, issues, complaints, considering alternatives, low usage, escalation |
| **Upsell Opportunity** | usage spike, team expansion, feature request, add seats, expand |

Confidence scores are calculated based on:
- Number of matching keywords
- Recency of activity
- Current deal stage
- Signal strength

## Customization

To add your own deals or modify the suggestion logic:

1. Edit `src/data/deals.ts` to add/modify deals and signals
2. Edit `src/engine/suggestionEngine.ts` to adjust classification rules
3. The dashboard will automatically update with new suggestions

## License

ISC