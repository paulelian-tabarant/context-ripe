# Skill Usage Tracking - Design Specification

**Status**: Updated — architecture and testing decisions added 2026-06-20  
**Date**: 2026-06-18

---

## Navigation

- **[Major version specs](versions/)** — high-level scope and feature definitions
  - [Version 1.0.0](versions/version-1-scope.md) — MVP: skill usage tracking
  - [Version 2.0.0](versions/version-2-scope.md) — Richer dashboard visualizations (heatmap)
- **Supporting Analysis**:
  - [Transcript Format Stability](analysis/transcript-format-stability.md)
  - [Agent Compatibility](analysis/agent-compatibility.md)

---

## Problem Statement

Teams create many custom skills for coding agents but have no visibility into:

- Which skills are actually being used
- Which team members are leveraging skills effectively
- Whether skills are worth maintaining or should be deprecated

The initial pain point: **"We create lots of skills but don't know if they're useful."**

## CLI Commands

The telemetry client exposes two commands:

- **`telemetry-client init`** — run once manually per project; registers the project with the server
  and caches the assigned `project_id` locally
- **`telemetry-client sync`** — invoked automatically by the `SessionEnd` hook; registers new skills
  and submits invocation events

**Phase 0 — Project registration** (`POST /api/projects`):

```typescript
interface ProjectRegistrationResponse {
    project_id: string;
}
```

Run once via `telemetry-client init`. Server assigns a stable `project_id`. Client persists it in a
local gitignored cache (format TBD, alongside the skill ID cache).

**Phase 1 — Skill registration** (`POST /api/skills`):

```typescript
interface SkillRegistrationRequest {
    project_id: string;   // from local cache (set by init)
    skills: Array<{ name: string }>;
}

interface SkillRegistrationResponse {
    skills: Array<{ name: string; skill_id: string }>;
}
```

Server is idempotent: same `(project_id, name)` always returns the same `skill_id`. Client persists
returned IDs in a local gitignored cache (format TBD, same cache as `project_id`).

**Phase 2 — Event submission** (`POST /api/events`):

```typescript
interface SkillInvocationEvent {
    skill_id: string;       // Server-assigned ID, resolved from local cache
    skill_name: string;     // Current name (for server-side display)
    timestamp: string;      // ISO 8601
    user_email: string;     // git config user.email
    project_id: string;     // From local cache (server-assigned on init)
    session_id: string;     // Claude Code session ID
    tool_use_id: string;    // Unique per invocation (dedup key)
}
```

**Activity API response** (`GET /api/projects/{project_id}/activity`):

```typescript
interface ActivityResponse {
    skills: Array<{
        skill_id: string;
        name: string;       // current_name from skills table (server-side JOIN)
        invocations: number;
    }>;
}
```

**Deduplication key**: `(session_id, tool_use_id)`

**On Phase 0**: server inserts a new row into `projects` and returns the assigned `project_id`.
**On Phase 1**: server upserts `skills` with `ON CONFLICT(project_id, name) DO NOTHING`, returning the
existing or newly created `skill_id`. **On Phase 2**: server bulk-inserts into `events` with
`ON CONFLICT DO NOTHING`. The activity endpoint JOINs both tables — renames handled server-side,
historical events automatically show the current name.

## Transcript Format Stability

The transcript format used by Claude Code for logging session activity is stable and suitable for
production use. See detailed analysis in
[Transcript Format Stability](analysis/transcript-format-stability.md).

**Summary**: The 2.1.x series has been stable across 31+ patch versions with zero structural changes.
Format risk is low and mitigated by version detection and schema validation tests.

## Portability to Other Coding Agents

The architecture is designed to be **agent-agnostic** at the API level. While the MVP focuses on
Claude Code, extending to other agents (Cursor, Windsurf, Copilot, Gemini Code Assist, etc.) is
straightforward via client-side adapters.

See detailed analysis in [Agent Compatibility](analysis/agent-compatibility.md).

**Summary**: The server API accepts a unified event format, making it simple for adapter scripts to
ingest data from any agent that logs tool invocations.
