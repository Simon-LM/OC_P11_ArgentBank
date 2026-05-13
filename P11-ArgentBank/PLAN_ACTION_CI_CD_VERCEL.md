<!-- @format -->

# Action Plan - CI/CD and Vercel

## Objective

Stabilize ArgentBank as a portfolio showcase project with a professional workflow: branches, Pull Requests, blocking CI/CD, controlled Vercel deployment, accurate documentation, and reliable tests.

## Target Workflow

```text
working branch -> Pull Request -> required CI/CD -> merge into main -> Vercel production deployment
```

The goal is to avoid the unsafe workflow below:

```text
direct push to main -> Vercel production deployment -> CI/CD failure after publication
```

## Phase 1 - Protect main and secure publication

- [x] Stop pushing fixes directly to `main`.
- [x] Create a dedicated branch for each correction topic.
- [x] Open a Pull Request targeting `main`.
- [x] Enable a GitHub branch protection rule or ruleset for `main`.
- [x] Require the main CI/CD checks before merge.
- [x] Verify that Vercel only publishes production after a valid merge into `main`.
- [x] Keep Vercel Git Integration active, with production controlled by protected merges into `main`.

### Required checks

- [x] Lint.
- [x] TypeScript.
- [x] Unit tests / coverage.
- [x] Build.
- [x] Pa11y.
- [x] Cypress.
- [x] Lighthouse as a blocking required check for desktop and mobile.

## Phase 2 - Validate the CI/CD flow to Vercel

- [x] Create a test branch.
- [x] Open a Pull Request.
- [x] Verify that the Vercel Preview deployment is created.
- [x] Verify that tests run against the Preview deployment.
- [x] Verify that a test failure blocks the merge.
- [x] Merge only when all required checks are green.
- [x] Confirm that Vercel production updates only after this merge.

## Phase 3 - Fix Lighthouse

- [x] Diagnose the Lighthouse failure on `/user`.
- [x] Replace fragile UI login in Lighthouse with direct API authentication and `sessionStorage` setup.
- [x] Fix Vercel bypass handling so preview-only headers do not break API CORS preflights.
- [x] Replace the fragile CSS-module selector wait with a stable authenticated-page content check.
- [x] Keep professional thresholds as blocking checks for both desktop and mobile.
- [x] Rerun the full workflow successfully.
- [x] Document the expected behavior.

## Phase 4 - Fix username update and Upstash

- [x] Diagnose the `POST /csrf/store` request.
- [x] Diagnose the `PUT /user/profile` request.
- [x] Verify whether the new Flask API implements these routes.
- [x] Fix username updates.
- [x] Update the Flask VPS API CORS configuration to allow Vercel preview browser requests, including `X-CSRF-Token`.
- [x] Clarify the current role of Upstash: replaced by PostgreSQL advisory locks on the Flask VPS — no longer used in the frontend.
- [x] Update the related Cypress tests. (profile.cy.ts covers username update, cancel, and empty submission — CI green)

## Phase 5 - Clean up documentation

- [ ] Update the root README.
- [ ] Update the `P11-ArgentBank` README.
- [ ] Remove or archive obsolete documentation about the former Vercel serverless API when it no longer represents the current architecture.
- [ ] Clearly document the Flask VPS API.
- [ ] Clearly document the Vercel strategy.
- [ ] Clearly document the actual CI/CD strategy.

## Phase 6 - Clarify repository architecture

- [ ] Decide whether the application remains in `P11-ArgentBank/`.
- [ ] If it does, document this choice in the root README and in Vercel.
- [ ] If it does not, prepare a dedicated PR to move the application to the repository root.
- [ ] Verify GitHub Actions, Vercel, Cypress, Pa11y, and Lighthouse paths after the decision.

## Working rules from now on

- [x] One branch per topic.
- [x] One Pull Request per logical correction.
- [x] No direct push to `main` except for an explicit emergency.
- [x] No production deployment without green CI/CD or an explicit, documented decision.
- [x] No Vercel configuration change without checking the CI/CD impact.
- [x] Always distinguish commit, push, merge, preview, and production.

## Current priority order

1. Clean up documentation (Phase 5).
2. Review repository architecture (Phase 6).

## Current validated status

- GitHub ruleset protects `main` with required PRs and required status checks.
- PR validation runs against the Vercel Preview deployment.
- Lighthouse desktop and mobile are blocking checks and now pass on the authenticated `/user` page.
- The Flask VPS API at `https://db.lostintab.com/api` accepts browser requests from Vercel preview origins.
- Username updates now work with the Flask API, including the CSRF flow.
- Legacy Node/Vercel backend removed (`api/`, `prisma/`, `__tests__/api/`, `src/generated/prisma/`). Prisma and Upstash are no longer referenced anywhere in the frontend.
- CI/CD workflows trigger on all branch pushes and are green on `main` after merge of PR #8.
- Vitest coverage thresholds maintained: statements 95 / branches 90 / functions 90 / lines 95.
