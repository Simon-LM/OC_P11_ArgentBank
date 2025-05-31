<!-- @format -->

# Guide des meilleures pratiques pour Cypress

Ce guide détaille les meilleures pratiques à suivre lors du développement de tests E2E avec Cypress pour le projet ArgentBank.

## 📋 Structure des tests

### Organisation par comportements utilisateur

```javascript
// cypress/e2e/auth/login.cy.js

// ✅ Bon: Organisé par comportements utilisateur
describe("Authentication", () => {
  context("When a user logs in", () => {
    it("should access dashboard with valid credentials", () => {
      // ...
    });

    it("should show error message with invalid credentials", () => {
      // ...
    });
  });

  context("When a user logs out", () => {
    it("should be redirected to the home page", () => {
      // ...
    });
  });
});

// ❌ Éviter: Tests sans structure claire
describe("Login tests", () => {
  it("test 1", () => {
    // ...
  });
  it("test 2", () => {
    // ...
  });
});
```

### Structure par page ou fonctionnalité

```
cypress/e2e/
├── auth/                # Tests d'authentification
│   ├── login.cy.js      # Connexion
│   └── logout.cy.js     # Déconnexion
├── profile/             # Tests de profil utilisateur
│   └── edit-profile.cy.js
├── accounts/            # Tests des comptes
│   ├── view-accounts.cy.js
│   └── account-details.cy.js
└── transactions/        # Tests des transactions
    ├── search.cy.js
    └── filters.cy.js
```

## 🔍 Sélecteurs

### Hiérarchie des sélecteurs recommandés

1. **Attributs data-testid (préféré)**

   ```javascript
   cy.get("[data-testid=login-button]").click();
   ```

2. **Rôles et attributs ARIA**

   ```javascript
   cy.get('button[aria-label="Submit form"]').click();
   cy.get("[role=dialog]").should("be.visible");
   ```

3. **Sélecteurs de classes CSS spécifiques à l'application**

   ```javascript
   cy.get(".transaction-row").should("have.length", 5);
   ```

4. **Texte contenu (si stable)**
   ```javascript
   cy.contains("Welcome back").should("be.visible");
   ```

### Éviter ces sélecteurs

❌ **Sélecteurs génériques**

```javascript
cy.get("button").click(); // Trop générique
cy.get(".btn").click(); // Classes utilitaires souvent réutilisées
```

❌ **Sélecteurs complexes et fragiles**

```javascript
cy.get("div > div > ul > li:first-child > button").click();
```

## ⚡ Performance et stabilité

### Attentes efficaces

```javascript
// ✅ Bon: Attente implicite
cy.get("[data-testid=account-balance]").should("contain", "$");

// ✅ Bon: Attente avec retry et timeout personnalisé
cy.get("[data-testid=transactions-table]", { timeout: 10000 }).should(
  "be.visible",
);

// ❌ Éviter: cy.wait arbitraire
cy.wait(2000); // Attente fixe qui ralentit les tests
```

### Isolation des tests

```javascript
// ✅ Bon: Utiliser cy.session pour la persistance d'authentification
beforeEach(() => {
  cy.session("user-session", () => {
    cy.login("user@example.com", "password");
  });
  cy.visit("/dashboard");
});

// ❌ Éviter: Dépendances entre tests
// Ne pas faire dépendre un test du résultat d'un autre test
```

## 🔄 Commandes personnalisées

### Création de commandes réutilisables

```javascript
// cypress/support/commands.js
Cypress.Commands.add("login", (email, password) => {
  cy.visit("/signin");
  cy.get("[data-testid=email-input]").type(email);
  cy.get("[data-testid=password-input]").type(password);
  cy.get("[data-testid=login-button]").click();
  cy.url().should("include", "/user");
});

Cypress.Commands.add("selectAccount", (accountId) => {
  cy.get(`[data-testid=account-${accountId}]`).click();
  cy.get("[data-testid=transaction-history]").should("be.visible");
});
```

### Gestion des formulaires

```javascript
Cypress.Commands.add("fillUserForm", (userData) => {
  if (userData.firstName) {
    cy.get("[data-testid=firstName-input]").clear().type(userData.firstName);
  }
  if (userData.lastName) {
    cy.get("[data-testid=lastName-input]").clear().type(userData.lastName);
  }
  if (userData.userName) {
    cy.get("[data-testid=userName-input]").clear().type(userData.userName);
  }
});

// Usage
cy.fillUserForm({
  userName: "newUsername",
});
```

