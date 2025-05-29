<!-- @format -->

# Guide des Tests Unitaires - Vitest

## 🎯 Objectif

Les tests unitaires vérifient le comportement isolé des composants, fonctions et classes. Ils testent une unité de code de manière indépendante, sans dépendances externes.

## 📂 Localisation

Les tests unitaires sont nommés `*.test.tsx` ou `*.test.ts` et placés à côté du fichier testé :

```
src/components/Button/
├── Button.tsx
├── Button.test.tsx          # ← Tests unitaires ici
└── button.module.scss
```

## 🧪 Types de tests unitaires

### 1. Tests de composants React

#### Exemple basique

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const mockClick = vi.fn();
    render(<Button onClick={mockClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(mockClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Tests de fonctions utilitaires

#### Exemple

```typescript
// formatCurrency.test.ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
	it("formats positive numbers correctly", () => {
		expect(formatCurrency(1234.56)).toBe("1,234.56 €");
	});

	it("formats negative numbers correctly", () => {
		expect(formatCurrency(-1234.56)).toBe("-1,234.56 €");
	});

	it("handles zero", () => {
		expect(formatCurrency(0)).toBe("0.00 €");
	});
});
```

### 3. Tests de hooks personnalisés

#### Exemple

```typescript
// useAuth.test.ts
import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useAuth } from "./useAuth";

describe("useAuth Hook", () => {
	it("returns initial auth state", () => {
		const { result } = renderHook(() => useAuth());

		expect(result.current.isAuthenticated).toBe(false);
		expect(result.current.user).toBeNull();
	});
});
```

## 📋 Patterns et conventions

### Structure d'un test unitaire

```typescript
describe("ComponentName", () => {
	// Tests de rendu
	describe("Rendering", () => {
		it("renders without crashing", () => {
			// Test basique de rendu
		});

		it("displays correct content", () => {
			// Test du contenu affiché
		});
	});

	// Tests d'interaction
	describe("User Interactions", () => {
		it("handles user input", () => {
			// Test des interactions utilisateur
		});
	});

	// Tests de props
	describe("Props", () => {
		it("applies custom className", () => {
			// Test des props personnalisées
		});
	});

	// Tests de cas d'erreur
	describe("Error Cases", () => {
		it("handles invalid props gracefully", () => {
			// Test de gestion d'erreurs
		});
	});
});
```

### Conventions de nommage

- **Fichiers** : `ComponentName.test.tsx`
- **Suites** : `describe('ComponentName', () => {})`
- **Tests** : `it('should do something when condition', () => {})`

### Mocking patterns

#### Modules externes

```typescript
// Mock d'une librairie externe
vi.mock("react-router-dom", () => ({
	useNavigate: vi.fn(),
	useLocation: vi.fn(() => ({ pathname: "/test" })),
}));
```

#### Props avec fonctions

```typescript
const mockProps = {
	onSubmit: vi.fn(),
	onCancel: vi.fn(),
	isLoading: false,
};
```

## 🔧 Outils et utilitaires

### Testing Library

```typescript
import {
	render,
	screen,
	fireEvent,
	waitFor,
	within,
} from "@testing-library/react";
```

### Vitest assertions

```typescript
// Égalité
expect(value).toBe(expected);
expect(value).toEqual(expected);

// Vérifications DOM
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toHaveClass("className");

// Arrays et objets
expect(array).toContain(item);
expect(object).toHaveProperty("key");

// Fonctions mock
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
expect(mockFn).toHaveBeenCalledTimes(2);
```

## 📊 Tests existants par composant

### Composants principaux

- ✅ `Button.test.tsx` - Tests de base et interactions
- ✅ `EditUserForm.test.tsx` - Formulaire et validation
- ✅ `Feature.test.tsx` - Affichage et props
- ✅ `Features.test.tsx` - Liste et rendu multiple
- ✅ `TransactionSearch.test.tsx` - Recherche et filtres

### Pages

- ✅ `Home.test.tsx` - Rendu et navigation
- ✅ `SignIn.test.tsx` - Formulaire d'authentification
- ✅ `User.test.tsx` - Dashboard utilisateur
- ✅ `Error404.test.tsx` - Page d'erreur

### Utilitaires

- ✅ `authService.test.ts` - Services d'authentification
- ✅ `Store.test.ts` - Configuration Redux
- ✅ Slices Redux - Tests individuels

## 🎯 Objectifs de couverture

### Cibles par type

- **Composants React** : 90%+ de couverture
- **Fonctions utilitaires** : 95%+ de couverture
- **Hooks** : 85%+ de couverture
- **Services** : 90%+ de couverture

### Métriques actuelles

```bash
# Voir la couverture détaillée
pnpm test -- --coverage
```

## 🚀 Commandes utiles

```bash
# Tests unitaires seulement (exclut integration)
pnpm test -- --exclude="**/*.integration.test.*"

# Test spécifique
pnpm test -- Button.test.tsx

# Mode watch pour développement
pnpm test:watch

# Avec couverture
pnpm test -- --coverage
```

## 📝 Checklist pour nouveaux tests

### Avant d'écrire le test

- [ ] Identifier l'unité à tester
- [ ] Lister les comportements attendus
- [ ] Identifier les dépendances à mocker

### Pendant l'écriture

- [ ] Suivre la structure describe/it
- [ ] Noms descriptifs et clairs
- [ ] Un concept par test
- [ ] Assertions spécifiques

### Après l'écriture

- [ ] Tests passent individuellement
- [ ] Tests passent en suite
- [ ] Couverture satisfaisante
- [ ] Pas de faux positifs

## 🔗 Ressources

- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest API Reference](https://vitest.dev/api/)
- [React Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Prochaine étape** : [Tests d'intégration](./INTEGRATION_TESTS.md)
