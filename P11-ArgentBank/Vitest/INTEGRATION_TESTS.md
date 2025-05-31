<!-- @format -->

# Guide des Tests d'Intégration - Vitest

## 🎯 Objectif

Les tests d'intégration vérifient l'interaction entre plusieurs composants, services ou modules. Ils testent des workflows complets et la communication entre différentes parties de l'application.

## 📂 Localisation

Les tests d'intégration sont nommés `*.integration.test.tsx` et placés à côté du composant principal :

```
src/pages/User/
├── User.tsx
├── User.test.tsx                    # Tests unitaires
├── User.integration.test.tsx        # ← Tests d'intégration ici
└── user.module.scss
```

## 🧪 Types de tests d'intégration

### 1. Tests de flux utilisateur complets

#### Exemple : Processus d'authentification

```typescript
// SignIn.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import SignIn from './SignIn';
import { store } from '../../store/Store';

describe('SignIn Integration', () => {
  const renderSignInWithProviders = () => {
    return render(
      <Provider store={store}>
        <MemoryRouter>
          <SignIn />
        </MemoryRouter>
      </Provider>
    );
  };

  it('completes full authentication flow', async () => {
    renderSignInWithProviders();

    // Étape 1: Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });

    // Étape 2: Soumettre
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Étape 3: Vérifier le résultat
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Tests d'interaction Redux + Composants

#### Exemple : Gestion d'état avec actions

```typescript
// User.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { describe, it, expect, vi } from 'vitest';
import User from './User';
import usersSlice from '../../store/slices/usersSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      users: usersSlice,
    },
    preloadedState: {
      users: {
        isAuthenticated: true,
        currentUser: { firstName: 'John', lastName: 'Doe' },
        ...initialState,
      },
    },
  });
};

describe('User Page Integration', () => {
  it('handles account selection and transaction filtering', async () => {
    const testStore = createTestStore({
      accounts: [
        { id: '1', type: 'Checking', balance: 1000 },
        { id: '2', type: 'Savings', balance: 2000 },
      ],
    });

    render(
      <Provider store={testStore}>
        <User />
      </Provider>
    );

    // Sélectionner un compte
    fireEvent.click(screen.getByText(/checking/i));

    // Vérifier que les transactions sont filtrées
    await waitFor(() => {
      expect(screen.getByText(/transactions for checking/i)).toBeInTheDocument();
    });
  });
});
```

### 3. Tests d'API avec mocking

#### Exemple : Interaction avec services externes

```typescript
// TransactionSearch.integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TransactionSearch from './TransactionSearch';
import * as transactionService from '../../services/transactionService';

// Mock du service
vi.mock('../../services/transactionService');
const mockedTransactionService = vi.mocked(transactionService);

