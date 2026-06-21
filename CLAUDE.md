# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A telemetry system for tracking custom skill invocations in Claude Code projects. A CLI client (`telemetry-client`) runs via the `SessionEnd` hook, parses the session transcript, and POSTs events to a Fastify server. A React dashboard displays skill usage rankings.

## Repository Status

Currently in **spec/planning phase** — no application code exists yet. Specs live in `docs/superpowers/specs/`, ADRs in `docs/architecture/decisions/`. Implementation plans go in `docs/superpowers/plans/`.

## Planned Package Structure (pnpm workspace)

When code lands, it will be organized as three packages:

- `client/` — CLI script (`telemetry-client init` and `telemetry-client sync`)
- `server/` — Fastify + SQLite backend
- `web/` — React + Vite SPA, served as static files by the server in production

## Commands (once packages exist)

```bash
# From package root
pnpm --filter client test
pnpm --filter server test
pnpm --filter web test
pnpm test:e2e          # Playwright, from repo root

# Linting (root)
pnpm lint:md           # Markdown lint
```

Each package will have its own `npm run test` (Vitest) and `npm run typecheck`.

## Architecture Decisions Worth Knowing

**Client**: runs at `SessionEnd` in two phases — Phase 1 syncs skills (`POST /api/skills`), Phase 2 parses the `.jsonl` transcript and submits events (`POST /api/events`). It exits 0 on most failures (non-blocking by design). It exits 1 only on `init` with an unreachable server.

**Server**: three-layer — routes handle HTTP, services orchestrate, repositories handle SQL. Tests go `fastify.inject()` → routes → services → repositories → in-memory SQLite. No mocking of internal layers.

**Frontend**: atomic design (atoms → molecules → organisms → pages). HTTP logic lives in services, not components. Fetch on filter change, no client-side cache.

**Skill IDs**: server-assigned, not client-generated (ADR-015). The client caches `(skill_name → skill_id)` locally. If the cache is lost, re-registering recreates it.

**Deduplication key**: `(session_id, tool_use_id)` — re-submitting the same transcript is safe.

**Namespaced skills** (containing `:`): skipped by the client with a stderr warning. Only `.claude/skills/` are tracked — not third-party plugins.

**No authentication** in MVP. The server URL is the only access control.

## Deployment

Railway Hobby plan. Two services: staging (auto-deploys on merge to `main`, database resets each deploy) and production (manual trigger from Railway dashboard). Main branch is protected. CI on every push runs lint, type checks, and tests.

## Key Specs

- `docs/superpowers/specs/2026-06-21-us-0.1-walking-skeleton.md` — first deliverable
- `docs/superpowers/specs/2026-06-21-us-1.1-project-registration.md` — `telemetry-client init`
- `docs/superpowers/specs/2026-06-21-us-2.1-skill-registration.md` — Phase 1 of `sync`
- `docs/superpowers/specs/2026-06-21-us-2.2-event-submission.md` — Phase 2 of `sync`
- `docs/superpowers/specs/2026-06-21-us-3.1-activity-dashboard.md` — the dashboard