## 📊 Assertions

### Assertions explicites et descriptives

```javascript
// ✅ Bon: Assertions claires et spécifiques
cy.get("[data-testid=account-balance]")
  .should("be.visible")
  .and("contain", "$");

cy.get("[data-testid=transactions-table] tbody tr")
  .should("have.length.at.least", 1)
  .first()
  .should("contain", "Transaction");

// ❌ Éviter: Assertions vagues
cy.get("[data-testid=account-balance]").should("exist");
```

### Chaînage d'assertions

```javascript
cy.get("[data-testid=account-card]").within(() => {
  cy.get("[data-testid=account-type]").should("contain", "Checking");
  cy.get("[data-testid=account-number]").should("contain", "x8349");
  cy.get("[data-testid=account-balance]").should("contain", "$2,082.79");
});
```

## 🔄 Intercept des requêtes réseau

### Stubbing des API

```javascript
// ✅ Bon: Intercepter et stubber les réponses API
cy.intercept("GET", "/api/v1/user/profile", {
  statusCode: 200,
  body: {
    firstName: "Tony",
    lastName: "Stark",
    userName: "ironman",
  },
}).as("getProfile");

cy.visit("/user");
cy.wait("@getProfile");
cy.get("[data-testid=user-name]").should("contain", "Tony Stark");

// Simuler une erreur
cy.intercept("PUT", "/api/v1/user/profile", {
  statusCode: 500,
  body: { message: "Server error" },
}).as("updateProfileError");

cy.get("[data-testid=save-button]").click();
cy.wait("@updateProfileError");
cy.get("[data-testid=error-message]").should("be.visible");
```

### Attente de requêtes spécifiques

```javascript
// Intercepter les requêtes pour attendre leur complétion
cy.intercept("GET", "/api/v1/user/accounts").as("getAccounts");
cy.intercept("GET", "/api/v1/user/transactions*").as("getTransactions");

cy.visit("/user");
cy.wait("@getAccounts");

cy.get("[data-testid=account-1]").click();
cy.wait("@getTransactions");
```

## 📱 Tests responsive

### Tests sur différentes tailles d'écran

```javascript
const sizes = ["iphone-6", "ipad-2", [1280, 720]];

sizes.forEach((size) => {
  it(`displays properly on ${size} screen`, () => {
    if (Cypress._.isArray(size)) {
      cy.viewport(size[0], size[1]);
    } else {
      cy.viewport(size);
    }

    cy.visit("/user");

    // Vérifications spécifiques à la taille
    if (size === "iphone-6") {
      cy.get("[data-testid=mobile-menu-button]").should("be.visible");
    } else {
      cy.get("[data-testid=desktop-nav]").should("be.visible");
    }
  });
});
```

## ♿ Tests d'accessibilité

### Intégration avec cypress-axe

```javascript
// cypress/support/e2e.js
import "cypress-axe";

// Dans les tests
describe("Accessibility checks", () => {
  beforeEach(() => {
    cy.visit("/user");
    cy.injectAxe();
  });

  it("should have no accessibility violations on user dashboard", () => {
    cy.checkA11y();
  });

  it("should have no accessibility violations in transactions table", () => {
    cy.get("[data-testid=account-1]").click();
    cy.checkA11y("[data-testid=transactions-table]", {
      rules: {
        "color-contrast": { enabled: true },
      },
    });
  });
});
```

## 📁 Gestion des données de test

### Utilisation des fixtures

```javascript
// cypress/fixtures/accounts.json
[
  {
    id: "1",
    type: "Checking",
    accountNumber: "x8349",
    balance: 2082.79,
  },
  {
    id: "2",
    type: "Savings",
    accountNumber: "x6712",
    balance: 10928.42,
  },
];

// Utilisation dans les tests
cy.fixture("accounts").then((accounts) => {
  // Intercepter la requête et répondre avec les données fixtures
  cy.intercept("GET", "/api/v1/user/accounts", accounts).as("getAccounts");

  cy.visit("/user");
  cy.wait("@getAccounts");

  // Vérifier que les comptes sont correctement affichés
  cy.get("[data-testid=account-list] [data-testid=account-card]").should(
    "have.length",
    accounts.length,
  );

  // Vérifier les détails du premier compte
  cy.get(`[data-testid=account-${accounts[0].id}]`).within(() => {
    cy.get("[data-testid=account-type]").should("contain", accounts[0].type);
    cy.get("[data-testid=account-balance]").should(
      "contain",
      `$${accounts[0].balance.toLocaleString()}`,
    );
  });
});
```

