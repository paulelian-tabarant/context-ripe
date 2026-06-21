# ADR-008: Frontend Data Fetching Strategy

**Status**: Accepted  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

The frontend needs to display usage data filtered by date range. Key question: should data be loaded
once and filtered client-side, or fetched from the server on every filter change?

## Decision

The React SPA calls `GET /api/projects/{project_id}/activity` on every filter change. No data is
cached client-side.

## Rationale

**Server-side filtering is more efficient** than client-side:

- ✅ Server-side date filters are meaningful and already implemented
- ✅ SQLite queries are fast; latency on an internal dashboard is imperceptible
- ✅ Dataset grows unbounded as invocations accumulate — client-side approach degrades over time
- ✅ Simpler frontend state: no cache invalidation, no stale data concerns

**Why not load all data once**:

- ❌ Loads unbounded history on every page open (gets worse over time)
- ❌ Makes server-side date filters pointless (client overrides them anyway)
- ❌ Requires cache invalidation logic (when does cache expire?)
- ❌ Risk of stale data if events are ingested while user is viewing

## Alternatives Considered

- **A. Load all data once, filter client-side** — instant UI response, but loads unbounded history,
  degrades over time
- **B. Fetch on every filter change (chosen)** — respects server-side filters, scales correctly, simple
  state management

## Consequences

**Positive**:

- ✅ Scales correctly as data grows (queries stay fast due to date ranges)
- ✅ Server-side date filters are used and meaningful
- ✅ No client-side cache invalidation logic
- ✅ Always fresh data (no stale view concern)

**Risks/Trade-offs**:

- ⚠️ Small loading state on each filter change (acceptable for an internal tool)
- ⚠️ Depends on server response speed (mitigated by SQLite performance, typical response <100ms)

**Loading UX**:

- Show spinner during fetch
- Preserve previous results until new data arrives (avoid flickering)
- Display error state if server is unreachable
