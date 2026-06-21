# ADR-005: Stable Skill IDs in Frontmatter

**Status**: Superseded by [ADR-015](ADR-015-server-managed-skill-ids.md)  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

Skills get renamed over time (e.g., "test-driven-development" → "tdd"). Without a stable identifier,
renaming breaks historical continuity — the old and new name appear as separate skills in the dashboard.

## Decision

Each skill file includes a stable UUID in frontmatter that persists across renames.

```markdown
---
id: 550e8400-e29b-41d4-a716-446655440000
name: test-driven-development
description: Use when implementing features...
---
```

## Rationale

- ✅ Renames don't fragment historical data — the skill_id stays the same
- ✅ Natural extension of existing frontmatter pattern (already used for name, description)
- ✅ UUID is standard, globally unique (no registry needed)

## Alternatives Considered

- **A. Track by name only** → Breaks history on rename (data fragmentation)
- **B. Stable ID (chosen)** → Robust, survives renames, portable
- **C. Content hash** → Fragile to minor edits (even whitespace changes break continuity)
- **D. Manual mapping in dashboard** → Post-hoc fix, manual burden, error-prone

## Consequences

**Positive**:

- ✅ Renames don't break historical data
- ✅ Natural extension of existing frontmatter pattern
- ✅ No server-side mapping table needed

**Risks/Trade-offs**:

- ⚠️ Requires adding IDs to existing skills (one-time migration task)
- ⚠️ Developers must not change skill IDs once assigned (documented clearly)
- ⚠️ Skills without an `id` are skipped during telemetry (client logs warning)
