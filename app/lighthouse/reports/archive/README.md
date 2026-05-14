<!-- @format -->

# Lighthouse Report Archives

This folder contains archives of old Lighthouse reports organized by date. Reports are automatically archived when they are more than 7 days old.

## Latest archiving

**Date:** 2025-05-27  
**Archived reports:** 7 files from 2025-05-26  
**Action:** Manual archiving of 2025-05-26 reports after validation of new 2025-05-27 reports

### Archived reports (2025-05-26)

- accueil---desktop-2025-05-26_16-40-38.html
- accueil---mobile-2025-05-26_16-40-38.html
- connexion---desktop-2025-05-26_16-40-38.html
- connexion---mobile-2025-05-26_16-40-38.html
- index-2025-05-26_16-40-38.html
- profil---desktop-2025-05-26_16-40-38.html
- profil---mobile-2025-05-26_16-40-38.html

## Structure

```plaintext
archive/
├── YYYY-MM-DD/        # Report generation date
│   ├── lighthouse-*.html  # HTML reports by date
│   └── lighthouse-*.json  # JSON data by date
├── ...                # Other dates
```

## Usage

To manually archive old reports:

```bash
# From the lighthouse folder
pnpm archive
```

Or directly:

```bash
./clean.sh --archive
```

## Data retention

Archives are kept to:

- Track performance evolution over time
- Compare measurements between different versions
- Document improvements made to the application

Archived reports are not deleted during standard report cleanup.
