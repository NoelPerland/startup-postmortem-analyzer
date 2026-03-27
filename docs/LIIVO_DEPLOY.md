# LIIVO Deploy Notes

## Deployment Shape

Deploy the app as a single Node.js My App. It is designed to boot in a valid state even when no external services are configured.

### Commands

- Install: `npm install`
- Build: `npm run build`
- Start: `npm start`

### Runtime

- Respect `process.env.PORT`
- Use `APP_URL` when you want canonical share links generated from a known public origin
- `APP_URL` also improves canonical metadata and Open Graph preview URLs for shared drafts

## Recommended LIIVO Rollout

### Phase 1: Demo-Ready My App

- Required env vars: none
- Outcome:
  - Demo Mode generation
  - Article rendering
  - Print / Save as PDF
  - Health diagnostics
  - Stateless share UX

### Phase 2: Live Generation

- Add `OPENAI_API_KEY`
- Optional: set `OPENAI_MODEL`
- Outcome:
  - Live server-side generation
  - One repair retry for structure-only failures
  - Demo fallback if live generation fails

### Phase 3: Durable Share Links

- Add `DATABASE_URL`
- Outcome:
  - PostgreSQL-backed save/load
  - Share links under `/a/[shareId]`
  - Shared permalink page
  - Archive page with recent saved drafts
  - Better social previews for saved permalink pages

### Phase 4: Cache + Indexing

- Add `VALKEY_URL`
- Add `MEILISEARCH_HOST`
- Optional: add `MEILISEARCH_API_KEY`
- Outcome:
  - 24-hour cache for repeated live lookups
  - Background indexing of saved analyses
  - Archive search across saved drafts once drafts have been indexed

## Env Matrix

### No env vars

- Default mode: demo
- Share links: disabled
- Cache: disabled
- Search indexing: disabled

### `OPENAI_API_KEY`

- Default mode: live
- Share links: disabled
- Cache: disabled unless `VALKEY_URL` is also set

### `DATABASE_URL`

- Default mode: demo
- Share links: enabled
- Saved drafts still index only if Meilisearch is configured

### `OPENAI_API_KEY` + `DATABASE_URL`

- Default mode: live
- Share links: enabled
- Best production-ready internship demo path

## Health Check

- Route: `/api/health`
- It always returns safe runtime diagnostics, even when optional services are missing.

Example zero-env response:

```json
{
  "ok": true,
  "app": "startup-postmortem-analyzer",
  "mode": "demo",
  "runtime": {
    "nodeEnv": "production",
    "appUrlConfigured": false,
    "defaultMode": "demo",
    "openAiModel": "gpt-5-mini"
  },
  "configured": {
    "openai": false,
    "postgres": false,
    "valkey": false,
    "meilisearch": false
  }
}
```

## Troubleshooting

### App boots but generation is demo-only

- Check `OPENAI_API_KEY`
- Confirm the health route reports `openai: "configured"`

### Share link creation fails

- Check `DATABASE_URL`
- Confirm PostgreSQL is reachable from the My App
- If health says PostgreSQL is configured but the share route still fails, inspect app logs for persistence errors

### Cache is not being used

- Check `VALKEY_URL`
- Cache only stores validated live results, not demo drafts and not failures

### Saved analyses are not searchable

- Check `MEILISEARCH_HOST`
- Check `MEILISEARCH_API_KEY` if your instance requires it
- Indexing is best-effort and happens after a successful durable save
- Archive browsing requires PostgreSQL plus at least one created share link
- Archive search requires Meilisearch plus already-indexed saved drafts, so empty search results are not the same as share failures

### Archive page is empty

- If PostgreSQL is not configured, the archive should explain that durable drafts are unavailable
- If PostgreSQL is configured, create at least one share link first
- If search is configured but no query results appear, confirm Meilisearch is reachable and that saved drafts were indexed after creation

## Operational Notes

- Keep secrets in LIIVO parameter store or equivalent server-side config
- The app never requires PostgreSQL, Valkey, or Meilisearch to boot
- Print-based PDF export needs no extra service and remains the safest demo path
