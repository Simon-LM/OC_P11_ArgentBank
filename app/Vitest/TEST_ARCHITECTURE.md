<!-- @format -->

# Architecture des Tests - Vitest

## 🏗️ Vue d'ensemble de l'architecture

Cette documentation décrit l'organisation, les conventions et les patterns utilisés pour les tests dans le projet ArgentBank.

## 📁 Structure des fichiers

### Principe de co-localisation

Les tests sont placés à côté des fichiers qu'ils testent pour faciliter la maintenance :

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx                    # Composant
│   │   ├── Button.test.tsx               # Tests unitaires
│   │   ├── Button.integration.test.tsx   # Tests d'intégration (si applicable)
│   │   └── button.module.scss            # Styles
│   └── ...
├── pages/
│   ├── User/
│   │   ├── User.tsx                      # Page
│   │   ├── User.test.tsx                 # Tests unitaires
│   │   ├── User.integration.test.tsx     # Tests d'intégration
│   │   └── user.module.scss              # Styles
│   └── ...
├── utils/
│   ├── authService.ts                    # Utilitaire
│   ├── authService.test.ts               # Tests unitaires
│   └── ...
└── store/
    ├── slices/
    │   ├── usersSlice.ts                 # Slice Redux
    │   ├── usersSlice.test.ts            # Tests unitaires
    │   └── ...
    └── Store.test.ts                     # Tests du store
```

## 🎯 Types de tests et responsabilités

### Tests Unitaires (`*.test.tsx`)

**Responsabilité** : Tester une unité isolée

- ✅ Rendu des composants
- ✅ Props et leur impact
- ✅ Événements utilisateur simples
- ✅ Logique métier pure
- ✅ Fonctions utilitaires
- ❌ Interactions entre composants
- ❌ Appels API réels
- ❌ Navigation complexe

### Tests d'Intégration (`*.integration.test.tsx`)

**Responsabilité** : Tester l'interaction entre modules

- ✅ Workflows utilisateur complets
- ✅ Communication Redux + Composants
- ✅ Interactions avec services API (mockés)
- ✅ Navigation entre pages
- ✅ Gestion d'état complexe
- ❌ Interface utilisateur réelle
- ❌ Appels réseau réels

## 🔧 Configuration et setup

### Configuration Vitest

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    css: true,
    coverage: {
      reporter: ["text", "html", "json"],
      exclude: [
        "node_modules/",
        "src/setupTests.ts",
        "**/*.d.ts",
        "**/*.config.*",
      ],
    },
  },
});
```

### Setup global

```typescript
// src/setupTests.ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock des APIs globales
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));
```

## 📋 Conventions de nommage

### Fichiers de test

```
ComponentName.test.tsx           # Tests unitaires
ComponentName.integration.test.tsx  # Tests d'intégration
utilityFunction.test.ts          # Tests de fonctions
hookName.test.ts                 # Tests de hooks
```

### Structure des suites de test

```typescript
describe("ComponentName", () => {
  // Groupe logique 1
  describe("Rendering", () => {
    it("renders without crashing", () => {});
    it("displays correct content when props change", () => {});
  });

  // Groupe logique 2
  describe("User Interactions", () => {
    it("calls callback when button is clicked", () => {});
    it("updates state when input changes", () => {});
  });

  // Groupe logique 3
  describe("Edge Cases", () => {
    it("handles empty data gracefully", () => {});
    it("shows error message when API fails", () => {});
  });
});
```

### Nommage des tests

```typescript
// ✅ Bon : Descriptif et comportemental
it("displays error message when email is invalid", () => {});
it("redirects to dashboard after successful login", () => {});
it("disables submit button while request is pending", () => {});

// ❌ Éviter : Trop technique ou vague
it("test button click", () => {});
it("should work correctly", () => {});
it("component renders", () => {});
```

## 🛠️ Patterns et utilitaires

### Helpers de rendu

```typescript
// test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';

// Store de test configurable
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Wrapper avec tous les providers
export const AllProviders: React.FC<{
  children: React.ReactNode;
  initialState?: any;
  initialPath?: string;
}> = ({ children, initialState = {}, initialPath = '/' }) => {
  const store = createTestStore(initialState);

  return (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialPath]}>
        {children}
      </MemoryRouter>
    </Provider>
  );
};

// Render custom avec providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options: {
    initialState?: any;
    initialPath?: string;
    renderOptions?: Omit<RenderOptions, 'wrapper'>;
  } = {}
) => {
  const { initialState, initialPath, renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AllProviders initialState={initialState} initialPath={initialPath}>
      {children}
    </AllProviders>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};
```

### Factory functions pour les données de test

