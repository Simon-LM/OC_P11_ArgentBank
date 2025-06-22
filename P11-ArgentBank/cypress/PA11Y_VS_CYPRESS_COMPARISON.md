<!-- @format -->

# Comparaison technique : Pa11y vs Cypress en CI/CD

## Configuration Pa11y (Fonctionne ✅)

### 1. Installation d'environnement

```bash
# Install Pa11y and dependencies globally - use full puppeteer with bundled Chrome
npm install -g pa11y@8.0.0 puppeteer@24.10.1

# Configure Puppeteer environment for CI
export PUPPETEER_CACHE_DIR=/home/runner/.cache/puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Install Puppeteer browsers (Chrome)
npx puppeteer browsers install chrome
```

### 2. Headers de bypass Vercel

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

### 3. Configuration Puppeteer

```javascript
const browser = await puppeteer.launch({
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  headless: true,
});

const page = await browser.newPage();
// Headers configurés AVANT navigation
await page.setExtraHTTPHeaders({
  "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
});
```

## Configuration Cypress (Échoue ❌)

### 1. Installation d'environnement

```bash
# Cache Cypress binary
- name: 📦 Cache Cypress binary
  uses: actions/cache@v3
  with:
    path: ~/.cache/Cypress  # Electron, pas Chrome

# Install Cypress binary
pnpm exec cypress install  # Installe Electron
```

### 2. Headers de bypass Vercel

```typescript
// ❌ MANQUANT : Pas de configuration des headers de bypass
// Cypress essaie d'accéder directement à l'URL sans authentification
cy.visit("/signin"); // Échoue en CI/CD
```

### 3. Configuration navigateur

```typescript
// Cypress utilise Electron par défaut
// Pas de configuration explicite des headers HTTP
// baseUrl configurée mais pas d'authentification
```

## Différences clés

| Aspect             | Pa11y                | Cypress            |
| ------------------ | -------------------- | ------------------ |
| **Navigateur**     | Chrome via Puppeteer | Electron           |
| **Headers HTTP**   | ✅ Configurés        | ❌ Manquants       |
| **Environnement**  | Variables explicites | Variables ignorées |
| **Authentication** | Avant navigation     | Pas implémentée    |
| **CI/CD Status**   | ✅ Fonctionne        | ❌ Échoue          |

## Solution requise pour Cypress

```typescript
// Ajouter dans cypress/support/e2e.ts
beforeEach(() => {
  // Configurer les headers de bypass pour CI/CD
  if (Cypress.env("CI") && Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET")) {
    cy.intercept("**", (req) => {
      req.headers["x-vercel-protection-bypass"] = Cypress.env(
        "VERCEL_AUTOMATION_BYPASS_SECRET",
      );
    });
  }
});
```

Date : 22 juin 2025
