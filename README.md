# Startup Post-Mortem Analyzer

Startup Post-Mortem Analyzer is a newsroom-style research assistant for producing structured first-draft analyses of failed or struggling startups. It is built for Erik Sandberg's LIIVO internship assignment: serious tone, fast demo path, and optional infrastructure that stays out of the way until it is needed.

## What The App Does

- Accepts a startup name or URL plus optional reporting notes
- Generates a structured draft with:
  - Timeline
  - What Went Wrong
  - What Could Have Saved It
  - Lessons for Founders
- Separates observed facts, plausible hypotheses, and open questions
- Renders the result as a clean article, not a dashboard
- Supports print-based PDF export
- Supports durable share links when PostgreSQL is configured
- Adds Open Graph and Twitter previews for the site and saved permalink pages
- Includes a persisted light/dark theme with system preference support
- Optionally caches live analyses in Valkey and indexes saved analyses in Meilisearch
- Includes a lightweight optional archive page for recent saved drafts

## App Flow

1. Enter a company name or URL
2. Add short reporter notes if you want to steer the angle
3. Generate a draft through the server action
4. Review the article-style output
5. Print to PDF or create a durable share link if persistence is configured
6. Optionally review recent saved drafts in `/archive`
7. Share a saved permalink that unfurls with a calm editorial preview

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS 4
- Zod
- OpenAI Node SDK
- PostgreSQL via `pg`
- Valkey-compatible cache via `redis`
- Meilisearch for optional indexing
- Vitest for lightweight smoke coverage

## Project Structure

- `app/`: routes, server actions, health, share API, not-found, shared permalink page
- `components/`: form, article renderer, share/export controls, footer
- `domain/`: schemas, prompt text, editorial validation, input normalization
- `lib/ai/`: provider abstraction, OpenAI provider, Demo Mode provider, orchestration
- `lib/persistence/`: no-op and PostgreSQL stores
- `lib/future.ts`: optional Valkey cache and Meilisearch indexer factories
- `docs/`: LIIVO deployment notes and internship templates
- `tests/`: smoke coverage for normalization, fallback behavior, sharing, health, and factories

## Run Locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification Commands

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```

## Environment Variables

### Required For Live AI Generation

- `OPENAI_API_KEY`

### Optional

- `OPENAI_MODEL`
- `DATABASE_URL`
- `APP_URL`
- `VALKEY_URL`
- `MEILISEARCH_HOST`
- `MEILISEARCH_API_KEY`

No secrets are exposed to client components.

## Demo Mode vs Live Mode

### Demo Mode

- Active automatically when `OPENAI_API_KEY` is missing
- Uses curated local sample analyses plus a generic fallback
- Keeps the entire UI, print flow, and health route usable with zero env vars
- Treats stateless share behavior as normal rather than as a crash path
- Keeps the archive page coherent by explaining why durable drafts are unavailable

### Live Mode

- Activated automatically when `OPENAI_API_KEY` is present
- Runs server-side generation through OpenAI
- Validates structured output with Zod before render
- Sanitizes model output before final parse
- Retries once on structure-only failures
- Falls back to a demo draft if the live call fails, instead of dead-ending the UI

## Share Links

- Durable share links require `DATABASE_URL`
- Without PostgreSQL, the app stays fully usable in stateless mode and clearly guides users toward print/PDF export
- With PostgreSQL enabled, saved drafts are available at `/a/[shareId]`
- Saved permalink pages include Open Graph and Twitter metadata for cleaner unfurls
- If `MEILISEARCH_HOST` is also configured, saved analyses are indexed in the background

## Archive

- `/archive` is intentionally small and editorial
- Without PostgreSQL, it explains that saved drafts are unavailable in this deployment
- With PostgreSQL, it lists recent durable drafts
- With PostgreSQL and Meilisearch, it also supports lightweight archive search
- Search prioritizes company and subject matches, then falls back to concise preview snippets from the analysis body

## Optional Upgrade Path

1. PostgreSQL for durable share links and saved analyses
2. Valkey for 24-hour caching of repeated live lookups
3. Meilisearch for indexing saved analyses and later archive search

## LIIVO My Apps Deployment

- Deploy as a single Node.js My App
- The app is phase-1 ready with no bound services
- Add `OPENAI_API_KEY` when you want live generation
- Add `DATABASE_URL` when you want durable share links
- Add `VALKEY_URL` and `MEILISEARCH_HOST` only when you want the optional cache/indexing path

Detailed LIIVO notes live in [`docs/LIIVO_DEPLOY.md`](./docs/LIIVO_DEPLOY.md).
Demo-facing handoff notes live in:

- [`docs/DEMO_RUNBOOK.md`](./docs/DEMO_RUNBOOK.md)
- [`docs/SCREENSHOT_SHOTLIST.md`](./docs/SCREENSHOT_SHOTLIST.md)
- [`docs/FINAL_CHECKLIST.md`](./docs/FINAL_CHECKLIST.md)
- [`docs/FINAL_HANDOFF.md`](./docs/FINAL_HANDOFF.md)

## Health Endpoint

- Route: `/api/health`
- Returns safe runtime diagnostics for:
  - default mode
  - configured integrations
  - `APP_URL` presence
  - non-fatal degraded notes when optional services are missing

## Architecture Rationale

- Server actions keep generation private and simple
- Zod schemas protect the UI from malformed or noisy model output
- The provider interface is small so OpenAI can be swapped later without moving the app around
- Persistence, cache, and indexing are optional behind narrow abstractions so the app still boots with zero env vars
- Print-based PDF export is more dependable than a brittle server PDF layer for an internship MVP