```typescript
// test-factories.ts
export const createMockUser = (overrides = {}) => ({
  id: "1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  userName: "johndoe",
  ...overrides,
});

export const createMockAccount = (overrides = {}) => ({
  id: "1",
  type: "Checking",
  accountNumber: "12345",
  balance: 1000.0,
  ...overrides,
});

export const createMockTransaction = (overrides = {}) => ({
  id: "1",
  description: "Test Transaction",
  amount: -25.5,
  date: "2025-05-29",
  type: "DEBIT",
  category: "Food",
  ...overrides,
});
```

### Matchers personnalisés

```typescript
// custom-matchers.ts
export const customMatchers = {
  toBeLoadingState: (received: any) => {
    const pass = received.status === "loading";
    return {
      message: () =>
        `expected ${received} ${pass ? "not " : ""}to be in loading state`,
      pass,
    };
  },

  toHaveFormError: (received: HTMLElement, fieldName: string) => {
    const errorElement = received.querySelector(
      `[data-testid="${fieldName}-error"]`,
    );
    const pass = errorElement !== null;
    return {
      message: () =>
        `expected form ${pass ? "not " : ""}to have error for field ${fieldName}`,
      pass,
    };
  },
};
```

## 🎭 Stratégies de mocking

### Hiérarchie des mocks

1. **Mock minimal** : Seulement ce qui est nécessaire
2. **Mock par défaut** : Comportement standard
3. **Mock spécifique** : Cas particuliers par test

### Modules externes

```typescript
// Mock d'une librairie complète
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(() => ({ pathname: '/test' })),
  MemoryRouter: ({ children }: any) => children,
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

// Mock partiel (garde le reste fonctionnel)
vi.mock('../../services/apiService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    fetchUserData: vi.fn(),
  };
});
```

### Services et API

```typescript
// Mock de service avec différents états
const mockApiService = {
  fetchUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
};

// Setup pour succès
mockApiService.fetchUser.mockResolvedValue(createMockUser());

// Setup pour erreur
mockApiService.fetchUser.mockRejectedValue(new Error("Network error"));
```

## 📊 Métriques et couverture

### Objectifs de couverture

- **Statements** : 90%+
- **Branches** : 85%+
- **Functions** : 90%+
- **Lines** : 90%+

### Exclusions de couverture

```typescript
// vitest.config.ts
coverage: {
  exclude: [
    'node_modules/',
    'src/setupTests.ts',
    '**/*.d.ts',
    '**/*.config.*',
    'src/main.tsx',
    'src/vite-env.d.ts',
    // Fichiers de types seulement
    'src/types/',
    // Fichiers de configuration
    '**/constants.ts',
  ],
}
```

### Seuils par type de fichier

- **Composants** : 85%+ (UI peut avoir des branches complexes)
- **Utilitaires** : 95%+ (Logique pure)
- **Services** : 90%+ (Gestion d'erreurs)
- **Stores** : 85%+ (Actions complexes)

## 🔄 Workflow de développement

### Cycle TDD recommandé

1. **Red** : Écrire un test qui échoue
2. **Green** : Écrire le code minimal pour passer
3. **Refactor** : Améliorer sans casser les tests

### Intégration CI/CD

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: pnpm test

- name: Check coverage
  run: pnpm test -- --coverage --reporter=json

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 🚀 Performance des tests

### Optimisations

```typescript
// Groupement des imports
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Setup/teardown optimisé
describe("Component", () => {
  let mockFn: MockedFunction<any>;

  beforeEach(() => {
    mockFn = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});
```

### Parallélisation

```typescript
// vitest.config.ts
test: {
  pool: 'threads',
  poolOptions: {
    threads: {
      singleThread: false,
    },
  },
}
```

## 📝 Checklist qualité

### Pour chaque nouveau test

- [ ] Nom descriptif et clair
- [ ] Une responsabilité par test
- [ ] Setup minimal nécessaire
- [ ] Assertions spécifiques
- [ ] Cleanup approprié
- [ ] Pas de dépendances entre tests

### Pour chaque composant testé

- [ ] Tests unitaires pour la logique
- [ ] Tests d'intégration pour les workflows
- [ ] Couverture des cas d'erreur
- [ ] Tests des props obligatoires
- [ ] Tests d'accessibilité de base

## 🔗 Integration with other tools

### Avec les autres types de tests

- **Lighthouse** : Performance après tests fonctionnels
- **Axe** : Accessibilité validée par les tests
- **Pa11y** : Complément d'accessibilité
- **Cypress** : E2E après validation unitaire/intégration

### Avec les outils de développement

- **ESLint** : Règles pour les tests
- **Prettier** : Formatage uniforme
- **TypeScript** : Typage strict des tests

---

**Navigation** : [Tests unitaires](./UNIT_TESTS.md) | [Tests d'intégration](./INTEGRATION_TESTS.md) | [Configuration](./CONFIGURATION.md)
