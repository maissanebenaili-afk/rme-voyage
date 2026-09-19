# SAFAR Platform Development Guide

This document provides guidance for developers working on the **SAFAR (Smart Assistant for African & Mediterranean Routes)** platform - a panafricana AI travel assistant serving diaspora communities across Africa, Europe, and beyond.

## Platform Vision

SAFAR enables diaspora communities to travel confidently between Africa and Europe by providing:
- **15 languages** covering major African diaspora communities
- **Services across 13 African countries** (West, East, Central, and North Africa)
- **Intelligent multi-agent architecture** for specialized travel advice
- **Regional knowledge integration** for accurate, localized information
- **Freemium model** supporting free tier and premium subscribers

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Sub-Agents](#sub-agents)
6. [API Endpoints](#api-endpoints)
7. [Database](#database)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Contributing](#contributing)

---

## Architecture Overview

SAFAR uses a **multi-agent conversational AI architecture** designed for diaspora travel planning.

### Core Components

```
┌─────────────────────────────────────────┐
│  Client (Web / Mobile)                  │
├─────────────────────────────────────────┤
│  HadakAI Component (React)              │
│  - Chat UI                              │
│  - Voice Input (Web Speech API)         │
│  - Voice Output (TTS)                   │
├─────────────────────────────────────────┤
│  API Layer (Vercel Edge Functions)      │
│  - /api/chat                            │
│  - /api/trips                           │
│  - /api/tips                            │
├─────────────────────────────────────────┤
│  SafarAgent (Orchestrator)              │
│  - Intent Extraction                    │
│  - Entity Recognition                   │
│  - Sub-Agent Routing                    │
├─────────────────────────────────────────┤
│  Sub-Agents                             │
│  - Navigator (routes, transport)        │
│  - Localizer (weather, prayer times)    │
│  - Community (tips, recommendations)    │
│  - Budget (costs, exchange rates)       │
│  - Emergency (help, contacts)           │
├─────────────────────────────────────────┤
│  Data Layer (Supabase PostgreSQL)       │
│  - Users                                │
│  - Trips                                │
│  - Community Tips                       │
│  - Conversation Logs                    │
├─────────────────────────────────────────┤
│  External APIs (with fallbacks)         │
│  - OpenAI (LLM)                         │
│  - Aladhan (Prayer Times)               │
│  - OpenWeatherMap (Weather)             │
│  - OSRM (Routing)                       │
└─────────────────────────────────────────┘
```

### Key Design Decisions

1. **Multi-Language First:** Darija, French, English, Arabic, Spanish
2. **Offline-Capable:** Local knowledge base fallback when APIs fail
3. **Privacy-Focused:** User data stored in Supabase with RLS policies
4. **Energy-Efficient:** Minimal API calls, smart caching
5. **Freemium Model:** Free tier (10 msg/day), Premium ($4.99/mo)

---

## Project Structure

```
rme-voyage/
├── app/
│   ├── api/
│   │   ├── chat/          # Main conversational endpoint
│   │   ├── hadak/         # Legacy endpoint
│   │   ├── tips/          # Community tips
│   │   └── trips/         # Trip management
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── HadakAI.tsx        # Main React component
├── packages/
│   ├── agents/
│   │   ├── safar.ts       # Main orchestrator
│   │   ├── navigator.ts   # Routes & transport
│   │   ├── localizer.ts   # Local info
│   │   ├── community.ts   # Community tips
│   │   ├── budget.ts      # Costs & budgets
│   │   └── emergency.ts   # Emergency services
│   ├── db/
│   │   └── schema.sql     # Database schema
│   ├── types/
│   │   └── agent.ts       # TypeScript interfaces
│   └── utils/
│       ├── realtime.ts    # External API integrations
│       ├── freemium.ts    # Subscription management
│       └── tts.ts         # Text-to-speech
├── ARCHITECTURE.md        # High-level architecture
├── API.md                 # API documentation
├── DEVELOPMENT.md         # This file
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Supabase account (optional, for local dev)

### Installation

```bash
# Clone repository
git clone https://github.com/maissanebenaili-afk/rme-voyage.git
cd rme-voyage

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Required:
# - OPENAI_API_KEY (or CLÉ_API_OPENAI)
# - NEXT_PUBLIC_SUPABASE_URL (optional)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (optional)
```

### Environment Variables

```bash
# OpenAI
OPENAI_API_KEY=sk-...
# OR French name (Vercel limitation):
CLÉ_API_OPENAI=sk-...

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

# External APIs (optional)
ALADHAN_API_KEY=xxx
OPENWEATHERMAP_API_KEY=xxx
OANDA_API_KEY=xxx
```

### Development

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000

# Build for production
npm run build

# Run tests
npm run test

# Type check
npm run type-check

# Linting
npm run lint
```

---

## Development Workflow

### 1. Branch Naming

```bash
git checkout -b feature/add-voice-output
git checkout -b fix/prayer-time-parsing
git checkout -b refactor/agent-routing
```

### 2. Commit Messages

Follow conventional commits:

```
feat: Add WebSocket support for real-time updates
fix: Resolve edge case in currency conversion
docs: Update API documentation
refactor: Simplify intent extraction
test: Add unit tests for navigator agent
```

### 3. Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- packages/agents/safar.test.ts

# Watch mode
npm test -- --watch
```

### 4. Pull Requests

1. Create feature branch
2. Make changes and commit
3. Push to remote: `git push origin feature/xxx`
4. Open PR with description
5. Wait for CI checks to pass
6. Request review

---

## Supported Regions & Languages

### Languages (15 total)
- **European**: French, English, Spanish
- **North Africa**: Darija (Moroccan), Modern Standard Arabic
- **West Africa**: Wolof (Senegal), Pulaar/Fula (Guinea/Mali), Bambara (Mali), Yoruba (Nigeria), Igbo (Nigeria), Hausa (Nigeria)
- **East Africa**: Swahili (Kenya/Tanzania)
- **Central Africa**: Lingala (DRC), Kinyarwanda (Rwanda), Malagasy (Madagascar)

### Supported Countries (13 total)
- **West Africa**: Senegal, Guinea, Mali, Nigeria
- **East Africa**: Kenya, Tanzania
- **Central Africa**: Democratic Republic of Congo (DRC)
- **North Africa**: Morocco
- **Diaspora Hubs**: France, United Kingdom, Spain, Belgium, United States

## Sub-Agents

Each sub-agent handles specific travel planning aspects with panafricana coverage:

### NavigatorAgent

**Location:** `packages/agents/navigator.ts`

**Triggers:** route, direction, ferry, transport, distance, comment aller

**Capabilities:**
- **Pan-African routing**: 25+ documented routes across Africa-Europe network
- **Multi-modal transport**: flights, ferries, buses, trains, road travel
- **Regional operators**: Knows major airlines, ferry companies, bus services by region
- **Intra-African diaspora routes**: Direct connections between African diaspora hubs
- **Transport cost estimates**: Region-specific pricing for each transport mode

**Supported Routes:**
- Europe-Africa: Paris/London/Brussels to major African cities
- West African: Dakar-Conakry-Bamako-Lagos network
- East African: Nairobi-Dar es Salaam-Mombasa routes
- Central African: Kinshasa and DRC internal routes
- Intra-Diaspora: Direct connections between diaspora communities

**Example:**

```typescript
const navigator = new NavigatorAgent(config);
const response = await navigator.processQuery('Routes from Dakar to Lagos?');
// Returns: flight, bus, and ferry options with operators and costs
```

### LocalizerAgent

**Location:** `packages/agents/localizer.ts`

**Triggers:** prayer, weather, halal, mosque, pharmacy, SIM, restaurant

**Capabilities:**
- **Country-specific services**: Pharmacy chains, SIM providers by region
- **Halal services**: Verified halal restaurants in each country
- **Prayer times**: Integration ready for Aladhan API
- **Weather forecasting**: Regional weather patterns
- **Mobile networks**: Local telecom operators with coverage info
- **Health services**: Pharmacy chains and hospital information

**Regional Services:**
- Each country has verified local SIM providers (Maroc Telecom, Vodacom, Airtel, etc.)
- Pharmacy chains specific to each region
- Halal restaurant networks in major cities
- Mosque locations in diaspora communities

**Example:**

```typescript
const localizer = new LocalizerAgent(config);
const response = await localizer.processQuery('SIM cards in Dakar?');
// Returns: Sonatel, Maroc Telecom, Expresso with coverage details
```

### CommunityAgent

**Location:** `packages/agents/community.ts`

**Triggers:** recommend, tips, advice, travelers, experiences, avis

**Capabilities:**
- Community tip aggregation
- Rating and review system
- User recommendations
- Travel experience sharing

**Example:**

```typescript
const community = new CommunityAgent(config);
const response = await community.processQuery('Tips for Casablanca?');
// Returns: Top-rated tips from community
```

### BudgetAgent

**Location:** `packages/agents/budget.ts`

**Triggers:** cost, budget, price, how much, combien, exchange

**Capabilities:**
- **Regional cost estimates**: Accurate daily budgets for 8+ African countries
- **African currencies**: Support for XOF, GNF, KES, TZS, CDF, NGN, MAD and more
- **Dynamic budgeting**: Costs adjust based on destination country
- **Multi-directional exchange**: Convert between any supported currency pair
- **Category breakdowns**: Accommodation, food, transport, activities, contingency

**Supported Currencies:**
- West Africa: CFA Franc (XOF), Guinean Franc (GNF), Nigerian Naira (NGN)
- East Africa: Kenyan Shilling (KES), Tanzanian Shilling (TZS)
- Central Africa: Congolese Franc (CDF)
- North Africa: Moroccan Dirham (MAD)
- Europe: EUR, GBP, USD

**Example:**

```typescript
const budget = new BudgetAgent(config);
const response = await budget.processQuery('7-day trip budget for Lagos?');
// Returns: Country-specific budget with Nigerian pricing in NGN/USD
```

### EmergencyAgent

**Location:** `packages/agents/emergency.ts`

**Triggers:** emergency, help, police, hospital, accident, urgence

**Capabilities:**
- **Country-specific emergency numbers**: Police, ambulance, fire by region
- **Embassy routing**: Direct contacts for diaspora embassies
- **Crisis levels**: Critical (accident), High (theft/injury), Medium (medical)
- **Multilingual alerts**: Critical information in all 15 supported languages
- **Travel documentation**: Lost passport recovery procedures

**Emergency Numbers by Country:**
- Each country has verified police, ambulance, and fire services
- Regional embassy contacts for diaspora nationalities
- Medical facility information for each region

**Example:**

```typescript
const emergency = new EmergencyAgent(config);
const response = await emergency.processQuery('Emergency in Lagos!');
// Returns: Nigeria police (112), ambulance (112), embassy contacts, incident log
```

---

## API Endpoints

See [API.md](./API.md) for complete endpoint documentation.

### Core Endpoints

- `POST /api/chat` - Main conversational interface
- `GET /api/tips` - Fetch community tips
- `POST /api/tips` - Submit community tip
- `GET /api/trips` - Get user's trips
- `POST /api/trips` - Create new trip
- `PUT /api/trips` - Update trip
- `DELETE /api/trips` - Delete trip

### Adding New Endpoints

1. Create file: `app/api/[name]/route.ts`
2. Export HTTP handlers: `GET`, `POST`, `PUT`, `DELETE`
3. Use TypeScript for type safety
4. Add error handling and validation
5. Document in [API.md](./API.md)

```typescript
// Example: app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Use Edge Runtime

export async function GET(req: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ success: true, data: [] });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

---

## Database

### Schema

See `packages/db/schema.sql` for the complete schema with RLS policies.

### Tables

- **users:** User accounts and subscriptions
- **trips:** Travel itineraries
- **community_tips:** User recommendations
- **conversation_logs:** Chat history
- **agent_interactions:** Agent call logging

### Row-Level Security (RLS)

All tables have RLS policies enabled:

```sql
-- Users can only read/write their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Community tips are public read, private write
CREATE POLICY "Anyone can read tips" ON community_tips
  FOR SELECT USING (true);

CREATE POLICY "Users can create tips" ON community_tips
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Integration

```typescript
// Using Supabase client (future)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase
  .from('community_tips')
  .select('*')
  .eq('location', 'Marrakech')
  .order('rating', { ascending: false });
```

---

## Testing

### Unit Tests

```typescript
// packages/agents/navigator.test.ts
import { NavigatorAgent } from '../navigator';

describe('NavigatorAgent', () => {
  it('should calculate route', async () => {
    const agent = new NavigatorAgent(mockConfig);
    const response = await agent.processQuery('Paris to Marrakech?');
    expect(response.text).toContain('Paris');
    expect(response.confidence).toBeGreaterThan(0.7);
  });
});
```

### Integration Tests

```typescript
// app/api/chat.test.ts
import { POST } from './route';

describe('Chat API', () => {
  it('should process message and route to agent', async () => {
    const request = new Request('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What is the weather in Marrakech?',
        userId: 'test-user',
        language: 'en',
      }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.response.agent).toMatch(/LOCALIZER|SAFAR/);
  });
});
```

### Running Tests

```bash
npm run test
npm run test -- --watch
npm run test:coverage
```

---

## Deployment

### Vercel Deployment

The platform is deployed on Vercel with automatic deployments on push to main.

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod
```

### Environment Variables on Vercel

```bash
vercel env add OPENAI_API_KEY
vercel env add CLÉ_API_OPENAI
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Database Migrations

```bash
# Create migration
supabase migration new add_voice_table

# Apply migrations locally
supabase migration up

# Deploy to production
supabase migration deploy
```

---

## Contributing

### Code Style

- Use TypeScript (no `any` unless necessary)
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful comments

### Performance

- Minimize OpenAI API calls
- Use conversation history context
- Cache external API responses
- Optimize bundle size

### Accessibility

- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Test with screen readers

### Security

- Validate all inputs
- Use parameterized queries
- Never log sensitive data
- Implement rate limiting

---

## Roadmap

### Phase 1 (MVP) - Week 1-3
- ✅ Core chat functionality
- ✅ Voice input (Web Speech API)
- ✅ Community tips system
- ✅ Trip planner basics

### Phase 2 - Week 4-9
- Voice output (TTS)
- Real-time ferry alerts (WebSocket)
- PDF trip export
- Advanced analytics

### Phase 3 - Month 3-4
- Mobile app (React Native)
- Offline mode
- Advanced AI personalization
- Multi-user collaboration

---

## Troubleshooting

### "Cannot find module" errors

```bash
npm install
npm run build
```

### TypeScript errors

```bash
npm run type-check
npm run type-check -- --strict
```

### API errors

Check:
1. Environment variables set correctly
2. API key has proper permissions
3. Rate limits not exceeded
4. Network connectivity

### Voice input not working

```typescript
// Check browser support
const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
console.log('Speech Recognition supported:', supported);

// Check Permissions-Policy header
// Should allow microphone=(self)
```

---

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - High-level design
- [API.md](./API.md) - API documentation
- [Next.js Docs](https://nextjs.org)
- [OpenAI API](https://platform.openai.com)
- [Supabase Docs](https://supabase.com/docs)

---

## Support

- **Slack:** #safar-development
- **GitHub Issues:** https://github.com/maissanebenaili-afk/rme-voyage/issues
- **Email:** dev@safar-travel.app

---

Last Updated: 2026-09-19
