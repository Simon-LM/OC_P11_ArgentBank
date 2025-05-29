<!-- @format -->

# Guide des Tests E2E avec Cypress

Ce guide explique comment créer, structurer et maintenir des tests end-to-end (E2E) efficaces avec Cypress dans le projet ArgentBank.

## 📋 Vue d'ensemble

Les tests E2E avec Cypress permettent de vérifier le fonctionnement complet de l'application du point de vue de l'utilisateur, simulant les interactions réelles avec l'interface.

## 🎯 Objectifs des tests E2E

- ✅ Valider les parcours utilisateur complets
- ✅ Tester l'intégration de tous les composants ensemble
- ✅ Vérifier que l'interface utilisateur répond correctement
- ✅ S'assurer que les données circulent correctement entre le frontend et le backend
- ✅ Détecter les régressions visuelles et fonctionnelles
- ✅ **Garantir l'accessibilité** avec des tests automatisés WCAG 2.1 AA intégrés
- ✅ **Générer des rapports** de conformité d'accessibilité

## 📁 Organisation des tests

### Structure recommandée

```text
cypress/
└── e2e/
    ├── auth/               # Tests liés à l'authentification
    │   ├── login.cy.js     # Tests de connexion
    │   └── signup.cy.js    # Tests d'inscription
    ├── account/            # Tests liés aux comptes
    │   ├── view.cy.js      # Tests de visualisation des comptes
    │   └── transactions.cy.js # Tests des transactions
    ├── profile/            # Tests liés au profil utilisateur
    │   └── edit.cy.js      # Tests de modification du profil
    └── navigation/         # Tests de navigation globale
        └── main-flow.cy.js # Tests du flux principal
```

### Convention de nommage

- **Fichiers** : `[feature].[action].cy.js`
- **Descriptions** : Décrire le comportement, pas l'implémentation
- **Tests** : Phrase complète décrivant ce qui est attendu

```javascript
// ✅ Bon nommage
describe("User authentication", () => {
	it("should display error message when credentials are invalid", () => {
		// ...
	});
});

// ❌ Mauvais nommage
describe("Login function", () => {
	it("error handling", () => {
		// ...
	});
});
```

## 🧪 Structure des tests

### Modèle recommandé

```javascript
describe("Feature: [Nom de la fonctionnalité]", () => {
	// Configuration globale pour cette suite de tests
	beforeEach(() => {
		// Configuration commune à tous les tests
	});

	context("Scenario: [Scénario spécifique]", () => {
		beforeEach(() => {
			// Configuration spécifique à ce scénario
		});

		it("should [résultat attendu] when [action]", () => {
			// Arrange - Préparer l'état initial
			// Act - Effectuer l'action à tester
			// Assert - Vérifier le résultat
		});
	});
});
```

### Exemple concret

```javascript
// cypress/e2e/auth/login.cy.js
describe("Feature: User Authentication", () => {
	beforeEach(() => {
		cy.visit("/login");
	});

	context("Scenario: Successful login", () => {
		it("should redirect to dashboard when credentials are valid", () => {
			// Arrange
			const username = "tony@stark.com";
			const password = "password123";

			// Act
			cy.findByLabelText("Email").type(username);
			cy.findByLabelText("Password").type(password);
			cy.findByRole("button", { name: /sign in/i }).click();

			// Assert
			cy.url().should("include", "/profile");
			cy.findByText("Welcome back").should("be.visible");
		});
	});

	context("Scenario: Failed login", () => {
		it("should display error message when credentials are invalid", () => {
			// Arrange
			const username = "invalid@email.com";
			const password = "wrongpassword";

			// Act
			cy.findByLabelText("Email").type(username);
			cy.findByLabelText("Password").type(password);
			cy.findByRole("button", { name: /sign in/i }).click();

			// Assert
			cy.url().should("include", "/login");
			cy.findByText("Invalid credentials").should("be.visible");
		});
	});
});
```

## 🔍 Stratégies de sélection

### Priorité des sélecteurs

Du plus recommandé au moins recommandé :

1. **Attributs d'accessibilité** (avec Testing Library)

   ```javascript
   cy.findByRole("button", { name: /sign in/i });
   cy.findByLabelText("Email");
   cy.findByText("Welcome back");
   ```

2. **Attributs de test dédiés**

   ```javascript
   cy.get('[data-testid="login-form"]');
   ```

3. **Classes ou attributs spécifiques à l'application**

   ```javascript
   cy.get(".form-login");
   cy.get('[name="email"]');
   ```

