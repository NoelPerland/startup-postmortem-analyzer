# Final Checklist

## Product

- [ ] Homepage reads clearly in under 10 seconds
- [ ] Demo Mode feels intentional, not apologetic
- [ ] First successful generation feels polished
- [ ] Share and PDF outputs are both obvious
- [ ] Shared permalink page feels first-class
- [ ] Archive page degrades gracefully when persistence is unavailable
- [ ] Archive recent-drafts state is verified when persistence is configured
- [ ] Archive search is verified only when Meilisearch is configured
- [ ] Shared permalink unfurl or metadata preview is checked on a real `/a/[shareId]` URL

## Runtime

- [ ] Zero-env boot works
- [ ] Live-mode failure degrades into a usable draft
- [ ] PostgreSQL is optional
- [ ] Valkey is optional
- [ ] Meilisearch is optional
- [ ] `/api/health` returns safe diagnostics

## Verification

- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`

## Submission Prep

- [ ] README reflects actual runtime behavior
- [ ] LIIVO deploy notes are current
- [ ] Demo runbook is rehearsed
- [ ] Screenshot shotlist is complete
- [ ] Final handoff summary is ready to share
