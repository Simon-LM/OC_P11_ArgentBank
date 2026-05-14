<!-- @format -->

# Guide de Maintenance des Tests Cypress

This guide provides best practices for maintaining and evolving Cypress tests in the ArgentBank project over the long term.

## 🔄 Cycle de vie des tests E2E

### Quand mettre à jour les tests

- ✅ Lors de changements d'interface utilisateur
- ✅ Lors d'ajout de nouvelles fonctionnalités
- ✅ Lors de modification des flux utilisateur
- ✅ Lors de changements d'API
- ✅ Lors des mises à jour majeures de Cypress

### Signes que les tests ont besoin d'attention

- 🚩 Tests échouant de manière intermittente
- 🚩 Tests prenant trop de temps à s'exécuter
- 🚩 Sélecteurs devenant obsolètes
- 🚩 Parcours utilisateur modifiés
- 🚩 Nouvelles fonctionnalités non couvertes

## 🛠️ Maintenance préventive

### Revue périodique

Planifiez une revue régulière des tests E2E pour :

- Vérifier que tous les parcours utilisateur critiques sont couverts
- Identifier et corriger les sélecteurs fragiles
- Mettre à jour les tests obsolètes
- Optimiser les tests lents

```javascript
// Exemple de sélecteur fragile à remplacer
// ❌ Avant: Sélecteur fragile basé sur la position
cy.get(".account-card").eq(2).find(".view-button").click();

// ✅ Après: Sélecteur robuste basé sur le contenu ou les attributs
cy.findByRole("heading", { name: "Savings Account" })
  .closest('[data-testid="account-card"]')
  .within(() => {
    cy.findByRole("button", { name: /view transactions/i }).click();
  });
```

### Monitoring des performances

Gardez un œil sur les métriques de performance des tests :

```bash
# Ajoutez ce script à package.json
"cy:metrics": "cypress run --reporter cypress-json-reporter && node scripts/analyze-test-metrics.js"
```

```javascript
// scripts/analyze-test-metrics.js
const fs = require("fs");
const path = require("path");

// Lire les rapports de test
const reports = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../cypress/results/results.json")),
);

// Analyser les temps d'exécution
const slowTests = reports.results
  .filter((test) => test.duration > 5000)
  .map((test) => ({
    title: test.title.join(" > "),
    duration: test.duration,
    file: test.file,
  }));

console.log("Tests lents (>5s):", slowTests);

// Analyser les échecs
const flaky = reports.results
  .filter((test) => test.attempts.length > 1)
  .map((test) => ({
    title: test.title.join(" > "),
    attempts: test.attempts.length,
    file: test.file,
  }));

console.log("Tests instables (nécessitant plusieurs tentatives):", flaky);
```

## 🔍 Débogage efficace

### Techniques de débogage

#### Visualisation pas à pas

```javascript
// Ajoutez ces commandes aux endroits critiques
cy.pause(); // Pause l'exécution pour inspection
cy.debug(); // Ouvre la console de débogage
```

#### Capture d'états intermédiaires

```javascript
cy.screenshot("after-login"); // Capture une image

// Capture l'état du DOM à un moment spécifique
cy.document().then((doc) => {
  const html = doc.documentElement.outerHTML;
  cy.writeFile("cypress/debug/dom-state.html", html);
});

// Capture l'état de l'application
cy.window().then((win) => {
  const state = win.store.getState();
  cy.writeFile("cypress/debug/app-state.json", JSON.stringify(state, null, 2));
});
```

### Troubleshooting des problèmes courants

#### Tests instables (flaky)

```javascript
// ❌ Test instable: Attente implicite insuffisante
cy.get(".dynamic-element").click();
cy.get(".result").should("be.visible");

// ✅ Solution: Attente explicite de l'état
cy.get(".dynamic-element").should("be.enabled").click();
cy.get(".result").should("be.visible");
```

#### Attentes appropriées

```javascript
// ❌ Problème: Mauvaise stratégie d'attente
cy.wait(5000); // Attente arbitraire, peu fiable

// ✅ Solution: Attente basée sur l'état
cy.intercept("GET", "/api/accounts").as("getAccounts");
cy.visit("/dashboard");
cy.wait("@getAccounts"); // Attente de la réponse API
cy.findByText("Account Summary").should("be.visible");
```

## 🧪 Refactoring des tests

### Quand refactoriser

- Les tests sont difficiles à lire ou à maintenir
- Du code se répète à travers plusieurs tests
- Les tests sont trop lents
- Trop de dépendances entre les tests

### Stratégies de refactoring

#### Extraction de commandes personnalisées

```javascript
// ❌ Avant: Code répété dans plusieurs tests
it("test one", () => {
  cy.visit("/login");
  cy.findByLabelText("Email").type("user1@example.com");
  cy.findByLabelText("Password").type("password123");
  cy.findByRole("button", { name: /sign in/i }).click();
  cy.url().should("include", "/profile");
});

// ✅ Après: Commande personnalisée
// cypress/support/commands.js
Cypress.Commands.add("loginAndVerify", (email, password) => {
  cy.visit("/login");
  cy.findByLabelText("Email").type(email);
  cy.findByLabelText("Password").type(password);
  cy.findByRole("button", { name: /sign in/i }).click();
  cy.url().should("include", "/profile");
});

// Test simplifié
it("test one", () => {
  cy.loginAndVerify("user1@example.com", "password123");
});
```