describe('TransactionSearch Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('searches and displays results', async () => {
    // Setup mock response
    mockedTransactionService.searchTransactions.mockResolvedValue({
      results: [
        { id: '1', description: 'Coffee Shop', amount: -5.50 },
        { id: '2', description: 'Salary', amount: 2500.00 },
      ],
      pagination: { total: 2, page: 1 },
    });

    render(<TransactionSearch />);

    // Effectuer une recherche
    fireEvent.change(screen.getByLabelText(/search/i), {
      target: { value: 'coffee' }
    });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    // Vérifier les résultats
    await waitFor(() => {
      expect(screen.getByText('Coffee Shop')).toBeInTheDocument();
      expect(mockedTransactionService.searchTransactions).toHaveBeenCalledWith({
        searchTerm: 'coffee',
      });
    });
  });
});
```

## 📋 Patterns et conventions

### Structure d'un test d'intégration

```typescript
describe('ComponentName Integration', () => {
  // Setup helpers
  const renderWithProviders = (props = {}) => {
    return render(
      <Provider store={testStore}>
        <MemoryRouter>
          <ComponentName {...defaultProps} {...props} />
        </MemoryRouter>
      </Provider>
    );
  };

  // Tests de workflow complets
  describe('Complete User Workflows', () => {
    it('completes end-to-end user action', async () => {
      // Arrange - Setup initial state
      // Act - Perform user actions
      // Assert - Verify final state
    });
  });

  // Tests d'interaction entre composants
  describe('Component Interactions', () => {
    it('parent and child communicate correctly', async () => {
      // Test communication props/events
    });
  });

  // Tests avec données asynchrones
  describe('Async Data Flows', () => {
    it('handles loading and error states', async () => {
      // Test états de chargement et erreurs
    });
  });
});
```

### Conventions de nommage

- **Fichiers** : `ComponentName.integration.test.tsx`
- **Suites** : `describe('ComponentName Integration', () => {})`
- **Tests** : `it('completes [workflow description]', async () => {})`

### Helpers réutilisables

#### Provider wrapper

```typescript
const createTestWrapper = (initialState = {}) => {
  const testStore = createTestStore(initialState);

  return ({ children }: { children: React.ReactNode }) => (
    <Provider store={testStore}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </Provider>
  );
};
```

#### Custom render

```typescript
const renderWithContext = (
  component: React.ReactElement,
  options: RenderOptions = {},
) => {
  return render(component, {
    wrapper: createTestWrapper(),
    ...options,
  });
};
```

## 🔧 Mocking strategies

### Services API

```typescript
// Mock complet du module
vi.mock("../../services/apiService", () => ({
  fetchUserData: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock partiel
vi.mock("../../services/apiService", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchUserData: vi.fn(), // Mock seulement cette fonction
  };
});
```

### Store Redux

```typescript
// Store de test avec état initial
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Désactiver pour les tests
      }),
  });
};
```

### Navigation

```typescript
// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: "/test" }),
  };
});
```

## 📊 Tests d'intégration existants

### Pages principales

- ✅ `SignIn.integration.test.tsx`

  - Flux d'authentification complet
  - Gestion des erreurs
  - Redirection après connexion

- ✅ `User.integration.test.tsx`

  - Sélection de comptes
  - Filtrage de transactions
  - Pagination
  - Gestion des tokens d'authentification

- ✅ `Home.integration.test.tsx`
  - Navigation entre sections
  - Interaction avec les fonctionnalités

### Composants complexes

- ✅ `TransactionSearch.integration.test.tsx`

  - Recherche avec filtres
  - Pagination des résultats
  - États de chargement

- ✅ `EditUserForm.integration.test.tsx`
  - Validation de formulaire
  - Soumission et gestion d'erreurs
  - Mise à jour du store

## 🎯 Scénarios de test types

### Flux d'authentification

1. **Connexion réussie**

   - Saisie des identifiants
   - Soumission du formulaire
   - Redirection vers dashboard
   - Mise à jour du state global

2. **Gestion d'erreurs**
   - Identifiants incorrects
   - Problèmes réseau
   - Token expiré

### Gestion des données

1. **Chargement initial**

   - Fetch des données utilisateur
   - Affichage des comptes
   - Chargement des transactions

2. **Interactions utilisateur**
   - Sélection de compte
   - Recherche de transactions
   - Pagination
   - Mise à jour des données

## 🚀 Commandes utiles

```bash
# Tests d'intégration seulement
pnpm test -- --grep="integration"

# Test d'intégration spécifique
pnpm test -- User.integration.test.tsx

# Avec coverage pour l'intégration
pnpm test -- --coverage --grep="integration"

# Mode watch pour développement
pnpm test:watch -- --grep="integration"
```

## 📝 Checklist pour nouveaux tests

### Planification

- [ ] Identifier le workflow à tester
- [ ] Définir l'état initial nécessaire
- [ ] Lister les interactions utilisateur
- [ ] Prévoir les assertions finales

### Implémentation

- [ ] Setup correct des providers
- [ ] Mocking approprié des dépendances
- [ ] Actions utilisateur réalistes
- [ ] Attentes asynchrones gérées

### Validation

- [ ] Test reproduit un cas d'usage réel
- [ ] Pas de over-testing (redondance avec tests unitaires)
- [ ] Robuste aux changements d'implémentation
- [ ] Temps d'exécution raisonnable

## 🔗 Liens avec autres tests

### Complémentarité

- **Tests unitaires** : Logique isolée
- **Tests d'intégration** : Workflows complets ← **Vous êtes ici**
- **Tests E2E (Cypress)** : Interface utilisateur réelle

### Coordination

- Éviter la duplication entre types de tests
- Focus sur les interactions entre modules
- Tester les cas limites du workflow

---

**Étape suivante** : [Architecture des tests](./TEST_ARCHITECTURE.md)
