# Final Handoff

## What The App Is

Startup Post-Mortem Analyzer is a newsroom-style assistant that turns a startup name or URL into a structured first-draft post-mortem. It is intentionally sober, printable, and designed for editorial review rather than direct publication.

## What Works In Demo Mode

- Zero-env local boot
- Curated sample analyses plus generic fallback
- Article rendering, print/PDF export, and safe `/api/health`
- Light/dark theme toggle with persisted user preference
- Calm stateless handling when durable sharing is unavailable

## What Works With Optional Services

- `DATABASE_URL`: durable share links and the saved permalink page
- `DATABASE_URL` + created share links: recent drafts in `/archive`
- `MEILISEARCH_HOST`: archive search across indexed saved drafts
- `VALKEY_URL`: 24-hour cache for repeated live lookups

## 60-90 Second Demo

1. Open `/`
2. Use `Northvolt / industrial scale` or `Quibi / consumer habit`
3. Add one short reporting note
4. Generate the draft
5. Scroll the article header, timeline, and appendix lanes
6. Show `Create share link` or explain stateless mode, then show `Print / Save as PDF`
7. If PostgreSQL is configured, open `/archive`

## Screenshots To Capture

- Homepage empty state
- Demo Mode banner
- First generated article
- Shared permalink page
- Archive state that matches your env setup
- `/api/health` response

## LIIVO Upgrade Story

1. My Apps only: zero-env demo path
2. PostgreSQL: durable saved drafts and share links
3. Valkey: repeated lookup caching
4. Meilisearch: archive search

## Final Verification

```powershell
npm run lint
npm run typecheck
npm run test
npm run build
```