#### Modèles de test

Créez des modèles de test pour les scénarios courants :

```javascript
// cypress/support/test-patterns.js
export const accountOperationPattern = ({
  operationType,
  accountType,
  amount,
  expectedBalance,
}) => {
  cy.loginByApi("user@example.com", "password");
  cy.visit("/accounts");

  cy.findByText(accountType)
    .closest('[data-testid="account-card"]')
    .within(() => {
      cy.findByRole("button", { name: new RegExp(operationType, "i") }).click();
    });

  cy.findByLabelText("Amount").type(amount);
  cy.findByRole("button", { name: /confirm/i }).click();

  cy.findByText("Transaction successful").should("be.visible");
  cy.findByText(expectedBalance).should("be.visible");
};

// Dans un test
import { accountOperationPattern } from "../support/test-patterns";

describe("Account operations", () => {
  it("should make a deposit", () => {
    accountOperationPattern({
      operationType: "deposit",
      accountType: "Checking",
      amount: "500",
      expectedBalance: "$2,582.79",
    });
  });

  it("should make a withdrawal", () => {
    accountOperationPattern({
      operationType: "withdraw",
      accountType: "Savings",
      amount: "200",
      expectedBalance: "$10,728.42",
    });
  });
});
```

## 🚀 Evolving the test suite

### Stratégies d'extension

#### Couverture progressive

Priorisez l'ajout de tests en fonction de l'importance business :

1. Parcours critiques pour les utilisateurs
2. Fonctionnalités à fort impact business
3. Zones à risque élevé de régression
4. Fonctionnalités récemment modifiées

#### Tests multi-navigateurs

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Multi-navigateur dans CI uniquement
      if (process.env.CI) {
        // Force tous les tests à s'exécuter sur plusieurs navigateurs
        config.browsers = [
          { name: "chrome", family: "chromium" },
          { name: "firefox", family: "firefox" },
          { name: "edge", family: "chromium" },
        ];
      }
      return config;
    },
  },
});
```

```json
// package.json
{
  "scripts": {
    "cy:chrome": "cypress run --browser chrome",
    "cy:firefox": "cypress run --browser firefox",
    "cy:edge": "cypress run --browser edge",
    "cy:all-browsers": "npm run cy:chrome && npm run cy:firefox && npm run cy:edge"
  }
}
```

### Tests avancés

#### Tests de performance

```javascript
// Mesure du temps de chargement
cy.visit("/dashboard", {
  onBeforeLoad: (win) => {
    win.performance.mark("start-loading");
  },
  onLoad: (win) => {
    win.performance.mark("end-loading");
    win.performance.measure("page-load", "start-loading", "end-loading");
  },
}).then(() => {
  cy.window().then((win) => {
    const measure = win.performance.getEntriesByName("page-load")[0];
    cy.task("log", `Dashboard loaded in ${measure.duration}ms`);
    expect(measure.duration).to.be.lessThan(3000); // <3s
  });
});
```

#### Tests d'accessibilité avancés

```javascript
// Test d'accessibilité avec règles personnalisées
cy.visit("/login");
cy.injectAxe();
cy.checkA11y(null, {
  rules: {
    "color-contrast": { enabled: true },
    "heading-order": { enabled: true },
    label: { enabled: true },
  },
});

// Vérification de la navigation au clavier
cy.visit("/login");
cy.findByLabelText("Email").type("user@example.com");
cy.findByLabelText("Password").type("password123{tab}");
cy.focused().should("have.attr", "type", "submit");
cy.focused().type("{enter}");
cy.url().should("include", "/profile");
```

## 📊 Métriques et KPIs

### Métriques à suivre

- **Taux de succès** : % de tests réussis dans chaque exécution
- **Stabilité** : % de tests échouant de manière intermittente
- **Temps d'exécution** : Durée totale et moyenne par test
- **Couverture fonctionnelle** : % de fonctionnalités couvertes
- **Couverture des parcours critiques** : % de parcours business critiques couverts

### Tableau de bord de suivi

```javascript
// scripts/generate-test-dashboard.js
const fs = require("fs");
const path = require("path");

// Lire les rapports de test des dernières exécutions
const getReportData = () => {
  const reportsDir = path.join(__dirname, "../cypress/reports/historical");
  const files = fs.readdirSync(reportsDir).filter((f) => f.endsWith(".json"));

  return files.map((file) => {
    const data = JSON.parse(fs.readFileSync(path.join(reportsDir, file)));
    return {
      date: file.replace(".json", ""),
      totalTests: data.results.length,
      passed: data.results.filter((r) => r.state === "passed").length,
      failed: data.results.filter((r) => r.state === "failed").length,
      flaky: data.results.filter((r) => r.attempts.length > 1).length,
      duration: data.results.reduce((sum, r) => sum + r.duration, 0) / 1000,
    };
  });
};