4. **Sélecteurs CSS** (en dernier recours)

   ```javascript
   cy.get(".header .nav-menu .dropdown:first-child");
   ```

### À éviter absolument

❌ **Sélecteurs fragiles** susceptibles de changer fréquemment

```javascript
cy.get("button").first(); // Trop générique, peut changer
cy.get(".btn").eq(2); // Dépend de l'ordre, fragile
```

## 🔄 Gestion des données de test

### Fixtures

Utilisez des fixtures pour définir des jeux de données réutilisables :

```json
// cypress/fixtures/users.json
{
	"validUser": {
		"email": "tony@stark.com",
		"password": "password123",
		"firstName": "Tony",
		"lastName": "Stark"
	},
	"invalidUser": {
		"email": "invalid@email.com",
		"password": "wrongpassword"
	}
}
```

```javascript
// Dans le test
cy.fixture("users").then((users) => {
	cy.findByLabelText("Email").type(users.validUser.email);
	cy.findByLabelText("Password").type(users.validUser.password);
});
```

### Approche recommandée : Test API + UI

Pour des tests plus rapides et fiables, utilisez les API pour la configuration et l'UI pour la vérification :

```javascript
describe("Account transactions", () => {
	beforeEach(() => {
		// Utiliser l'API pour se connecter (plus rapide que l'UI)
		cy.request({
			method: "POST",
			url: "/api/v1/user/login",
			body: { email: "tony@stark.com", password: "password123" },
		}).then((response) => {
			// Stocker le token
			localStorage.setItem("token", response.body.body.token);

			// Visiter la page avec une session déjà établie
			cy.visit("/account");
		});
	});

	it("should display transaction history", () => {
		// Maintenant tester l'UI
		cy.findByRole("heading", { name: /transactions/i }).should("be.visible");
		cy.findAllByTestId("transaction-item").should("have.length.at.least", 1);
	});
});
```

## 🤖 Commandes personnalisées

### Création de commandes réutilisables

Définissez des commandes pour les actions répétitives dans `cypress/support/commands.js` :

```javascript
// cypress/support/commands.js

// Commande de connexion
Cypress.Commands.add("login", (email, password) => {
	cy.visit("/login");
	cy.findByLabelText("Email").type(email);
	cy.findByLabelText("Password").type(password);
	cy.findByRole("button", { name: /sign in/i }).click();
});

// Commande de connexion via API
Cypress.Commands.add("loginByApi", (email, password) => {
	cy.request({
		method: "POST",
		url: "/api/v1/user/login",
		body: { email, password },
	}).then((response) => {
		localStorage.setItem("token", response.body.body.token);
	});
});

// Vérification d'éléments de compte
Cypress.Commands.add("verifyAccountDetails", (accountName, balance) => {
	cy.findByText(accountName).should("be.visible");
	cy.findByText(balance).should("be.visible");
});
```

### Utilisation des commandes

```javascript
describe("User accounts", () => {
	beforeEach(() => {
		cy.loginByApi("tony@stark.com", "password123");
		cy.visit("/accounts");
	});

	it("should display correct account information", () => {
		cy.verifyAccountDetails("Checking (x8349)", "$2,082.79");
		cy.verifyAccountDetails("Savings (x6712)", "$10,928.42");
	});
});
```

## 📸 Tests visuels

### Vérification des rendus visuels

```javascript
describe("Visual testing", () => {
	it("should display login page correctly", () => {
		cy.visit("/login");
		cy.matchImageSnapshot("login-page");
	});

	it("should display account dashboard correctly", () => {
		cy.loginByApi("tony@stark.com", "password123");
		cy.visit("/profile");
		cy.matchImageSnapshot("account-dashboard");
	});
});
```

### Configuration des snapshots

```javascript
// cypress/plugins/index.js
const {
	addMatchImageSnapshotPlugin,
} = require("cypress-image-snapshot/plugin");

module.exports = (on, config) => {
	addMatchImageSnapshotPlugin(on, config);
};
```

```javascript
// cypress/support/commands.js
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";
addMatchImageSnapshotCommand();
```

## 🚀 Parcours utilisateur complets

### Exemple de flux utilisateur complet

