<!-- @format -->

# Plan d'intégration de Cypress dans ArgentBank

Ce document présente une stratégie pour l'intégration de Cypress comme outil de tests end-to-end (E2E) dans le projet ArgentBank, en complément des tests unitaires et d'intégration existants avec Vitest.

## 📋 Vue d'ensemble

### Positionnement dans la stratégie de test

```
                    ┌─────────────────┐
                    │   Tests E2E     │
                    │    (Cypress)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │Tests d'intégration│
                    │    (Vitest)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Tests unitaires │
                    │     (Vitest)    │
                    └─────────────────┘
```

### Complémentarité avec les tests existants

| Type de test | Outil   | Objectif                                           | Focus                           |
| ------------ | ------- | -------------------------------------------------- | ------------------------------- |
| Unitaire     | Vitest  | Vérifier les fonctions isolées                     | Comportement individuel         |
| Intégration  | Vitest  | Vérifier les interactions entre modules            | Workflows internes              |
| E2E          | Cypress | Vérifier l'application du point de vue utilisateur | Expérience utilisateur complète |

## 🛠️ Installation et configuration

### Installation de Cypress

```bash
# Installer Cypress comme dépendance de développement
pnpm add -D cypress

# Installer les plugins recommandés
pnpm add -D @testing-library/cypress cypress-axe cypress-real-events
```

### Structure de dossiers proposée

```
cypress/
├── e2e/                      # Tests E2E organisés par fonctionnalité
│   ├── auth/
│   │   ├── login.cy.js
│   │   └── logout.cy.js
│   ├── accounts/
│   │   ├── view-accounts.cy.js
│   │   └── account-details.cy.js
│   └── transactions/
│       ├── search.cy.js
│       └── filtering.cy.js
├── fixtures/                 # Données de test
│   ├── users.json
│   ├── accounts.json
│   └── transactions.json
├── support/                  # Helpers et commandes personnalisées
│   ├── commands.js
│   ├── auth-commands.js
│   ├── e2e.js
│   └── component.js
└── components/               # Tests de composants isolés (optionnel)
    ├── Button.cy.js
    └── TransactionTable.cy.js
```

### Configuration de base

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
	e2e: {
		baseUrl: "http://localhost:5173",
		specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		viewportWidth: 1280,
		viewportHeight: 720,
		video: false,
		screenshotOnRunFailure: true,
		experimentalRunAllSpecs: true,
	},
	component: {
		devServer: {
			framework: "react",
			bundler: "vite",
		},
		specPattern: "cypress/components/**/*.cy.{js,jsx,ts,tsx}",
	},
	env: {
		apiUrl: "http://localhost:3001/api/v1",
	},
});
```

## 🧪 Stratégie de test

### Scénarios prioritaires

1. **Authentification**

   - Connexion réussie
   - Échecs de connexion (identifiants incorrects)
   - Déconnexion
   - Persistance de session

2. **Gestion de profil**

   - Visualisation des informations de profil
   - Modification du nom d'utilisateur
   - Validation des formulaires

3. **Comptes bancaires**

   - Affichage de la liste des comptes
   - Sélection d'un compte
   - Vérification des soldes

4. **Transactions**
   - Recherche de transactions
   - Filtrage par date/montant/catégorie
   - Pagination
   - Affichage des détails

### Approche basée sur les parcours utilisateurs

Pour chaque fonctionnalité, structurer les tests selon les parcours utilisateurs typiques :

```javascript
// cypress/e2e/auth/login.cy.js
describe("Login Process", () => {
	beforeEach(() => {
		cy.visit("/signin");
	});

	it("allows a user to log in successfully", () => {
		cy.fixture("users").then((users) => {
			const user = users[0];
			cy.get("[data-testid=email-input]").type(user.email);
			cy.get("[data-testid=password-input]").type(user.password);
			cy.get("[data-testid=login-button]").click();

			cy.url().should("include", "/user");
			cy.get("[data-testid=user-greeting]").should(
				"contain",
				`${user.firstName} ${user.lastName}`
			);
		});
	});

	it("shows error message with incorrect credentials", () => {
		cy.get("[data-testid=email-input]").type("wrong@example.com");
		cy.get("[data-testid=password-input]").type("wrongpassword");
		cy.get("[data-testid=login-button]").click();

		cy.get("[data-testid=error-message]")
			.should("be.visible")
			.and("contain", "Invalid credentials");
	});
});
```

## 🔄 Intégration avec le reste de la suite de tests

### Scripts dans package.json

```json
{
	"scripts": {
		"cypress:open": "cypress open",
		"cypress:run": "cypress run",
		"test:e2e": "cypress run",
		"test:e2e:headed": "cypress run --headed",
		"test:all": "pnpm test && pnpm test:e2e"
	}
}
```

### Intégration CI/CD

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

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
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Build app
        run: pnpm build

      - name: Start server
        run: pnpm preview &

      - name: Run Cypress tests
        uses: cypress-io/github-action@v6
        with:
          browser: chrome
          record: true
        env:
          CYPRESS_RECORD_KEY: ${{ secrets.CYPRESS_RECORD_KEY }}
```

