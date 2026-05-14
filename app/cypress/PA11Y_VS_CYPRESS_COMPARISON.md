<!-- @format -->

# Technical Comparison: Pa11y vs Cypress in CI/CD

## Pa11y Configuration (Working ✅)

### 1. Environment Installation

```bash
# Install Pa11y and dependencies globally - use full puppeteer with bundled Chrome
npm install -g pa11y@8.0.0 puppeteer@24.10.1

# Configure Puppeteer environment for CI
export PUPPETEER_CACHE_DIR=/home/runner/.cache/puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Install Puppeteer browsers (Chrome)
npx puppeteer browsers install chrome
```

### 2. Vercel Bypass Headers

```javascript
// Add Vercel protection bypass headers
const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
if (bypassSecret) {
  console.log("<<<<< PA11Y AUTH SCRIPT: Setting Vercel bypass headers >>>>>");
  await page.setExtraHTTPHeaders({
    "x-vercel-protection-bypass": bypassSecret,
  });
}
```

### 3. Puppeteer Configuration

```javascript
const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  headless: true,
});

const page = await browser.newPage();
// Headers configured BEFORE navigation
await page.setExtraHTTPHeaders({
  "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
});
```

## Cypress Configuration (Failing ❌)

### 1. Environment Installation

```bash
# Cache Cypress binary
- name: 📦 Cache Cypress binary
  uses: actions/cache@v3
  with:
    path: ~/.cache/Cypress  # Electron, not Chrome

# Install Cypress binary
pnpm exec cypress install  # Installs Electron
```

### 2. Vercel Bypass Headers

```typescript
// ❌ MISSING: No bypass header configuration
// Cypress tries to access URL directly without authentication
cy.visit("/signin"); // Fails in CI/CD
```

### 3. Browser Configuration

```typescript
// Cypress uses Electron by default
// No explicit HTTP header configuration
// baseUrl configured but no authentication
```

## Key Differences

| Aspect             | Pa11y                | Cypress           |
| ------------------ | -------------------- | ----------------- |
| **Browser**        | Chrome via Puppeteer | Electron          |
| **HTTP Headers**   | ✅ Configured        | ❌ Missing        |
| **Environment**    | Explicit variables   | Ignored variables |
| **Authentication** | Before navigation    | Not implemented   |
| **CI/CD Status**   | ✅ Working           | ❌ Failing        |

## Required Solution for Cypress

```typescript
// Add to cypress/support/e2e.ts
beforeEach(() => {
  // Configure bypass headers for CI/CD
  if (Cypress.env("CI") && Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET")) {
    cy.intercept("**", (req) => {
      req.headers["x-vercel-protection-bypass"] = Cypress.env(
        "VERCEL_AUTOMATION_BYPASS_SECRET",
      );
    });
  }
});
```

Date: June 22, 2025
