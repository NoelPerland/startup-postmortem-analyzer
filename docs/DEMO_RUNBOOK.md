# Demo Runbook

## Goal

Show the product as a calm newsroom tool, not an AI trick.

## Recommended Demo Path

1. Open `/`
2. Point out the editorial framing, the first-draft guardrail, and the theme toggle
3. Use `Northvolt / industrial scale` or `Quibi / consumer habit`
4. Add one short note to sharpen the angle
5. Generate the draft
6. Scroll the article header, timeline, and the three uncertainty lanes
7. Show the two outputs:
   - durable permalink
   - clean PDF
8. If PostgreSQL is configured, open `/archive` and show that saved drafts can be revisited later
9. If PostgreSQL is not configured, stay on the permalink/PDF story and explain that archive history appears in the persistence-enabled deployment

## Best Talking Points

- The app boots cleanly with zero env vars
- Demo Mode is intentional and still shows the real product flow
- Live mode keeps secrets server-side and validates structured output before render
- Share links require PostgreSQL, but the app still works well without it
- Cache and search are optional later-phase upgrades, not prerequisites

## Best Demo Examples

- `Northvolt / industrial scale`
- `Quibi / consumer habit`
- `Babylon / regulated growth`
- `Jawbone / hardware squeeze`

## If Live Mode Fails

- Say that the app is designed to degrade into a usable draft instead of dead-ending
- Continue the demo in the fallback draft and keep moving

## If Share Links Are Unavailable

- Explain that this deployment is running in phase 1 stateless mode
- Use the print-to-PDF path instead

## If Archive Search Is Unavailable

- Explain that archive search is a later-phase enhancement layered on top of durable saved drafts
- Show the recent-drafts list if PostgreSQL exists
- Do not promise search unless Meilisearch is actually configured