## 🧠 Bonnes pratiques

### Structure des tests

```javascript
// Pattern recommandé
describe("Feature: Component or Page", () => {
	beforeEach(() => {
		// Setup commun (navigation, authentification)
	});

	context("Given a certain state", () => {
		beforeEach(() => {
			// Setup spécifique au contexte
		});

		it("should behave as expected when action performed", () => {
			// Arrange (préparation spécifique au test)
			// Act (actions utilisateur)
			// Assert (vérifications)
		});
	});
});
```

### Commandes personnalisées

```javascript
// cypress/support/auth-commands.js
Cypress.Commands.add("login", (email, password) => {
	cy.session([email, password], () => {
		cy.visit("/signin");
		cy.get("[data-testid=email-input]").type(email);
		cy.get("[data-testid=password-input]").type(password);
		cy.get("[data-testid=login-button]").click();
		cy.url().should("include", "/user");
	});
});

// Usage
cy.login("tony@stark.com", "password123");
```

### Gestion des données de test

```javascript
// cypress/fixtures/users.json
[
	{
		id: "1",
		email: "tony@stark.com",
		password: "password123",
		firstName: "Tony",
		lastName: "Stark",
		userName: "Iron",
	},
	{
		id: "2",
		email: "steve@rogers.com",
		password: "password456",
		firstName: "Steve",
		lastName: "Rogers",
		userName: "Cap",
	},
];

// Usage
cy.fixture("users").then((users) => {
	const testUser = users[0];
	cy.login(testUser.email, testUser.password);
});
```

## ♿ Tests d'accessibilité intégrés - IMPLÉMENTÉS ✅

### Statut d'implémentation

✅ **TERMINÉ** - Tests d'accessibilité avec `cypress-axe` intégrés dans toute l'application ArgentBank.

**Couverture actuelle :**

- 🔐 **Authentification** : 5 tests (login, logout)
- 👤 **Profil utilisateur** : 8 tests (affichage, édition)
- 🏦 **Comptes bancaires** : 3 tests (liste, sélection)
- 💳 **Transactions** : 6 tests (tableau, pagination, recherche)

**Total : 22 tests E2E avec vérifications d'accessibilité WCAG 2.1 AA**

### Configuration implémentée

```typescript
// cypress/support/e2e.ts
import "cypress-axe";

// Pattern d'utilisation dans tous les tests
it("devrait être accessible", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});
});
```

### Scripts disponibles

```bash
# Tests E2E avec accessibilité
pnpm run test:e2e:a11y

# Tests avec rapports consolidés
pnpm run test:e2e:a11y:report

# Nettoyage des rapports
pnpm run test:e2e:clean
```

### 📚 Documentation complète

