# Version 2.0.0 : Scope — Richer Dashboard Visualizations

**Status**: Defined  
**Date**: 2026-06-22

---

## Overview

V2 extends the dashboard with visualizations that reveal *when* skills are used, not just *how often*.
The ranked table from V1 answers "which skills are popular"; V2 adds temporal context to that picture.

---

## Feature: Skill Usage Heatmap

A heatmap complements the existing ranked table on the dashboard page. Both views share the same
date range filter and update together.

The heatmap is a grid: rows are skills, columns are calendar weeks within the selected date range.
Each cell is colored on a blue-to-red scale proportional to the invocation count for that skill
that week — blue for low activity, red for high. Skills are ordered top-to-bottom by total
invocations over the selected range, matching the ranked table's order so the two views stay coherent.

Hovering a cell surfaces the skill name, the week range, and the invocation count for that week.

**Testing note**: the heatmap requires multi-week data to be exercised meaningfully. Seeded fixture
data spanning several weeks is required in the test environment.

---

## Deferred from V1 (still under consideration for V2+)

- Per-developer breakdown: which team members are using which skills
- Skill effectiveness / outcome tracking
- Authentication: shared API key per team (required before broader rollout)

---
