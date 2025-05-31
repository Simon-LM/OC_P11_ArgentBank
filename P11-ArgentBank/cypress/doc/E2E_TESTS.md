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

## 📁 Organisation des tests

### Structure actuelle du projet

```text
cypress/
└── e2e/
    ├── auth/                           # Tests d'authentification (2 fichiers)
    │   ├── login.cy.ts                 # Tests de connexion - 3 tests
    │   └── logout.cy.ts                # Tests de déconnexion - 2 tests
    ├── accounts/                       # Tests des comptes bancaires (1 fichier)
    │   └── accounts.cy.ts              # Tests de visualisation comptes - 3 tests
    ├── profile/                        # Tests du profil utilisateur (1 fichier)
    │   └── profile.cy.ts               # Tests de modification profil - 8 tests
    ├── transactions/                   # Tests des transactions (2 fichiers)
    │   ├── transactions-display.cy.ts  # Tests d'affichage et navigation - 3 tests
    │   └── transactions-functionality.cy.ts # Tests de fonctionnalités - 3 tests
    ├── cross-browser/                  # Tests cross-browser (1 fichier)
    │   └── cross-browser.cy.ts         # Tests de compatibilité - 7 tests
    ├── edge-cases/                     # Tests de cas limites (1 fichier)
    │   └── edge-cases.cy.ts            # Tests de robustesse - 7 tests
    └── network/                        # Tests réseau (1 fichier)
        └── network-errors.cy.ts        # Tests de gestion d'erreurs - 7 tests

Total: 9 fichiers de test | 41 tests E2E | 100% avec accessibilité intégrée
```

### Convention de nommage

- **Fichiers** : `[feature]-[action].cy.ts` ou `[feature].cy.ts`
- **Descriptions** : Utiliser des verbes d'action clairs
- **Tests** : Décrire le comportement attendu

```javascript
// ✅ Bon nommage (exemples du projet)
describe("User Authentication", () => {
  it("devrait permettre à un utilisateur de se connecter avec des identifiants valides", () => {
    // ...
  });
});

describe("Transactions Display", () => {
  it("devrait afficher les transactions par défaut pour le premier compte", () => {
    // ...
  });
});
```

## 🧪 Structure des tests

### Pattern utilisé dans le projet

```javascript
describe("Feature: [Nom de la fonctionnalité]", () => {
  beforeEach(() => {
    // Configuration commune (navigation, authentification)
  });

  it("devrait [résultat attendu] quand [condition]", () => {
    // Test avec vérification d'accessibilité intégrée
    cy.injectAxe();

    // Actions du test
    // ...

    // Vérifications d'accessibilité
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
  });
});
```

### Exemple concret du projet

```javascript
// transactions-display.cy.ts
describe("Transactions Display", () => {
  beforeEach(function () {
    this.loginUser();
    cy.navigateToTransactions();
  });

  it("devrait afficher les transactions par défaut pour le premier compte", function () {
    cy.injectAxe();
    cy.get('button[class*="account"]').first().should("be.visible");
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
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

## 📸 Tests visuels et reporting

### Scripts NPM disponibles

```bash
# Tests E2E standards
pnpm run cypress:run

# Tests avec rapport détaillé
pnpm run test:e2e:report

# Tests d'accessibilité avec rapport
pnpm run test:e2e:a11y:report

# Nettoyage des rapports
pnpm run test:e2e:clean
```

### Rapports générés

Les rapports sont automatiquement générés dans `cypress/reports/` :

- **HTML** : Interface visuelle avec détails des tests
- **JSON** : Données pour analyse programmatique
- **Screenshots** : Captures d'écran en cas d'échec

## 🚀 Parcours utilisateur et optimisation

### Pattern d'optimisation utilisé

Le projet utilise une approche hybride API + UI pour optimiser les performances :

```javascript
// Connexion rapide via API dans beforeEach
beforeEach(function () {
  this.loginUser(); // Commande personnalisée optimisée
  cy.navigateToTransactions();
});
```

### Points clés du projet

1. **Tests d'accessibilité intégrés** : Tous les tests incluent `cypress-axe`
2. **Commandes personnalisées** : Réutilisation via `this.loginUser()`
3. **Gestion CSS Modules** : Sélecteurs flexibles pour les classes dynamiques
4. **Reporting automatisé** : Génération de rapports HTML/JSON

## ♿ Tests d'accessibilité avec cypress-axe

### Vue d'ensemble

Les tests d'accessibilité sont **intégrés dans tous les tests E2E** pour garantir la conformité WCAG 2.1 AA de l'application ArgentBank.

> 📖 **Documentation complète** : Consultez [ACCESSIBILITY_TESTS.md](./ACCESSIBILITY_TESTS.md) pour le guide détaillé

### Pattern d'intégration utilisé

```typescript
it("devrait être accessible lors du test", () => {
  // 1. Injection d'axe-core (OBLIGATOIRE au début de chaque test)
  cy.injectAxe();

  // 2. Actions du test
  // ...

  // 3. Vérification d'accessibilité
  cy.checkA11y(undefined, {
    rules: {
      "color-contrast": { enabled: false }, // Temporairement désactivé
    },
  });
});
```

### Points critiques

- ⚠️ **Injection individuelle** : `cy.injectAxe()` dans chaque test (pas dans `beforeEach`)
- ✅ **100% de couverture** : Tous les 41 tests incluent des vérifications d'accessibilité
- 📊 **Rapports automatisés** : Génération de rapports HTML avec Mochawesome

## 📝 Ressources et documentation

### Documentation du projet

- **[Guide complet des tests d'accessibilité](./ACCESSIBILITY_TESTS.md)** - Documentation détaillée cypress-axe
- **[Meilleures pratiques](./BEST_PRACTICES.md)** - Recommandations et bonnes pratiques
- **[Statut d'implémentation](./IMPLEMENTATION_STATUS.md)** - État actuel du projet

### Ressources externes

- [Documentation officielle Cypress](https://docs.cypress.io/)
- [Testing Library pour Cypress](https://testing-library.com/docs/cypress-testing-library/intro/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Navigation** :

- 🏠 [Accueil](../README.md)
- 📚 [Installation](./INSTALLATION.md)
- ⭐ [Meilleures pratiques](./BEST_PRACTICES.md)
- 🔧 [Maintenance](./MAINTENANCE.md)
- ♿ **[Tests d'Accessibilité](./ACCESSIBILITY_TESTS.md)** - Guide complet avec cypress-axe
