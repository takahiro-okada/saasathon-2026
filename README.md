# ShopMate

Cook any cuisine with confidence in New Zealand. Search recipes from around the world, find ingredients at local supermarkets, compare prices across stores, and get smart substitutions for hard-to-find items.

**Live**: https://saasathon-2026.vercel.app

## Features

- **AI Recipe Generation** -- Type any dish name (English, Japanese, or Chinese) and get a full recipe with NZ supermarket ingredients
- **Real-time Price Lookup** -- Live pricing from Woolworths, Pak'nSave, and New World
- **Cross-store Price Comparison** -- See which supermarket is cheapest for your recipe
- **Smart Substitutions** -- AI suggests alternatives when ingredients aren't available
- **Recipe Caching** -- First search generates via AI; subsequent searches are instant from DB
- **Multilingual** -- Full support for English, Japanese, and Chinese

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| AI (Recipe) | Claude Sonnet |
| AI (Chat/Substitution) | Claude Haiku |
| Deployment | Vercel |

## Project Structure

```
.
├── app/                        # Next.js App Router
│   ├── api/                    # API Routes
│   │   ├── recipes/
│   │   │   ├── search/         # Recipe search + AI generation + DB cache
│   │   │   ├── compare/        # Cross-store price comparison
│   │   │   └── suggestions/    # Popular recipe suggestions
│   │   ├── chat/               # AI chat assistant
│   │   ├── substitution/       # AI ingredient substitution
│   │   ├── recommendations/    # AI recipe recommendations
│   │   ├── activity/           # User activity logging
│   │   ├── ingredients/        # Cross-store ingredient lookup
│   │   ├── products/           # Product search
│   │   └── stores/             # Nearby store search
│   ├── lib/                    # Server-side utilities
│   │   ├── supabase.ts         # Supabase client
│   │   ├── scraper.ts          # Supermarket API scrapers
│   │   ├── recipes.ts          # Recipe types + preset data
│   │   └── i18n.ts             # Internationalization
│   ├── layout.tsx
│   └── page.tsx                # Home page (imports from components/)
│
├── components/                 # UI Components
│   ├── recipe-result.tsx       # Recipe card with ingredients + steps
│   ├── ingredient-card.tsx     # Single ingredient with price/stock/alternatives
│   ├── price-compare-panel.tsx # Cross-store price comparison table
│   ├── store-tabs.tsx          # Woolworths / Pak'nSave / New World selector
│   ├── badges.tsx              # PriceBadge, StockBadge, StoreBadge
│   ├── ai-chat-panel.tsx       # Floating AI chat assistant
│   ├── welcome-page.tsx        # First-time user welcome screen
│   ├── onboarding-overlay.tsx  # Step-by-step onboarding tour
│   ├── bottom-nav.tsx          # Bottom navigation bar
│   ├── language-toggle.tsx     # EN / JA / ZH language switcher
│   ├── icons.tsx               # SVG icons and decorative elements
│   ├── nearby-stores-panel.tsx # Nearby supermarket finder
│   └── ai-insights-panel.tsx   # AI shopping insights
│
├── types/                      # TypeScript type definitions
│   └── index.ts                # Shared interfaces (Recipe, Ingredient, Store, etc.)
│
├── constants/                  # App constants
│   ├── stores.ts               # Store labels, colors, logos
│   └── onboarding.ts           # Onboarding step definitions
│
├── lib/                        # Client-side utilities
│   └── activity.ts             # User ID + activity logging
│
└── public/
    └── logos/                  # Store logo SVGs
```

## Architecture

```
User Input (any dish name, any language)
  |
  v
DB Cache Check (recipes + recipe_ingredients + ingredients)
  |-- HIT --> Return instantly
  |-- MISS --v
             Claude Sonnet generates recipe JSON
               |
               v
             Save to DB (async, non-blocking)
               |
               v
             Match ingredients against DB
               |
               v
             Supermarket API for live prices
               |-- Not found --> Claude Haiku suggests alternatives
               |                   |
               |                   v
               |                 Search alternatives in supermarket
               |
               v
             Cache in store_products (24h TTL)
               |
               v
             Return to frontend (prices, stock, alternatives)
```

## Getting Started

```bash
pnpm install
cp .env.local.example .env.local  # Add your API keys
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |

## AI Models

| Route | Model | Purpose |
|-------|-------|---------|
| `/api/recipes/search` (generation) | Claude Sonnet | Recipe JSON generation |
| `/api/recipes/search` (alternatives) | Claude Haiku | Substitute ingredient suggestions |
| `/api/chat` | Claude Haiku | Chat assistant |
| `/api/substitution` | Claude Haiku | Ingredient substitution |
| `/api/recommendations` | Claude Haiku | Recipe recommendations |

## Known Limitations

- **Woolworths API from overseas IPs**: Some queries fail when deployed to Vercel (overseas IP). Works fine locally from NZ
- **Pak'nSave / New World scrapers**: May return incomplete data for some products
