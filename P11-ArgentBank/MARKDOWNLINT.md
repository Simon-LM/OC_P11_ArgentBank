<!-- @format -->

# Markdownlint Configuration

This file configures markdownlint rules for the ArgentBank project.

## Disabled Rules

The following rules have been disabled because they do not pose problems on GitHub and can sometimes be too restrictive:

- **MD010**: Tabs in code (acceptable with modern tools)
- **MD013**: Line length (acceptable on GitHub with horizontal scrolling)
- **MD022**: Blank lines around headings (not critical for GitHub, can be too restrictive)
- **MD024**: Duplicate headings (acceptable in different sections)
- **MD026**: Punctuation in headings (":" are common and acceptable)
- **MD031**: Blank lines around code blocks (not critical for readability)
- **MD032**: Blank lines around lists (not critical for GitHub)
- **MD034**: Bare URLs in tables (acceptable on GitHub, clickable links)
- **MD036**: Emphasis used as heading (acceptable in certain contexts)
- **MD037**: Spaces in emphasis markers (well handled by GitHub)
- **MD040**: Language of code blocks (not always necessary)
- **MD041**: First line must be H1 heading (not always required)

## Preserved Rules

All other markdownlint rules remain active to maintain documentation quality and consistency.

## Usage

```bash
# Check all markdown files
npx markdownlint "**/*.md" --ignore node_modules

# Check a specific file
npx markdownlint README.md
```