## 🔄 CI/CD

### Configuration pour l'exécution en CI

```javascript
// cypress.config.js
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    // Configuration spécifique pour CI
    ...(process.env.CI && {
      video: true,
      screenshotOnRunFailure: true,
      trashAssetsBeforeRuns: true,
    }),
  },
});
```

### Gestion des captures d'écran et vidéos

```yaml
# .github/workflows/e2e-tests.yml
- name: Archive test artifacts
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: cypress-artifacts
    path: |
      cypress/screenshots/
      cypress/videos/
    retention-days: 7
```

## ♿ Meilleures pratiques d'accessibilité

### Intégration systématique des tests d'accessibilité

> 📖 **Guide complet** : [ACCESSIBILITY_TESTS.md](./ACCESSIBILITY_TESTS.md)

```typescript
// ✅ BONNE PRATIQUE : Intégrer l'accessibilité dans chaque test E2E
describe("Feature: User Profile", () => {
  context("Scenario: Profile editing with accessibility", () => {
    it("should allow profile editing while maintaining accessibility", () => {
      // 1. Configuration d'accessibilité
      cy.injectAxe();

      // 2. Vérification initiale
      cy.checkA11y(undefined, {
        rules: { "color-contrast": { enabled: false } },
      });

      // 3. Actions fonctionnelles
      cy.get('[data-testid="edit-profile"]').click();
      cy.findByLabelText("First Name").clear().type("NewName");

      // 4. Vérification continue
      cy.checkA11y();

      // 5. Finalisation avec vérification
      cy.get('[data-testid="save-profile"]').click();
      cy.checkA11y();
    });
  });
});
```

### Pattern d'injection recommandé

```typescript
// ✅ CORRECT : Injection individuelle
it("test d'accessibilité", () => {
  cy.injectAxe(); // Au début de CHAQUE test
  cy.checkA11y();
});

// ❌ INCORRECT : Injection globale (interfère avec l'auth)
beforeEach(() => {
  cy.injectAxe(); // À éviter - casse l'authentification
});
```

### Gestion des éléments conditionnels

```typescript
// ✅ BONNE PRATIQUE : Vérification conditionnelle
cy.get('button[class*="pagination"]').then(($buttons) => {
  const enabledButtons = $buttons.filter(":not(:disabled)");
  if (enabledButtons.length > 0) {
    cy.wrap(enabledButtons.first()).focus();
    cy.checkA11y();
  }
});

// ❌ MAUVAISE PRATIQUE : Focus sans vérification
cy.get("button").first().focus(); // Peut échouer
```

### Configuration d'accessibilité recommandée

```typescript
// Configuration standard pour ArgentBank
const a11yConfig = {
  rules: {
    // Désactivé temporairement (violations design connues)
    "color-contrast": { enabled: false },
    // Autres règles selon besoins
  },
};

// Utilisation
cy.checkA11y(undefined, a11yConfig);
```

### Tests d'accessibilité avec focus

```typescript
it("should maintain accessibility during keyboard navigation", () => {
  cy.injectAxe();

  // Test de base
  cy.checkA11y();

  // Test avec focus sur éléments interactifs
  cy.get('input[type="email"]').focus();
  cy.checkA11y();

  cy.get('input[type="password"]').focus();
  cy.checkA11y();

  cy.get('button[type="submit"]').focus();
  cy.checkA11y();
});
```

### Commandes personnalisées pour l'accessibilité

```typescript
// cypress/support/commands.ts
Cypress.Commands.add("checkAccessibility", (context?: string) => {
  cy.injectAxe();
  cy.checkA11y(
    undefined,
    {
      rules: { "color-contrast": { enabled: false } },
    },
    (violations) => {
      if (violations.length) {
        cy.task(
          "log",
          `Accessibility violations in ${context}: ${violations.length}`,
        );
      }
    },
  );
});

// Utilisation
it("should be accessible", () => {
  cy.checkAccessibility("login page");
});
```

## 🧪 Tests de composants

### Test isolé de composants React

