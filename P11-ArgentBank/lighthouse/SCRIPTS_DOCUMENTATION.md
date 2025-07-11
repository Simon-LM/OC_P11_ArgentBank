<!-- @format -->

# Lighthouse Scripts Documentation

## 📁 **Scripts structure and roles**

### `/scripts/` - Execution scripts

| Script                     | Role                                       | Recommended usage                     |
| -------------------------- | ------------------------------------------ | ------------------------------------- |
| `lighthouse-test-suite.js` | Complete suite of 6 tests (mobile/desktop) | Full tests before deployment          |
| `lighthouse-runner.js`     | Main runner with auth management           | Individual page tests                 |
| `lighthouse-auth-v2.js`    | Test with automatic authentication         | Protected pages tests                 |
| `lighthouse-analyzer.js`   | Analysis of generated JSON reports         | Post-test analysis and comparisons    |
| `lighthouse-regression.js` | Performance regression detection           | CI/CD tests and continuous validation |

### `/lib/` - Utility libraries

| File                     | Function                            | Dependencies |
| ------------------------ | ----------------------------------- | ------------ |
| `analyzer.js`            | Analysis and parsing of reports     | None         |
| `auth-v2.js`             | Puppeteer authentication management | puppeteer    |
| `regression.js`          | Baseline comparison                 | analyzer.js  |
| `analyze-performance.js` | Detailed performance metrics        | None         |

### `/config/` - Configuration

| File                      | Purpose                         | Modification             |
| ------------------------- | ------------------------------- | ------------------------ |
| `lighthouse.config.js`    | Custom Lighthouse configuration | Rarely                   |
| `lighthouse-ci.config.js` | CI/CD configuration             | According to environment |

### Utility scripts (root)

| Script               | Usage                 | Frequency |
| -------------------- | --------------------- | --------- |
| `run.sh`             | Quick test launch     | Daily     |
| `clean.sh`           | Old reports cleanup   | Weekly    |
| `migrate-reports.sh` | Migration to archive/ | Monthly   |

## 🎯 **Usage recommendations**

### Daily tests (development)

```bash
# Quick test during development
./run.sh quick

# Complete test before commit
pnpm test:suite
```

### Validation tests (CI/CD)

```bash
# Regression detection
pnpm test:regression

# Complete validation
pnpm test:ci
```

### Periodic maintenance

```bash
# Weekly cleanup
./clean.sh

# Monthly archiving
./migrate-reports.sh
```
