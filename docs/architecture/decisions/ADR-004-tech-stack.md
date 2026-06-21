# ADR-004: Tech Stack

**Status**: Accepted  
**Date**: 2026-06-18 (updated 2026-06-21)  
**Deciders**: Single developer MVP

## Context

We need to choose technologies for the client script, server, and frontend that balance:

- Developer velocity (single developer, MVP timeline)
- Ecosystem maturity (stable, proven tools)
- Operational simplicity (easy to deploy and monitor)

## Decision

- **Client script**: TypeScript + Node.js (name and install location TBD) — parses the `.jsonl` transcript,
  POSTs events to the server
- **Server**: TypeScript + Node.js + Fastify + SQLite — handles ingest, deduplication, skills normalization
- **Frontend**: React + Vite — SPA served by the Fastify server at `/`

## Rationale

**TypeScript + Node.js throughout**:

- ✅ **Familiarity is the primary driver** — the developer knows TypeScript; using Python would require
  learning to assess code quality, manage dependencies, and structure tasks before being able to iterate
  confidently
- ✅ One complexity at a time: standing up a working end-to-end system with solid testing harness is
  already complex enough; adding an unfamiliar language/ecosystem on top is avoidable scope
- ✅ Shared TypeScript types between client, server, and frontend (e.g., `SkillInvocationEvent`)
- ✅ Existing fluency with npm, tsconfig, and Vitest means no ramp-up on tooling

**Fastify**:

- ✅ Fastest Node.js HTTP framework with low overhead
- ✅ First-class TypeScript support
- ✅ Plugin-based architecture — easy to add static file serving, CORS, etc.
- ✅ Built-in JSON schema validation and serialization
- ✅ Excellent test ergonomics via `fastify.inject()` (no real HTTP needed in tests)
- ✅ Can adopt a higher-level framework on top if complexity warrants it later

**SQLite**:

- ✅ Zero infrastructure setup (file-based)
- ✅ Sufficient for MVP scale (single-digit concurrency, millions of events over time)
- ✅ First-class support on Fly.io (persistent volumes, Litestream sponsorship)
- ✅ ACID guarantees for deduplication logic
- ✅ `better-sqlite3` provides a synchronous, ergonomic Node.js driver

**React + Vite**:

- ✅ Vite provides fast hot module reload (excellent DX)
- ✅ React is familiar to most frontend developers
- ✅ Mature ecosystem
- ✅ SPA compiles to static files, served by Fastify's static plugin

## Alternatives Considered

- **A. Python throughout** — unfamiliar ecosystem; would require learning dependency management, task
  tooling, and code quality conventions before being able to iterate confidently
- **B. Go for server** — would require learning a new ecosystem, no material gain for this scale
- **C. Svelte/Vue frontend** — equally valid, but React is more widely known
- **D. Express instead of Fastify** — valid, but Fastify has better performance, built-in validation,
  and cleaner TypeScript types
- **E. Higher-level framework (NestJS, etc.)** — too opinionated for MVP; revisit if Fastify becomes
  insufficient

## Consequences

**Positive**:

- ✅ Single language reduces cognitive load and onboarding friction
- ✅ Shared types between client, server, and frontend (e.g., `SkillInvocationEvent`)
- ✅ Fastify enables rapid iteration (validation, serialization, error handling built-in)
- ✅ SQLite requires zero infrastructure setup
- ✅ React + Vite is a proven, fast development loop

**Risks/Trade-offs**:

- ⚠️ Node.js has higher memory baseline than Go (not a concern for this use case)
- ⚠️ SQLite has limitations on concurrent writes (acceptable for MVP, scale when needed)
- ⚠️ `better-sqlite3` is synchronous — avoid blocking the event loop with heavy queries
  (not a concern at MVP scale)
