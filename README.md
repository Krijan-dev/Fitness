# MealPrep Pro

MealPrep Pro is a modern web application for calculating meal nutrition, planning weekly meals, tracking daily calories and macros, managing shopping lists, comparing supermarket prices, and monitoring body weight progress.

Built for fitness and nutrition enthusiasts who want a polished, local-first experience without accounts or databases in the initial version.

## Technology Stack

- **React** with **Next.js** App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **Zustand** for client state management
- **Recharts** for data visualisation
- **Lucide React** for icons
- **npm** as the package manager

## Installation

```bash
npm install
```

Copy the environment template and adjust if needed:

```bash
cp .env.example .env.local
```

## Development

Start the development server:

```bash
npm run dev
```

If the UI looks unstyled or you see **500 Internal Server Error**, the dev cache is corrupted. Run:

```bash
npm run dev:reset
```

This stops the dev server, clears `.next`, and starts fresh. You can also use `npm run dev:clean` if nothing is listening on port 3000.

**Why this happens:** Running `npm run build` while `npm run dev` is active overwrites `.next` and breaks CSS. Phase verification now uses `npm run verify`, which builds to a temporary folder so your dev server stays healthy.

Because this project lives in OneDrive, exclude the `.next` folder from sync if problems persist (OneDrive → Manage sync → choose folders).

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/dashboard`.

If the UI looks unstyled (plain blue links, white background), hard-refresh the browser (Ctrl+Shift+R).

## Production Build

```bash
npm run build
npm start
```

## Linting

```bash
npm run lint
```

## Testing

```bash
npm test
```

Runs Jest unit tests for nutrition calculations, shopping merge, basket totals, weight stats, recipe filters, and import validation.

Full CI-style check (lint + tests + production build without touching dev cache):

```bash
npm run verify
```

## Environment Variables

See `.env.example` for all supported variables:

| Variable | Description |
|----------|-------------|
| `RECIPE_API_PROVIDER` | Recipe data source (`mock` by default) |
| `RECIPE_API_KEY` | API key for external recipe providers (server-side only) |
| `RECIPE_API_BASE_URL` | Base URL for external recipe API |
| `PRICE_PROVIDER_MODE` | Price data mode (`mock` by default) |
| `COLES_API_KEY` | Coles API key (server-side only) |
| `WOOLWORTHS_API_KEY` | Woolworths API key (server-side only) |
| `THIRD_PARTY_GROCERY_API_KEY` | Third-party grocery API key |

Never commit real API keys. Use `.env.local` for secrets.

## Folder Structure

```text
src/
├── app/                    # Next.js App Router pages and API routes
├── components/
│   ├── common/             # Reusable UI components
│   ├── layout/             # App shell, sidebar, navigation
│   └── charts/             # Recharts visualisations
├── features/               # Feature-specific UI modules
├── services/
│   ├── storage/            # localStorage abstraction
│   ├── recipes/            # Recipe provider interfaces
│   ├── prices/             # Price provider interfaces
│   └── nutrition/          # Nutrition calculation utilities
├── stores/                 # Zustand stores with persistence
├── types/                  # TypeScript interfaces
├── data/                   # Mock and seed JSON data
├── hooks/                  # Custom React hooks
└── utils/                  # Shared utilities
```

## Current Features (Phase 1–9)

All planned application features are implemented:

- Responsive app shell with desktop sidebar and mobile navigation
- Dark theme with polished card-based UI (dark, light, and system modes)
- Dashboard with nutrition summary, weight chart, and quick actions
- Meal Calculator with ingredient rows, cooked weight, serving calculator, and save to recipes
- My Recipes library with search, filters, sort, favourites, edit, duplicate, delete
- Recipe detail pages with nutrition breakdown and quick actions
- **Discover Recipes** with mock provider search, filters, detail pages, save to library
- Add recipes to daily tracker, meal planner, and shopping list from library or discovery
- **Daily Tracker** with date picker, meal sections, progress bars, copy yesterday, clear day
- **Meal Planner** with 7-day grid, weekly totals, copy day, generate shopping list
- **Shopping List** with add/edit/delete, category grouping, purchased filters, compare prices link
- **Pantry** with low-stock and expiry alerts, Cook With What I Have recipe matching
- **Price Comparison** with mock providers, product matching, per-store totals, cheapest mixed basket
- **Weight Tracker** with logging, charts, BMI, progress toward target, CSV export
- **Settings** with profile, goals, location, theme, import/export JSON, per-feature clear, full reset
- Error boundaries, page-level error recovery, skip-to-content link, and accessible modals
- Jest unit tests for critical calculations and data validation
- TypeScript interfaces for all core data models
- localStorage service with hydration-safe Zustand stores
- Mock data for recipes, meals, pantry, shopping, weights, and prices
- Recipe and price provider architecture (mock implementations)
- API routes at `/api/recipes` and `/api/prices`
- Custom 404 page

## Planned Development Phases

| Phase | Feature |
|-------|---------|
| 2 | Meal Calculator ✓ |
| 3 | Personal Recipe Library ✓ |
| 4 | Recipe Discovery ✓ |
| 5 | Daily Tracker and Meal Planner ✓ |
| 6 | Shopping List and Pantry ✓ |
| 7 | Price Comparison ✓ |
| 8 | Weight Tracker and Settings ✓ |
| 9 | Testing, accessibility, and production review ✓ |

## localStorage Architecture

All user data is stored in the browser via a `StorageService` interface. UI components never call `localStorage` directly.

- **Storage service**: `LocalStorageService` implements get/set/remove/clear
- **Zustand stores**: Each feature has its own store that persists through the storage service
- **Hydration**: Stores load data client-side after mount to avoid SSR hydration errors
- **Future migration**: The `StorageService` interface can be swapped for Supabase or another backend without rewriting UI components

Storage keys are prefixed with `mealprep-pro:` to avoid collisions.

## Provider Architecture

External data sources use provider interfaces so the UI never depends on a specific API:

- **RecipeProvider**: `searchRecipes()` and `getRecipeById()` — mock, local, and external placeholder implementations
- **PriceProvider**: `searchProducts()` per supermarket — mock and placeholder implementations for Coles, Woolworths, Aldi
- **PriceComparisonService**: Aggregates multiple price providers with partial-failure handling

API keys are only used in Next.js server routes (`/api/recipes`, `/api/prices`), never in client-side code.

## License

Private project — not for redistribution.
