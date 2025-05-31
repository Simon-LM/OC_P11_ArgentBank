<!-- @format -->

# Configuration Vitest - ArgentBank

## 🔧 Configuration principale

### vitest.config.ts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts", // Chemin vers le fichier de configuration des tests
    coverage: {
      provider: "v8", // ou 'istanbul'
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage", // Répertoire de sortie des rapports
      include: ["src/**/*.{ts,tsx}"], // Fichiers à inclure dans la couverture
      exclude: [
        // Fichiers à exclure de la couverture
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.test.{ts,tsx}",
        "src/setupTests.ts",
        "src/generated/**/*", // Exclure les fichiers générés
        "src/mockData/**/*", // Exclure les données mockées
        "src/types/**/*", // Exclure les définitions de types
      ],
      all: true, // Afficher la couverture pour tous les fichiers, même non testés
    },
  },
});
```

## 🛠️ Setup des tests

### src/setupTests.ts

```typescript
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock des APIs Web non disponibles dans jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Déprécié
    removeListener: vi.fn(), // Déprécié
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock de ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock de fetch pour les tests
global.fetch = vi.fn();

// Mock du sessionStorage
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn((index) => null),
    length: 0,
  },
  writable: true,
});

// Mock du localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn((index) => null),
    length: 0,
  },
  writable: true,
});

// Mock de window.location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    // Ajoutez d'autres propriétés et méthodes de location si nécessaire
    // Exemple : search, pathname, hash, etc.
    search: "",
    pathname: "/",
    hash: "",
  },
  writable: true,
});

// Suppression des console.error pendant les tests sauf si explicitement activé
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Permet de logger les erreurs si une variable d'environnement est définie
    if (process.env.LOG_CONSOLE_ERRORS) {
      originalError(...args);
    }
  };
});

afterAll(() => {
  console.error = originalError;
});
```

## 📦 Dépendances de test

### package.json (devDependencies)

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/user-event": "^14.5.2",
    "@types/jest": "^29.5.12",
    "@vitejs/plugin-react-swc": "^3.6.0",
    "@vitest/coverage-v8": "^1.3.1",
    "eslint-plugin-vitest": "^0.3.25",
    "jsdom": "^24.0.0",
    "msw": "^2.2.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.3.3",
    "vite": "^5.1.4",
    "vitest": "^1.3.1"
  }
}
```

### Installation

```bash
pnpm add -D @testing-library/jest-dom @testing-library/react @testing-library/user-event @vitest/coverage-v8 jsdom vitest
```

## 🎯 Scripts de test

### package.json (scripts)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Commandes avancées

```bash
# Tests avec pattern spécifique
pnpm test -- --grep="Button"

# Tests d'un seul fichier
pnpm test -- User.test.tsx

# Tests avec timeout augmenté
pnpm test -- --testTimeout=10000

# Tests en mode verbose
pnpm test -- --reporter=verbose

# Tests avec retry
pnpm test -- --retry=2
```

## 🔍 Configuration des matchers

### Matchers Jest-DOM

```typescript
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Exemple d'utilisation dans un test :
// import { render, screen } from '@testing-library/react';
// import MyComponent from './MyComponent';

// it('should be visible', () => {
//   render(<MyComponent />);
//   expect(screen.getByText('Hello')).toBeVisible();
// });
```