| Document                                                      | Objectif                 | Public cible |
| ------------------------------------------------------------- | ------------------------ | ------------ |
| **[Guide Technique Complet](./doc/ACCESSIBILITY_TESTS.md)**   | Implémentation détaillée | Développeurs |
| **[Meilleures Pratiques](./doc/BEST_PRACTICES.md)**           | Standards et patterns    | Équipe tech  |
| **[Guide TypeScript](./doc/TYPESCRIPT_GUIDE.md)**             | Types et interfaces      | Développeurs |
| **[Tests E2E + Accessibilité](./doc/E2E_TESTS.md)**           | Guide intégré            | Tous         |
| **[Statut d'Implémentation](./doc/IMPLEMENTATION_STATUS.md)** | Rapport final            | Management   |

## 📊 Stratégie de reporting

### Rapports détaillés

```bash
# Installation de Mochawesome pour des rapports améliorés
pnpm add -D cypress-mochawesome-reporter

# Configuration dans cypress.config.js
module.exports = defineConfig({
  e2e: {
    // Autres configurations...
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'ArgentBank E2E Tests',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
  },
});
```

### Dashboard Cypress (optionnel)

```bash
# Configuration du projet pour le dashboard
npx cypress open --project-id <your-project-id>
```

## 🚀 Plan de mise en œuvre

### Phase 1 : Installation et configuration

1. Installer Cypress et les plugins
2. Configurer l'environnement de base
3. Créer la structure de dossiers
4. Ajouter les scripts npm

### Phase 2 : Premiers tests critiques

1. Implémenter les tests d'authentification
2. Implémenter les tests de profil utilisateur
3. Créer les commandes personnalisées pour ces scénarios

### Phase 3 : Expansion

1. Implémenter les tests de comptes et transactions
2. Ajouter les tests d'accessibilité
3. Intégrer au pipeline CI

### Phase 4 : Optimisation

1. Analyser les performances des tests
2. Optimiser les tests lents
3. Améliorer les rapports

## 📝 Documentation

### README.md pour Cypress

Créer un fichier README.md dans le dossier Cypress :

````markdown
# Tests E2E Cypress - ArgentBank

## 🚀 Démarrage rapide

```bash
# Ouvrir l'interface Cypress
pnpm cypress:open

# Exécuter tous les tests en mode headless
pnpm test:e2e
```
````

## 📂 Organisation

- `e2e/` - Tests par fonctionnalité
- `fixtures/` - Données de test
- `support/` - Commandes personnalisées

## 🔍 Commandes personnalisées

- `cy.login(email, password)` - Se connecter
- `cy.checkAccount(accountId)` - Vérifier les détails d'un compte
- `cy.searchTransactions(criteria)` - Rechercher des transactions

```

---

Ce plan fournit une base solide pour l'intégration de Cypress dans le projet ArgentBank, complémentant ainsi les tests Vitest existants pour une couverture de test complète.

## 📚 Documentation Complète

### 🎯 Guides Principaux
- **[Tests E2E](./doc/E2E_TESTS.md)** - Guide complet des tests end-to-end avec exemples
- **[Tests d'Accessibilité](./doc/ACCESSIBILITY_TESTS.md)** - Guide technique cypress-axe complet
- **[Meilleures Pratiques](./doc/BEST_PRACTICES.md)** - Standards et patterns recommandés

### 🔧 Guides Techniques
- **[TypeScript](./doc/TYPESCRIPT_GUIDE.md)** - Guide concis des types TypeScript pour Cypress
- **[Installation](./doc/INSTALLATION.md)** - Configuration et setup initial
- **[Maintenance](./doc/MAINTENANCE.md)** - Maintenance et troubleshooting

### 📊 Statut du Projet
- **[Résolution TypeScript](./doc/TYPESCRIPT_RESOLUTION_FINAL.md)** - Rapport final de résolution des conflits TypeScript
- **[Statut d'Implémentation](./doc/IMPLEMENTATION_STATUS.md)** - Rapport final des tests d'accessibilité

### 🚀 Scripts Utilitaires
- **[clean-reports.sh](./clean-reports.sh)** - Nettoyage des rapports de tests

**Prochaine étape recommandée** : Consulter [doc/ACCESSIBILITY_TESTS.md](./doc/ACCESSIBILITY_TESTS.md) pour comprendre l'implémentation complète des tests d'accessibilité.
```
