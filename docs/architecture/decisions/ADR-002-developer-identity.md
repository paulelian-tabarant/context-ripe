# ADR-002: Developer Identity Source

**Status**: Accepted  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

We need to track which developer invoked each skill to provide per-developer breakdown in future iterations.
The question is: what source of truth do we use for developer identity?

## Decision

Use `git config user.email` as the developer identifier. Captured by the client script and included in
every telemetry event.

## Rationale

- ✅ Already configured by all developers (prerequisite for git commits)
- ✅ Stable and unique per developer
- ✅ No separate authentication or configuration needed
- ✅ Works across all projects (developer carries their git config)
- ✅ Supports future grouping by email domain if needed (e.g., all @company.com devs)

## Alternatives Considered

- **A. Hardcoded environment variable (e.g. `USER` env var)** — not reliable, can be wrong or unset
- **B. Session author from Claude Code** — if available, but not guaranteed in all Claude Code versions
- **C. `git config user.email`** ← **Chosen** — always available, already trusted by version control

## Consequences

**Positive**:

- ✅ No additional setup required from developers
- ✅ Naturally tied to git history and commits
- ✅ Immutable for audit purposes

**Risks/Trade-offs**:

- ⚠️ Assumes `git config user.email` is set (almost always true, caught in telemetry client with warning
  if missing)
- ⚠️ Email addresses are mildly sensitive (not tracked during MVP, see ADR-003)