```javascript
describe("Complete user journey", () => {
	it("should allow a user to login, check accounts, and update profile", () => {
		// 1. Visite de la page d'accueil
		cy.visit("/");
		cy.findByRole("link", { name: /sign in/i }).click();

		// 2. Connexion
		cy.findByLabelText("Email").type("tony@stark.com");
		cy.findByLabelText("Password").type("password123");
		cy.findByRole("button", { name: /sign in/i }).click();

		// 3. Vérification du dashboard
		cy.url().should("include", "/profile");
		cy.findByText("Welcome back").should("be.visible");

		// 4. Modification du profil
		cy.findByText("Edit Name").click();
		cy.findByLabelText("First Name").clear().type("Anthony");
		cy.findByRole("button", { name: /save/i }).click();

		// 5. Vérification des modifications
		cy.findByText("Anthony Stark").should("be.visible");

		// 6. Vérification des comptes
		cy.findByRole("link", { name: /view accounts/i }).click();
		cy.url().should("include", "/accounts");
		cy.findByText("Checking (x8349)").should("be.visible");

		// 7. Déconnexion
		cy.findByText("Sign Out").click();
		cy.url().should("eq", Cypress.config().baseUrl + "/");
	});
});
```

## ⚡ Optimisation des performances

### Stratégies pour tests rapides

1. **Préparation par API** : Utilisez les API pour la préparation des données et des états
2. **Réutilisation des sessions** : Conservez les sessions entre les tests
3. **Tests indépendants** : Créez des tests indépendants plutôt qu'une séquence
4. **Parallélisation** : Configurez Cypress pour exécuter les tests en parallèle

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
	e2e: {
		// Exécution parallèle dans CI
		experimentalRunAllSpecs: true,
		// Autres configurations...
	},
});
```

## ♿ Tests d'accessibilité avec cypress-axe

### Vue d'ensemble

Les tests d'accessibilité sont **intégrés dans tous les tests E2E** pour garantir la conformité WCAG 2.1 AA de l'application ArgentBank. Chaque page et fonctionnalité est automatiquement vérifiée pour les violations d'accessibilité.

> 📖 **Documentation complète** : Consultez [ACCESSIBILITY_TESTS.md](./ACCESSIBILITY_TESTS.md) pour le guide détaillé

### Configuration initiale

```typescript
// cypress/support/e2e.ts
import "cypress-axe";
```

```typescript
// cypress.config.ts - Configuration reporter pour accessibilité
export default defineConfig({
	e2e: {
		reporter: "mochawesome",
		reporterOptions: {
			reportDir: "cypress/reports",
			overwrite: false,
			html: true,
			json: true,
			timestamp: "mmddyyyy_HHMMss",
		},
	},
});
```

### Pattern d'intégration recommandé

```typescript
describe("Feature: User Authentication", () => {
	context("Scenario: Accessibility verification", () => {
		it("should be accessible on login page", () => {
			// 1. Injecter axe-core (TOUJOURS au début du test)
			cy.injectAxe();

			// 2. Vérifier l'accessibilité de base
			cy.checkA11y(undefined, {
				rules: {
					// Ignorer les violations de contraste connues (temporaire)
					"color-contrast": { enabled: false },
				},
			});

			// 3. Tester l'accessibilité avec focus
			cy.get("input#email").focus();
			cy.checkA11y();

			cy.get("input#password").focus();
			cy.checkA11y();
		});
	});

	context("Scenario: Functional + Accessibility", () => {
		it("should allow login and remain accessible throughout", () => {
			// Injection d'axe
			cy.injectAxe();

			// Vérification initiale
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});

			// Actions fonctionnelles
			cy.findByLabelText("Email").type("tony@stark.com");
			cy.findByLabelText("Password").type("password123");
			cy.findByRole("button", { name: /sign in/i }).click();

			// Vérification après action
			cy.url().should("include", "/profile");
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});
	});
});
```

### Tests d'accessibilité par fonctionnalité

#### 🔐 Authentification

```typescript
// login.cy.ts - Exemple réel du projet
it("devrait permettre à un utilisateur de se connecter", function () {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Test de connexion + vérification continue
	this.loginUser();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});
});
```

#### 👤 Profil utilisateur

```typescript
// profile.cy.ts - Gestion des formulaires
it("devrait être accessible lors de l'édition du profil", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Test d'accessibilité du formulaire d'édition
	cy.get('button[class*="edit-button"]').first().click();
	cy.checkA11y();
});
```

#### 🏦 Comptes bancaires

```typescript
// accounts.cy.ts - Navigation et sélection
it("devrait être accessible sur la page des comptes", () => {
	cy.injectAxe();
	cy.checkA11y(undefined, {
		rules: { "color-contrast": { enabled: false } },
	});

	// Test avec focus sur les éléments interactifs
	cy.get('button[class*="account"]').first().focus();
	cy.checkA11y();
});
```

#### 💳 Transactions

```typescript
// transactions.cy.ts - Gestion conditionnelle
it("devrait être accessible avec pagination", () => {
	cy.injectAxe();
	cy.checkA11y();

	// Gestion intelligente des éléments conditionnels
	cy.get('button[class*="pagination"]').then(($buttons) => {
		const enabledButtons = $buttons.filter(":not(:disabled)");
		if (enabledButtons.length > 0) {
			cy.wrap(enabledButtons.first()).focus();
			cy.checkA11y();
		}
	});
});
```

### Scripts NPM pour l'accessibilité

```json
// package.json
{
	"scripts": {
		"test:e2e:a11y": "cypress run --spec 'cypress/e2e/**/*.cy.ts'",
		"test:e2e:a11y:report": "cypress run && pnpm run test:e2e:merge-reports",
		"test:e2e:merge-reports": "mochawesome-merge && marge",
		"test:e2e:clean": "bash cypress/clean-reports.sh"
	}
}
```

### ⚠️ Points d'attention critiques

#### Injection d'axe-core

```typescript
// ✅ CORRECT : Injection individuelle dans chaque test
it("test d'accessibilité", () => {
	cy.injectAxe(); // Au début de CHAQUE test
	cy.checkA11y();
});

