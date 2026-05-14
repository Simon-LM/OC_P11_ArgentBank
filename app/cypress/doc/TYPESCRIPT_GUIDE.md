<!-- @format -->

# TypeScript Guide for Cypress - ArgentBank

Concise guide for TypeScript types in Cypress tests for the ArgentBank project.

## 🎯 Centralized types

**File**: `cypress/support/types.ts`

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

## 🔧 Practical usage

### Import in tests

```typescript
import type { User, Account, Transaction } from "../../support/types";
```

### Typing fixtures

```typescript
describe("Typed tests", () => {
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

### Custom commands

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

## ✅ Advantages

- **Type Safety**: Compilation-time validation
- **IntelliSense**: Smart autocompletion
- **Consistency**: Single source of truth
- **Maintainability**: Safe refactoring

## 🚀 Best practices

1. **Strict union types**: `"valid" | "invalid"` rather than `string`
2. **Optional properties**: Use `?` for non-mandatory fields
3. **Always type fixtures**: `cy.fixture<User[]>("users.json")`
4. **Centralized imports**: Avoid interface duplication

---

**Status**: ✅ Implemented  
**Last update**: May 30, 2025
