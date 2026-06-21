# ADR-001: SessionEnd Hook + Transcript Parsing

**Status**: Accepted  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

We need to capture skill invocation events from Claude Code sessions. The main constraint is that we want
to instrument skill invocations without adding performance overhead or requiring changes to skill definitions
themselves.

Two primary approaches exist:

1. **PreToolUse hook** — fire a hook before each tool invocation
2. **SessionEnd hook + transcript parsing** — fire a hook once when the session ends, parse the full
   transcript

## Decision

Use Claude Code's `SessionEnd` hook to invoke the telemetry client script, which runs two sequential phases:

**Phase 1 — Skill sync**: reads `.claude/skills/`, registers any skills unknown to the local cache
with the server (`POST /api/skills`), and persists the returned server-assigned IDs locally.

**Phase 2 — Event submission**: parses the just-closed `.jsonl` transcript, resolves skill names to
server-assigned IDs from the local cache, and sends invocation events (`POST /api/events`).

## Rationale

**Why PreToolUse was abandoned**:

- PreToolUse fires before the skill loads, meaning the hook cannot access the skill's frontmatter
  (including `skill_id`)
- Would require running logic on every tool invocation (performance impact)
- Session resume/pause would fire the hook multiple times

**Why SessionEnd + transcript parsing is superior**:

- ✅ Full transcript available — all invocations captured in one pass
- ✅ No impact on session performance (runs after session closes)
- ✅ Transcript format is stable (31 patch versions tested with zero structural changes)
- ✅ One invocation per session, naturally deduplicates across resume/pause cycles
- ✅ Skill sync in Phase 1 ensures all IDs are resolved before Phase 2 runs — no skipped events

## Alternatives Considered

- **A. PreToolUse hook** — real-time capture but loses frontmatter context, higher overhead, harder to handle
  session resume
- **B. Modify skill files to emit telemetry** — breaks on skill updates, high maintenance burden,
  intrusive
- **C. SessionEnd + transcript parsing** ← **Chosen** — simple, decoupled, resilient

## Consequences

**Positive**:

- ✅ Simple, decoupled implementation
- ✅ Resilient: session end is not blocked if telemetry fails
- ✅ Works naturally with session resume/pause (no double-counting)
- ✅ All invocation data captured in one pass

**Risks/Trade-offs**:

- ⚠️ Slight delay: invocations only tracked after session closes (acceptable for a dashboard used after
  work is done)
- ⚠️ Depends on transcript format stability (mitigated by version detection and schema validation tests)