// ❌ INCORRECT : Injection dans beforeEach (interfère avec l'auth)
beforeEach(() => {
	cy.injectAxe(); // NE PAS FAIRE - casse l'authentification
});
```

#### Gestion des éléments conditionnels

```typescript
// ✅ CORRECT : Vérification de l'état avant interaction
cy.get("button").then(($buttons) => {
	const enabledButtons = $buttons.filter(":not(:disabled)");
	if (enabledButtons.length > 0) {
		cy.wrap(enabledButtons.first()).focus();
		cy.checkA11y();
	}
});

// ❌ INCORRECT : Focus sans vérification
cy.get("button").first().focus(); // Peut échouer sur éléments désactivés
```

### 📊 Rapports d'accessibilité

Les rapports sont générés automatiquement dans `cypress/reports/` :

- **Mochawesome HTML** : Rapports visuels détaillés
- **JSON consolidé** : Données pour analyse programmatique
- **Artefacts CI/CD** : Intégration pipeline

### 🎯 Statut actuel

- ✅ **15 tests E2E** avec vérifications d'accessibilité intégrées
- ✅ **Toutes les pages** couvertes (auth, profil, comptes, transactions)
- ✅ **Reporting automatisé** configuré
- ⚠️ **Règle color-contrast** temporairement désactivée (corrections design à venir)
- ✅ **Documentation complète** disponible

### 🔗 Ressources d'accessibilité

- **[Guide complet des tests d'accessibilité](./ACCESSIBILITY_TESTS.md)**
- **[Meilleures pratiques](./BEST_PRACTICES.md)**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Cypress-Axe Documentation](https://github.com/component-driven/cypress-axe)

## 📊 Reporting et analyse

### Configuration des rapports

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
	e2e: {
		reporter: "mochawesome",
		reporterOptions: {
			reportDir: "cypress/reports",
			overwrite: false,
			html: true,
			json: true,
		},
	},
});
```

### Scripts de génération de rapports

```json
// package.json
{
	"scripts": {
		"cy:run:report": "cypress run --reporter mochawesome",
		"report:merge": "mochawesome-merge cypress/reports/*.json > cypress/reports/full_report.json",
		"report:generate": "marge cypress/reports/full_report.json -o cypress/reports/html"
	}
}
```

## 📝 Ressources complémentaires

- [Documentation officielle Cypress](https://docs.cypress.io/)
- [Testing Library pour Cypress](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Meilleures pratiques Cypress](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Real World App](https://github.com/cypress-io/cypress-realworld-app) (Exemple complet)
- **[Tests d'Accessibilité](./ACCESSIBILITY_TESTS.md)** - Guide complet des tests d'accessibilité avec cypress-axe

---

**Navigation** :

- 🏠 [Accueil](../README.md)
- 📚 [Installation](./INSTALLATION.md)
- ⭐ [Meilleures pratiques](./BEST_PRACTICES.md)
- 🔧 [Maintenance](./MAINTENANCE.md)
- ♿ **[Tests d'Accessibilité](./ACCESSIBILITY_TESTS.md)** - Guide complet avec cypress-axe

**Documentation connexe** :

- 📋 [Tests d'Accessibilité ArgentBank](../ACCESSIBILITY_TESTS.md) - Résumé d'implémentation
- 🎯 [Statut d'implémentation](../IMPLEMENTATION_COMPLETE.md) - Rapport final
