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

- [ ] Stop pushing fixes directly to `main`.
- [ ] Create a dedicated branch for each correction topic.
- [ ] Open a Pull Request targeting `main`.
- [ ] Enable a GitHub branch protection rule or ruleset for `main`.
- [ ] Require the main CI/CD checks before merge.
- [ ] Verify that Vercel only publishes production after a valid merge into `main`.
- [ ] Decide whether Vercel Git Integration remains active or whether production should be controlled only by GitHub Actions.

### Required checks

- [ ] Lint.
- [ ] TypeScript.
- [ ] Unit tests / coverage.
- [ ] Build.
- [ ] Pa11y.
- [ ] Cypress.
- [ ] Lighthouse, at least as an explicit gate: blocking or documented warning.

## Phase 2 - Validate the CI/CD flow to Vercel

- [ ] Create a test branch.
- [ ] Open a Pull Request.
- [ ] Verify that the Vercel Preview deployment is created.
- [ ] Verify that tests run against the Preview deployment.
- [ ] Verify that a test failure blocks the merge.
- [ ] Merge only when all required checks are green.
- [ ] Confirm that Vercel production updates only after this merge.

## Phase 3 - Fix Lighthouse

- [ ] Diagnose the Lighthouse failure on `/user`.
- [ ] Align Lighthouse authentication with the SPA wait strategy already used by Pa11y.
- [ ] Decide professional thresholds: blocking checks or warnings.
- [ ] Rerun the full workflow.
- [ ] Document the expected behavior.

## Phase 4 - Fix username update and Upstash

- [ ] Diagnose the `POST /csrf/store` request.
- [ ] Diagnose the `PUT /user/profile` request.
- [ ] Verify whether the new Flask API implements these routes.
- [ ] Fix username updates.
- [ ] Clarify the current role of Upstash: still used, replaced, or removable.
- [ ] Update the related Cypress tests.

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

- [ ] One branch per topic.
- [ ] One Pull Request per logical correction.
- [ ] No direct push to `main` except for an explicit emergency.
- [ ] No production deployment without green CI/CD or an explicit, documented decision.
- [ ] No Vercel configuration change without checking the CI/CD impact.
- [ ] Always distinguish commit, push, merge, preview, and production.

## Current priority order

1. Protect `main` and secure Vercel publication.
2. Verify that the PR -> CI/CD -> Vercel flow works.
3. Fix Lighthouse.
4. Fix username updates and the Upstash topic.
5. Clean up documentation.
6. Review repository architecture.
