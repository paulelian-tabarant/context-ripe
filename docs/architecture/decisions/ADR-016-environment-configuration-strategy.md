# ADR-016: Environment Configuration Strategy

**Status**: Accepted  
**Date**: 2026-06-27  
**Deciders**: Single developer MVP

## Context

The application runs in four distinct environments — local development, CI, Railway staging, and Railway production —
each requiring different configuration values (database paths, server URLs, etc.). We need a consistent strategy for
managing these values without duplication or environment-switching logic in the application code.

Railway provides per-environment variable injection and persistent volumes for SQLite storage. The server and client
packages both need environment-specific configuration at runtime.

## Decision

**Same variable names everywhere, different values per context.** The application code reads environment variables with
no knowledge of which environment it's running in. Each context provides the appropriate values through its own
mechanism.

### Variable Sources by Environment

| Environment             | Source                      | SQLite Location     | Notes                             |
|-------------------------|-----------------------------|---------------------|-----------------------------------|
| **Local dev**           | `.env` file (gitignored)    | `./dev.db`          | Read by package scripts           |
| **CI (GitHub Actions)** | Hardcoded in workflow YAML  | `/tmp/test.db`      | Non-sensitive, CI-specific values |
| **Railway staging**     | Railway dashboard variables | Volume-mounted path | Auto-injected per environment     |
| **Railway production**  | Railway dashboard variables | Volume-mounted path | Auto-injected per environment     |

### Repository Files

- **`.env.example`** — Documents all required variable names (no values). Versioned.
- **`.env`** — Local development values. Gitignored.
- **`Dockerfile`** — Single image definition, no environment-specific branching.
- **`railway.toml`** — Build/start config with per-environment overrides for Railway-specific settings (not secret
  values).

### Railway Setup

- **Two Railway services**: staging (auto-deploys on merge to `main`, database resets each deploy) and production (
  manual trigger, persistent database).
- **Volume per environment**: Each Railway environment has its own persistent volume mounted for SQLite storage.
- **Variables per environment**: `DATABASE_PATH`, `SERVER_URL`, etc. configured in Railway dashboard per environment.

## Rationale

- ✅ Application code has zero environment-detection logic — just reads `process.env.VAR_NAME`
- ✅ `.env.example` documents the contract — onboarding shows what needs values
- ✅ No `.env.staging` / `.env.prod` files — Railway injects the right values automatically
- ✅ Single Dockerfile — no multi-stage builds with environment-specific layers
- ✅ CI variables are hardcoded in the workflow where they're used — no external secret store for non-sensitive test
  config

## Alternatives Considered

- **Environment-specific config files** (`.env.staging`, `.env.prod`) → Would require deployment-time file selection or
  build-time baking; Railway's variable injection is cleaner
- **Runtime environment detection** (`if (process.env.NODE_ENV === 'production')`) → Spreads configuration logic across
  the codebase; violates single responsibility
- **Separate Dockerfiles per environment** → Duplication and drift risk; unnecessary when Railway handles variable
  injection

## Consequences

**Positive**:

- ✅ Developers copy `.env.example` to `.env` once and are immediately productive
- ✅ Adding a new variable requires updating `.env.example`, workflow YAML (if used in CI), and Railway dashboard — no
  code changes
- ✅ No risk of deploying the wrong config — Railway environment variables are scoped to their service

**Risks/Trade-offs**:

- ⚠️ Railway dashboard is the source of truth for staging/production config — not in git (documented in deployment
  guide)
- ⚠️ CI variables live in workflow YAML — changing them requires a code commit (acceptable for non-sensitive test
  config)
- ⚠️ Volume-mounted SQLite paths must match `DATABASE_PATH` exactly — mismatch causes runtime failure (validated in
  deployment docs)