// Générer un rapport HTML
const generateDashboard = (data) => {
  // Logique de génération de tableau de bord
  // ...
  const dashboardHtml = `<html><body>Dashboard content based on data</body></html>`; // Placeholder
  fs.writeFileSync(
    path.join(__dirname, "../cypress/reports/dashboard.html"),
    dashboardHtml,
  );
};

const data = getReportData();
generateDashboard(data);
```

## 🔁 Intégration continue

### Configuration avancée pour CI

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
    strategy:
      # Continue les autres tests même si un échoue
      fail-fast: false
      matrix:
        # Exécuter des groupes de tests en parallèle
        containers: [1, 2, 3, 4]
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
          record: true
          parallel: true
          group: "UI Tests"
          tag: ${{ github.event_name }}
          spec: "cypress/e2e/**/*.cy.js"
        env:
          # Pass CI variables
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SPLIT: ${{ strategy.job-total }}
          SPLIT_INDEX: ${{ strategy.job-index }}

      - name: Upload screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots-${{ matrix.containers }}
          path: cypress/screenshots
```

### Notification et alertes

```yaml
# Ajouter à votre workflow CI
- name: Notify on failure
  if: failure()
  uses: rtCamp/action-slack-notify@v2
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
    SLACK_CHANNEL: test-alerts
    SLACK_COLOR: danger
    SLACK_TITLE: "E2E Tests Failed"
    SLACK_MESSAGE: |
      Cypress tests failed in branch ${{ github.ref_name }}
      See details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
```

## 📖 Documentation

### Documentation des tests

Documentez chaque test avec des commentaires clairs :

```javascript
/**
 * Test suite pour le processus d'authentification
 * Couvre: connexion, déconnexion, et gestion d'erreurs
 * Dépendances: aucun serveur mock nécessaire, utilise l'API réelle
 */
describe("Authentication", () => {
  /**
   * Test de connexion réussie
   * Scénario: L'utilisateur entre des identifiants valides et est redirigé
   * Données: Utilise le compte 'tony@stark.com' (voir fixtures/users.json)
   */
  it("should login with valid credentials", () => {
    // ...test code
  });
});
```

### Système de revue de code

Établissez une checklist pour la revue des tests E2E :

```markdown
## Checklist de revue des tests E2E

### Structure et lisibilité

- [ ] Les tests suivent la structure Arrange-Act-Assert
- [ ] Noms de tests descriptifs et clairs
- [ ] Commentaires explicatifs pour la logique complexe

### Robustesse

- [ ] Sélecteurs stables (préférant findBy... ou data-testid)
- [ ] Attentes appropriées (pas de timeouts arbitraires)
- [ ] Isolation des tests (pas de dépendances entre tests)

### Performance

- [ ] Temps d'exécution raisonnable (<30s par test)
- [ ] Utilisation appropriée des API pour la préparation

### Valeur business

- [ ] Test couvrant un scénario utilisateur significatif
- [ ] Assertions vérifiables validant le comportement attendu
```

## 🔄 Mise à jour de Cypress

### Processus de mise à jour

1. **Planification** : Consultez les notes de version pour les changements
2. **Mise à jour dans une branche** : Testez les changements isolément
3. **Corrections** : Adaptez les tests aux changements d'API
4. **Validation** : Exécutez la suite complète avant de fusionner

```bash
# Mise à jour de Cypress
pnpm update cypress@latest

# Exécution d'un test de smoke pour vérifier la compatibilité
pnpm cypress run --spec "cypress/e2e/smoke/**/*.cy.js"

# Si tout va bien, exécuter la suite complète
pnpm cypress run
```

### Adaptation aux changements d'API

```javascript
// Exemple d'adaptation à un changement d'API de Cypress
// Pour la version 10+, la migration de cy.server() et cy.route()
// vers cy.intercept()

// ❌ Ancienne méthode (Cypress <10)
cy.server();
cy.route("GET", "/api/users", "fixture:users.json").as("getUsers");
cy.route("POST", "/api/login", "fixture:login-success.json").as("login");

// ✅ Nouvelle méthode (Cypress 10+)
cy.intercept("GET", "/api/users", { fixture: "users.json" }).as("getUsers");
cy.intercept("POST", "/api/login", { fixture: "login-success.json" }).as(
  "login",
);
```

## 📝 Ressources complémentaires

- [Documentation officielle de maintenance Cypress](https://docs.cypress.io/guides/guides/test-maintenance)
- [Stratégies de débogage Cypress](https://docs.cypress.io/guides/guides/debugging)
- [Meilleures pratiques pour tests stables](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) (Exemple complet)

---

**Navigation** : [README](./README.md) | [Installation](./INSTALLATION.md) | [Tests E2E](./E2E_TESTS.md) | [Meilleures pratiques](./BEST_PRACTICES.md)
