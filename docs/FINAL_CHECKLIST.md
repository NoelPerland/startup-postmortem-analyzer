# Final Checklist

## Product

- [ ] Homepage reads clearly in under 10 seconds
- [ ] Demo Mode feels intentional, not apologetic
- [ ] Light and dark themes both feel polished and readable
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
- [ ] Mobile checks at 320px, 375px, and tablet width
- [ ] Keyboard-only pass through form, theme toggle, archive links, and share controls
- [ ] Reduced-motion pass looks calm and usable
- [ ] Print preview first page and appendix page breaks look clean

## Submission Prep

- [ ] README reflects actual runtime behavior
- [ ] LIIVO deploy notes are current
- [ ] Demo runbook is rehearsed
- [ ] Screenshot shotlist is complete
- [ ] Final handoff summary is ready to share
