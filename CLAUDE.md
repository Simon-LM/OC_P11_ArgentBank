# Claude Code notes for this project

General conventions (language policy, workflow rules, stack) live in
`AGENTS.md` at repo root — read that first, it applies here too.

Claude-Code-specific on top of that:

- Do not use the `AskUserQuestion` tool (closed multiple-choice UI) with
  this user — ask any needed clarification in plain conversational text.
- Plan-mode plan files: don't leave the final, user-facing plan only at the
  `~/.claude/plans/...` path outside the repo — copy/write it into the repo
  itself (repo root, tracked-visible in VS Code) so the user can find and
  reference it normally.
- Keep answers short, direct, bulleted where useful.
