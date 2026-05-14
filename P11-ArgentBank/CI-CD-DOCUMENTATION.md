<!-- @format -->

# CI/CD Documentation - ArgentBank

## Overview

The CI/CD pipeline runs on GitHub Actions with a single unified workflow (`ci-cd.yml`).
Every push to any branch triggers the full pipeline. Merges into `main` additionally trigger a production deployment on Vercel.

## Workflow architecture

```text
Push / Pull Request
        │
        ▼
┌─────────────────────────────────────────┐
│  Job 1 · ci-tests                       │
│  ESLint · TypeScript · Vitest · Build   │
│  (blocking — stops pipeline on failure) │
└──────────────────┬──────────────────────┘
                   │ needs: ci-tests
                   ▼
┌─────────────────────────────────────────┐
│  Job 2 · deploy-preview                 │
│  Vercel preview deployment              │
│  → outputs preview URL                  │
└──────────────────┬──────────────────────┘
                   │ needs: deploy-preview
          ┌────────┴────────┐
          ▼                 ▼
┌──────────────────┐  ┌─────────────────────────────────────┐
│ Job 3 · pa11y    │  │  Job 4 · cypress-tests              │
│ Accessibility    │  │  E2E tests against preview URL       │
│ (blocking)       │  │  (blocking)                         │
└────────┬─────────┘  └──────────────────┬──────────────────┘
         │                               │
         └──────────────┬────────────────┘
                        │ needs: pa11y-tests + cypress-tests
                        ▼
         ┌──────────────────────────────────────┐
         │  Job 5 · lighthouse-tests            │
         │  Performance audit on preview URL    │
         │  desktop + mobile (blocking)         │
         └──────────────┬───────────────────────┘
                        │ needs: lighthouse-tests + branch == main
                        ▼
         ┌──────────────────────────────────────┐
         │  Job 6 · promote-production          │
         │  Vercel production deployment        │
         │  (only on merge into main)           │
         └──────────────────────────────────────┘
```

A separate `analysis.yml` workflow runs in parallel (non-blocking): coverage report, bundle size, security audit.

## Workflow file

`.github/workflows/ci-cd.yml` — working directory: `P11-ArgentBank/`

## Key configuration

| Item                  | Value                          |
| --------------------- | ------------------------------ |
| Node.js               | 24.x                           |
| pnpm                  | 10.4.0                         |
| Cypress               | 14.x (Electron, headless)      |
| Vercel Root Directory | `P11-ArgentBank/`              |
| API URL               | `https://db.lostintab.com/api` |

## Required GitHub secrets

| Secret                            | Purpose                                  |
| --------------------------------- | ---------------------------------------- |
| `VERCEL_TOKEN`                    | Vercel authentication                    |
| `VERCEL_ORG_ID`                   | Vercel organization                      |
| `VERCEL_PROJECT_ID`               | Vercel project                           |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Bypass Vercel protection for CI requests |

## Branch protection (main)

- Required status checks (blocking merge): `ci-tests`, `pa11y-tests`, `cypress-tests`, `lighthouse-tests`
- No direct push to `main`
- Squash merge only

## Vercel strategy

- **Preview**: every branch push creates a Vercel preview URL used by CI tests
- **Production**: automatic on merge into `main`, only if all required checks pass
- Vercel Git Integration is active; `vercel.json` is committed in `P11-ArgentBank/`

## Flask VPS API

The frontend calls `https://db.lostintab.com/api`. The API is a Flask application running on a VPS with:

- PostgreSQL database
- Server-side CSRF token storage and validation
- Rate limiting via PostgreSQL advisory locks
- Endpoints: `/user/login`, `/user/profile`, `/csrf/store`, `/accounts`, `/transactions/search`

The frontend only needs `VITE_API_URL` — no database, JWT, or Redis secrets are required on the Vercel side.
