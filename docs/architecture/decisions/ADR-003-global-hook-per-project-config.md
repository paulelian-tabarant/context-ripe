# ADR-003: Global Hook Install + Per-Project Config

**Status**: Accepted  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

We need to decide where telemetry is enabled. Key constraints:

- Low installation friction (developers should not need to run complex setup)
- Per-project control and privacy (teams should opt-in, not opt-out)
- Enable per-project visibility (teams understand which skills are relevant in their codebase)

## Decision

- Install telemetry hook once in `~/.claude/settings.json` (global)
- Each project opts in by running `telemetry-client init` (per-project, manual)
- The client exposes two commands: `init` (manual, one-time) and `sync` (automatic, hook-driven)

## Implementation

```json
// ~/.claude/settings.json
{
  "hooks": {
    "SessionEnd": [
      {
        "command": "<telemetry-client> sync"
      }
    ]
  }
}
```

**`telemetry-client init`** — run once manually per project:

1. Calls `POST /api/projects` to register the project with the server
2. Server assigns a stable `project_id` and returns it
3. Client writes the `project_id` to a local gitignored cache (alongside the skill ID cache)

The server URL is provided to `init` at call time (exact mechanism TBD — flag, env var, or prompted
input). The `sync` command reads it from the same local cache.

**`telemetry-client sync`** — invoked automatically by the `SessionEnd` hook:

1. Reads `project_id` and server URL from the local cache
2. Registers any new skills via `POST /api/skills` (Phase 1)
3. Submits invocation events via `POST /api/events` (Phase 2)

**Script location**: `~/.local/bin/<telemetry-client>` (consistent with other user tools like `serena-hooks`; name TBD)

- Referenced by name in hook (no path needed if `~/.local/bin` is in PATH)
- Installation documented in README — no automated installer for MVP

## Rationale

- ✅ One-time developer setup (install globally once) — low friction
- ✅ Per-project opt-in (privacy, intentionality) — teams decide what to track
- ✅ Per-project visibility — teams understand which skills are relevant in their specific context
- ✅ Context-aware (knows which project each invocation belongs to) — via project_id in local cache (server-assigned on `init`)

## Alternatives Considered

- **A. Global hook + no per-project opt-in** — tracks everything, violates privacy, hard to opt-out
- **B. Per-project hook install** — higher friction, requires setup in each project
- **C. Global hook + per-project opt-in via `init`** ← **Chosen** — best of both worlds

## Consequences

**Positive**:

- ✅ One-time developer setup
- ✅ Per-project opt-in control
- ✅ Per-project skill usage visibility
- ✅ Clear separation of concerns (what/where is tracked globally, why/where data goes is per-project)

**Risks/Trade-offs**:

- ⚠️ Two steps required for developers: install global hook + run `init` per project
- ⚠️ Installing globally means the hook fires even in projects that haven't run `init` (mitigated by
  silent exit if local cache is absent)
- ⚠️ Developers must run `init` once before the `sync` command can send events (mitigated by clear
  error messaging if the local cache is absent)