```javascript
// cypress/components/TransactionRow.cy.js
import TransactionRow from "../../src/components/TransactionRow/TransactionRow";

describe("TransactionRow Component", () => {
  it("renders transaction details correctly", () => {
    const transaction = {
      id: "1",
      description: "Golden Sun Bakery",
      amount: 50.0,
      date: "2023-06-20",
      type: "DEBIT",
      category: "Food",
    };

    cy.mount(<TransactionRow transaction={transaction} />);

    cy.get("[data-testid=transaction-description]").should(
      "contain",
      transaction.description,
    );

    cy.get("[data-testid=transaction-amount]").should(
      "contain",
      `-$${transaction.amount.toFixed(2)}`,
    );

    cy.get("[data-testid=transaction-date]").should(
      "contain",
      new Date(transaction.date).toLocaleDateString(),
    );

    cy.get("[data-testid=transaction-category]").should(
      "contain",
      transaction.category,
    );
  });

  it("shows different styling for credit transactions", () => {
    const transaction = {
      id: "2",
      description: "Salary Payment",
      amount: 2500.0,
      date: "2023-06-15",
      type: "CREDIT",
      category: "Income",
    };

    cy.mount(<TransactionRow transaction={transaction} />);

    cy.get("[data-testid=transaction-amount]")
      .should("contain", `+$${transaction.amount.toFixed(2)}`)
      .and("have.class", "amount-credit");
  });
});
```

## 📝 Documentation des tests

### Bonne pratique de documentation

```javascript
/**
 * Tests du processus d'authentification
 *
 * Ces tests vérifient:
 * 1. Le processus de connexion réussie
 * 2. La gestion des erreurs d'authentification
 * 3. La persistance de session
 * 4. Le processus de déconnexion
 */
describe("Authentication", () => {
  /**
   * Vérifie qu'un utilisateur peut se connecter avec des identifiants valides
   * et accéder au dashboard utilisateur.
   */
  it("allows a user to log in successfully", () => {
    // ...test implementation
  });

  // Autres tests...
});
```

## 🔍 Debugging

### Outils de débogage

```javascript
// Capturer des captures d'écran à des moments spécifiques
it("should navigate through accounts", () => {
  cy.visit("/user");
  cy.screenshot("user-dashboard");

  cy.get("[data-testid=account-1]").click();
  cy.screenshot("account-details");
});

// Pause pour débogage interactif
it("allows form submission", () => {
  cy.visit("/profile/edit");
  cy.get("[data-testid=userName-input]").type("newUsername");
  cy.pause(); // Pause ici pour inspection interactive
  cy.get("[data-testid=save-button]").click();
});

// Utiliser console.log avec .then()
cy.get("[data-testid=account-balance]")
  .then(($el) => {
    const balance = $el.text();
    console.log("Account balance:", balance);
    return balance;
  })
  .should("include", "$");
```

---

Ce guide des meilleures pratiques aidera à maintenir une suite de tests Cypress cohérente, maintenable et fiable pour le projet ArgentBank. Adaptez ces pratiques selon les besoins spécifiques du projet et de l'équipe.

## 📚 Documentation connexe

**Navigation** :

- 🏠 [Accueil](../README.md)
- 📋 [Tests E2E](./E2E_TESTS.md)
- 📚 [Installation](./INSTALLATION.md)
- 🔧 [Maintenance](./MAINTENANCE.md)
- ♿ **[Tests d'Accessibilité](./ACCESSIBILITY_TESTS.md)** - Guide complet avec cypress-axe

**Points clés d'accessibilité** :

- ✅ Intégration systématique de `cy.injectAxe()` et `cy.checkA11y()`
- ✅ Configuration des règles d'accessibilité adaptée au projet
- ✅ Gestion des éléments conditionnels et focus
- ✅ Rapports d'accessibilité automatisés

## 📝 Types TypeScript

### Centralisation des types

Pour maintenir la cohérence et éviter les conflits de types, tous les types TypeScript pour Cypress sont centralisés dans `cypress/support/types.ts`.

✅ **Utilisation des types centralisés**

```typescript
// Import unique dans chaque fichier de test
import type { User, Account, Transaction } from "../../support/types";
```

❌ **Éviter la duplication d'interfaces**

```typescript
// ❌ Ne pas redéfinir les interfaces dans chaque fichier
interface User { ... }
```

### Configuration recommandée

```json
// cypress/tsconfig.json - Configuration TypeScript pour Cypress
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "@testing-library/cypress", "cypress-axe"],
    "strict": true,
    "noImplicitAny": true
  },
  "include": ["**/*.ts", "../src/types/**/*"]
}
```

> 📖 **Documentation complète** : Voir [TYPESCRIPT_GUIDE.md](./TYPESCRIPT_GUIDE.md) pour les détails complets sur l'utilisation des types TypeScript dans Cypress.
