<!-- @format -->

# Guide d'Installation et Configuration de Cypress

Ce guide explique comment installer, configurer et démarrer avec Cypress pour les tests E2E dans le projet ArgentBank.

## 🚀 Installation

### Prérequis

- Node.js (version 14.x ou supérieure)
- npm ou pnpm (nous utilisons pnpm dans ce projet)
- Projet ArgentBank fonctionnel

### Installation de Cypress

```bash
# Ajouter Cypress comme dépendance de développement
pnpm add cypress @testing-library/cypress --save-dev

# Initialiser Cypress (crée la structure de répertoire)
pnpm cypress open
```

## ⚙️ Configuration de base

### Structure de répertoire

Après l'initialisation, Cypress créera la structure suivante :

```
cypress/
├── e2e/               # Tests E2E
├── fixtures/          # Données de test
├── support/           # Helpers et commandes personnalisées
│   ├── commands.js    # Commandes personnalisées
│   └── e2e.js         # Configuration globale
└── downloads/         # Fichiers téléchargés pendant les tests
```

### Configuration de base (cypress.config.js)

```javascript
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // URL de base de l'application
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false, // Désactiver l'enregistrement vidéo par défaut
    screenshotOnRunFailure: true,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Hooks d'événements de Node
    },
  },
});
```

## 🔌 Intégration avec Testing Library

Pour une expérience de test plus ergonomique, nous intégrons Testing Library :

### Configuration dans support/commands.js

```javascript
// cypress/support/commands.js
import "@testing-library/cypress/add-commands";

// Commandes personnalisées supplémentaires
Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.findByLabelText("Email").type(username);
  cy.findByLabelText("Password").type(password);
  cy.findByRole("button", { name: /sign in/i }).click();
});
```

## 🔧 Configuration avancée

### Environnements multiples

Pour tester sur différents environnements (développement, staging, production) :

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    env: {
      apiUrl: "http://localhost:3001/api/v1",
    },
    setupNodeEvents(on, config) {
      // Modification de la configuration en fonction de l'environnement
      const environment = config.env.environment || "development";

      // Charger les variables d'environnement spécifiques
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

### Gestion des connexions

```javascript
// cypress/support/e2e.js
beforeEach(() => {
  // Restaurer les cookies entre les tests pour maintenir la session
  cy.restoreLocalStorage();
});

afterEach(() => {
  // Sauvegarder les cookies après chaque test
  cy.saveLocalStorage();
});

// Commandes pour sauvegarder/restaurer le localStorage
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

## 🔗 Intégration CI/CD

### Configuration pour GitHub Actions

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

### Intégration avec npm scripts

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
