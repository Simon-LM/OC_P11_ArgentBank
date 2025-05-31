<!-- @format -->

# Guide TypeScript pour Cypress - ArgentBank

Guide concis des types TypeScript pour les tests Cypress du projet ArgentBank.

## 🎯 Types centralisés

**Fichier** : `cypress/support/types.ts`

```typescript
export interface User {
  type: "valid" | "invalid";
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

export interface Account {
  id: string;
  title: string;
  balance: string;
  description: string;
  accountNumber: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
  notes?: string;
}
```

## 🔧 Utilisation pratique

### Import dans les tests

```typescript
import type { User, Account, Transaction } from "../../support/types";
```

### Typage des fixtures

```typescript
describe("Tests typés", () => {
  beforeEach(() => {
    cy.fixture<User[]>("users.json").as("usersData");
  });

  it("should use typed data", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (validUser?.email && validUser.password) {
      cy.login(validUser.email, validUser.password);
    }
  });
});
```

### Commandes personnalisées

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      fillUserForm(userData: Partial<User>): Chainable<void>;
    }
  }
}

Cypress.Commands.add("fillUserForm", (userData: Partial<User>) => {
  if (userData.firstName) cy.get("#firstName").clear().type(userData.firstName);
  if (userData.lastName) cy.get("#lastName").clear().type(userData.lastName);
  if (userData.userName) cy.get("#userName").clear().type(userData.userName);
});
```

## ⚙️ Configuration

```json
// cypress/tsconfig.json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "types": ["cypress", "@testing-library/cypress", "cypress-axe"],
    "strict": true,
    "noImplicitAny": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts", "**/*.cy.ts", "support/**/*"]
}
```

## ✅ Avantages

- **Type Safety** : Validation à la compilation
- **IntelliSense** : Autocomplétion intelligente
- **Cohérence** : Source unique de vérité
- **Maintenabilité** : Refactoring sécurisé

## 🚀 Bonnes pratiques

1. **Types d'union stricts** : `"valid" | "invalid"` plutôt que `string`
2. **Propriétés optionnelles** : Utiliser `?` pour les champs non obligatoires
3. **Toujours typer les fixtures** : `cy.fixture<User[]>("users.json")`
4. **Import centralisé** : Éviter la duplication des interfaces

---

**Statut** : ✅ Implémenté  
**Dernière mise à jour** : 30 mai 2025
