# Build Plan

## Product Goal

Ship a demo-ready newsroom tool that turns a startup name or URL into a sober first-draft post-mortem, then lets the user print it or share it when persistence is configured.

## Phase 1

- Standalone Next.js app with one polished homepage
- Server-side analysis generation with Demo Mode fallback
- Structured article rendering for the four required sections
- Print / Save as PDF flow
- Health endpoint

## Phase 2

- PostgreSQL-backed saved analyses
- Durable share links via `/a/[shareId]`

## Phase 3

- Valkey-backed 24-hour caching for repeated lookups

## Phase 4

- Meilisearch indexing for an archive/search experience
- Lightweight archive page for saved drafts when persistence exists

## V2 Hardening

- Improve input guidance, loading, error, and share UX without replacing the editorial layout
- Harden prompt quality and sanitize model output before final render validation
- Fall back from live generation to a usable demo draft when the model call fails
- Add env-gated Valkey caching and env-gated Meilisearch indexing
- Expand `/api/health` into a safe runtime diagnostics endpoint
- Keep docs and tests aligned with the real runtime matrix

## Guardrails

- Boot without optional services
- Keep public API surface small
- Prefer demo strength over infrastructure depth
