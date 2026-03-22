# ForgeBot

**Upload a photo of any object. Get a startup concept, landing page, and marketing campaign in seconds.**

ForgeBot is an AI-powered platform that transforms a photograph of any physical object into a complete startup — including a brand concept, a production-ready landing page, and a full marketing campaign. It uses a multi-agent pipeline built on Claude to go from image to launch-ready assets in one flow.

## How It Works

```
Photo Upload → Vision Agent → Ideation Agent → Landing Page Agent → Marketing Agent
```

1. **Vision Agent** — Analyzes the uploaded image to identify the object, its properties, materials, use cases, and target demographics.
2. **Ideation Agent** — Generates a startup concept: name, tagline, elevator pitch, value proposition, pricing model, and brand personality.
3. **Landing Page Agent** — Streams a production-ready HTML landing page in real time with responsive design, animations, and copy.
4. **Marketing Agent** — Creates a full campaign: 3-email welcome sequence, social media posts (Twitter/LinkedIn/Instagram), Google Ads copy, and a press release.

## Demo

Upload any photo — a coffee mug, a pair of headphones, a houseplant — and ForgeBot will generate an entire startup around it.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS, Radix UI |
| AI | Claude 3.5 Sonnet via Anthropic SDK |
| Auth & Database | Supabase (Auth + PostgreSQL + Storage) |
| Payments | Stripe (subscriptions + webhooks) |
| Analytics | PostHog |
| Hosting | Vercel |

## Architecture

```
src/
├── app/
│   ├── (app)/              # Authenticated routes (forge, dashboard, pricing, settings)
│   ├── (auth)/             # Login/signup flow
│   ├── api/forge/          # AI agent API endpoints (analyze, ideate, landing-page, marketing)
│   └── api/webhook/        # Stripe webhooks
├── lib/
│   ├── agents/             # AI agent definitions (vision, ideation, landing-page, marketing)
│   ├── supabase/           # Database client setup
│   ├── demo/               # Pre-generated demo templates
│   ├── anthropic.ts        # Anthropic SDK config
│   ├── stripe.ts           # Stripe config
│   └── schemas.ts          # Zod validation schemas for agent outputs
├── components/             # Shared React components
└── hooks/
    └── use-forge.ts        # Core workflow state machine
```

### Key Design Decisions

- **Streaming HTML generation** — The landing page streams directly to the browser via `TransformStream`, giving real-time visual feedback as the page is built.
- **HEIC conversion fallback chain** — Supports iOS photos with a 3-tier fallback: browser-native decoding → WASM (heic2any) → server-side Sharp.
- **Zod-validated agent outputs** — Every AI agent response is validated against a strict schema to ensure data integrity.
- **Quota tracking** — Generations are only decremented after the final marketing step completes, preventing charges for partial runs.

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- An Anthropic API key
- A Stripe account (for billing features)

### Setup

1. Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/forgebot.git
cd forgebot
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

Required environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_PRICE_ID=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

3. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=true` to use pre-generated content without making API calls — useful for demos and development.

## Features

- **Object-to-startup generation** from any photo
- **Real-time streaming** landing page generation
- **Full marketing campaign** output (email, social, ads, PR)
- **iOS HEIC/HEIF support** with automatic conversion
- **User auth** and project history dashboard
- **Free tier** (3 generations) and **Pro tier** (unlimited) via Stripe
- **Dark mode** support

## Built With

Built for a hackathon using Claude 3.5 Sonnet, Next.js, Supabase, and Stripe.
