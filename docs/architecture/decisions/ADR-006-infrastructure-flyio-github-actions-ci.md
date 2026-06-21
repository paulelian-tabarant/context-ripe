# ADR-006: Infrastructure — Fly.io + GitHub Actions CI

**Status**: Accepted  
**Date**: 2026-06-18  
**Deciders**: Single developer MVP

## Context

We need to choose a deployment platform and CI/CD approach. Constraints:

- Persistent SQLite database required
- Hosted on GitHub — collaboration-ready from the start
- Free tier preferred (internal experiment budget)
- Simple deployment workflow

## Decision

- **Hosting**: Fly.io — persistent volume for SQLite, free tier, `fly deploy` from CLI
- **CI/CD**: GitHub Actions — runs on every push and PR, deploys on merge to main

## Rationale

**Fly.io**:

- ✅ First-class SQLite support via persistent volumes
- ✅ Free tier includes persistent disk (unlike Render, Railway at scale)
- ✅ Genuine free tier (unlike Railway's consumption-based $5/mo)
- ✅ `fly deploy` works directly from CLI or from CI
- ✅ Litestream sponsorship (SQLite replication if needed later)

**GitHub Actions**:

- ✅ CI status visible on every PR — collaboration-ready from day one
- ✅ No discipline-enforced hooks that can be bypassed with `--no-verify`
- ✅ Automated deploy pipeline on merge to main
- ✅ Free for public repos; generous free minutes for private repos
- ✅ No separate CI infrastructure to set up or maintain

## Alternatives Considered

**Hosting alternatives**:

- **Railway** — excellent DX but free tier is consumption-based (~$5/mo), SQLite on volumes works
  but not their primary story
- **Render** — free tier has cold starts and persistent disk costs extra (not included in free tier)
- **Heroku** — terminated free tier (not an option)
- **Vercel / Netlify** — serverless-only, no persistent filesystem, incompatible with SQLite
- **Fly.io** ← **Chosen** — best SQLite story, genuine free tier

**CI alternatives**:

- **Local pre-push hook** — simple for single developer, but bypassed by `--no-verify` and
  invisible to collaborators
- **GitHub Actions** ← **Chosen** — visible CI status on PRs, automated deploys, no local setup required
- **Manual testing before push** — discipline-enforced, error-prone

## Consequences

**Positive**:

- ✅ Free tier sufficient for internal MVP
- ✅ CI status visible on every PR — ready for collaboration from day one
- ✅ SQLite persistence handled natively via Fly.io volume
- ✅ Automated deploy on merge to main (`fly deploy` ~30s)
- ✅ No risk of bypassing tests with `--no-verify`

**Risks/Trade-offs**:

- ⚠️ GitHub Actions minutes consumed per run (generous free tier, not a concern for this scale)
- ⚠️ `FLY_API_TOKEN` must be added as a GitHub secret before first deploy
