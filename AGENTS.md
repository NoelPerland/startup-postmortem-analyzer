# AGENTS.md

This repository is a standalone internship MVP for the Startup Post-Mortem Analyzer. Keep changes focused on the product itself, not generic framework churn.

## Working Rules

- Preserve the stateless-first design. The app must boot cleanly without `OPENAI_API_KEY` and without `DATABASE_URL`.
- Live-model failures must degrade into a reviewable demo draft rather than a blank error state.
- Do not expose secrets to client components.
- Keep the main generation flow in server actions unless a route must be addressable externally.
- Render only validated structured data. Do not add ad hoc markdown parsing or freeform model rendering.
- Sanitize model output before final render validation so the UI does not depend on sloppy-but-schema-valid text.
- Keep the visual language editorial, minimal, and printable. Avoid dashboard chrome and unnecessary animation.
- Treat PostgreSQL, Valkey, and Meilisearch as optional add-ons behind narrow interfaces.

## File Ownership Guide

- `app/`: route composition, metadata, health, share endpoint, not-found behavior
- `components/`: UI composition and client interactions
- `domain/`: Zod schemas, domain types, prompt text, input normalization
- `lib/ai/`: provider interface and model adapters
- `lib/persistence/`: share-link storage implementations
- `docs/`: internship handoff and LIIVO deployment notes

## Quality Bar

- Keep `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` green.
- Favor small, explicit abstractions over framework-heavy patterns.
- If persistence behavior changes, update both the UI copy and the deployment docs.
- If cache or search behavior changes, keep the integrations soft-failing and env-gated.
