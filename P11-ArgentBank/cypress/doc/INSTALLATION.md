<!-- @format -->

# Cypress Installation and Configuration Guide

This guide explains how to install, configure, and get started with Cypress for E2E testing in the ArgentBank project.

## 🚀 Installation

### Prerequisites

- Node.js (version 14.x or higher)
- npm or pnpm (we use pnpm in this project)
- Functional ArgentBank project

### Cypress Installation

```bash
# Add Cypress as a development dependency
pnpm add cypress @testing-library/cypress --save-dev

# Initialize Cypress (creates directory structure)
pnpm cypress open
```

## ⚙️ Basic Configuration

### Directory Structure

After initialization, Cypress will create the following structure:

```
cypress/
├── e2e/               # E2E tests
├── fixtures/          # Test data
├── support/           # Helpers and custom commands
│   ├── commands.js    # Custom commands
│   └── e2e.js         # Global configuration
└── downloads/         # Files downloaded during tests
```

### Basic Configuration (cypress.config.js)

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // Application base URL
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Disable video recording by default
    screenshotOnRunFailure: true,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Node event hooks
    },
  },
});
```

## 🔌 Testing Library Integration

For a more ergonomic testing experience, we integrate Testing Library:

### Configuration in support/commands.js

```javascript
// cypress/support/commands.js
import "@testing-library/cypress/add-commands";

// Additional custom commands
Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.findByLabelText("Email").type(username);
  cy.findByLabelText("Password").type(password);
  cy.findByRole("button", { name: /sign in/i }).click();
});
```

## 🔧 Advanced Configuration

### Multiple Environments

To test on different environments (development, staging, production):

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env: {
      apiUrl: "http://localhost:3001/api/v1",
    },
    setupNodeEvents(on, config) {
      // Configuration modification based on environment
      const environment = config.env.environment || "development";

      // Load environment-specific variables
      config.env = {
        ...config.env,
        ...(environment === "production"
          ? { apiUrl: "https://argentbank-api.example.com/api/v1" }
          : {}),
      };

      return config;
    },
  },
});
```

### Session Management

```javascript
// cypress/support/e2e.js
beforeEach(() => {
  // Restore cookies between tests to maintain session
  cy.restoreLocalStorage();
});

afterEach(() => {
  // Save cookies after each test
  cy.saveLocalStorage();
});

// Commands to save/restore localStorage
Cypress.Commands.add("saveLocalStorage", () => {
  cy.window().then((win) => {
    Object.keys(win.localStorage).forEach((key) => {
      cy.setLocalStorage(key, win.localStorage[key]);
    });
  });
});

Cypress.Commands.add("restoreLocalStorage", () => {
  cy.getLocalStorageSnapshot().then((snapshot) => {
    Object.keys(snapshot).forEach((key) => {
      cy.setLocalStorage(key, snapshot[key]);
    });
  });
});
```

## 🔗 CI/CD Integration

### GitHub Actions Configuration

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          npm install -g pnpm
          pnpm install

      - name: Start dev server in background
        run: pnpm dev & npx wait-on http://localhost:5173

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          wait-on: "http://localhost:5173"
          browser: chrome
          headed: false
```

## 🧪 Exécution des tests

### Commandes de base

```bash
# Ouvrir l'interface Cypress
pnpm cypress open

# Exécuter tous les tests en mode headless
pnpm cypress run

# Exécuter un fichier de test spécifique
pnpm cypress run --spec "cypress/e2e/auth/login.cy.js"

# Exécuter sur un navigateur spécifique
pnpm cypress run --browser chrome
```

### Integration with npm scripts

Ajoutez ces scripts dans votre `package.json` :

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:run:chrome": "cypress run --browser chrome",
    "cy:run:firefox": "cypress run --browser firefox",
    "test:e2e": "start-server-and-test dev http://localhost:5173 cy:run"
  }
}
```

## 🔍 Débogage

### Conseils pour le débogage

1. **Visualiser les étapes** : Utilisez `cy.pause()` pour arrêter l'exécution et inspecter l'état

   ```javascript
   cy.visit("/login");
   cy.pause(); // Pause l'exécution ici
   cy.findByLabelText("Email").type("user@example.com");
   ```

2. **Journal de débogage** : Utilisez `cy.log()` pour ajouter des messages au journal

   ```javascript
   cy.log("Tentative de connexion avec:", username);
   cy.findByLabelText("Email").type(username);
   ```

3. **Accès à l'application** : Utilisez `cy.window()` pour accéder à l'objet window
   ```javascript
   cy.window().then((win) => {
     console.log("État Redux :", win.store.getState());
   });
   ```

## 📝 Ressources complémentaires

- [Documentation officielle Cypress](https://docs.cypress.io/)
- [Documentation Testing Library pour Cypress](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Meilleures pratiques Cypress](https://docs.cypress.io/guides/references/best-practices)

---

**Navigation** : [README](./README.md) | [Meilleures pratiques](./BEST_PRACTICES.md) | [Tests E2E](./E2E_TESTS.md)
