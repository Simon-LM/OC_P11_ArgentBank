# Project conventions (for any AI coding agent)

This file applies regardless of which AI agent is working on this repo. If
you're using Claude Code specifically, also read `CLAUDE.md` at repo root
for a couple of tool-specific notes.

## Language

- **English**: code comments, all documentation (README, TODO.md, in-repo
  `*.md` files, this file), commit messages, PR titles/descriptions.
- **French**: fine for interactive conversation with the project owner, but
  nothing conversational gets persisted — anything committed or written to
  a file in this repo follows the English rule above, no exceptions.
- Don't proactively retranslate pre-existing content that predates this
  rule; fix it only where you're already touching that file for another
  reason, or if asked to sweep it.

## Workflow

- Never commit directly to `main` — branch, open a PR, wait for explicit
  merge approval. A "commit" means commit *and* push; never leave one
  local-only.
- Never lower a CI gate (coverage thresholds, Lighthouse scores, etc.) to
  make it pass — fix the underlying issue, or use a targeted, documented
  mechanism (e.g. `skipAudits` for a structurally-unsatisfiable audit).
- Never brute-force-reproduce a flaky test via repeated local reruns —
  root-cause it by reading the code, verify once locally, then trust CI.
- Keep `TODO.md` (repo root) up to date as the real, persistent to-do list.
- Shared planning docs (anything the project owner needs to review/approve)
  live in this repo, not in an agent-private directory outside it — so they
  show up in the normal VS Code file tree.
- Keep two kinds of "open question" docs separate, don't merge them:
  project-side decisions the human owner has to make (e.g.
  `QUESTIONS_FOR_SIMON.md`) vs. feedback for a separate package/repo this
  project depends on (e.g. `DARKMODE_PLUS_A11Y_FEEDBACK.md`) — different
  audiences, different files. Update them as items are found rather than
  saving them up.

## Stack

Vite 8 (Rolldown) + React 19 + TypeScript + Redux Toolkit +
react-router-dom v7, SCSS/BEM (no Tailwind), pnpm. Full CI/CD via GitHub
Actions with 5 required status checks on `main` (squash-merge only) — see
`app/CI-CD-DOCUMENTATION.md`.
