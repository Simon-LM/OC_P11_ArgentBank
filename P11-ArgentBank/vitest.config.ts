/** @format */

/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom", // Uses jsdom to simulate the browser
    globals: true, // Allows using globals like describe, it, expect without importing
    setupFiles: "./src/setupTests.ts", // Path to your test configuration file
    // MODIFIED: Specifically targets the __tests__ folder AND co-located test files
    include: [
      "__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", // Added for co-located tests in src
      // Add other paths here if your co-located tests are elsewhere, for example:
      // "api/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    typecheck: {
      tsconfig: "./tsconfig.json",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "clover", "json-summary"],
      reportsDirectory: "./coverage",
      // Coverage thresholds - Quality gates for deployment
      // Banking app = Critical project → High coverage required
      thresholds: {
        statements: 95, // Critical: 95%+ recommended for banking
        branches: 90, // High: All decision paths tested
        functions: 90, // High: All functions tested (increased from 85%)
        lines: 95, // Critical: 95%+ recommended for banking
      },
      exclude: [
        "api/lib/blacklist.js",
        "src/mockData/users.ts",
        "src/pages/user/user.module.scss.d.ts",
        "src/components/TransactionSearch/TransactionSearch.module.scss.d.ts",
        "src/pages/signIn/signin.module.scss.d.ts",
        "src/components/EditUserForm/editUserForm.module.scss.d.ts",
        "src/pages/error404/Error404.module.scss.d.ts",
        "src/types/aliases.d.ts",
        "src/types/declarations.d.ts",
        "src/vite-env.d.ts",
        "src/generated/prisma/**/*.d.ts",
        "src/generated/prisma/**/*.js",
        "src/prismaTest.ts",
        "src/prismaTest.js",
        "test-sql.js",
        "vite.config.ts",
        "vitest.config.ts",
        "eslint.config.js",
        "scripts/*.js",
        "dist/**",
        "my-react-app/src/data/**",
        "my-react-app/src/models/**",
        "prisma/seed.ts",
        "src/main.tsx",
        "src/App.tsx",
        "src/pages/**/index.tsx",
        "src/components/**/index.tsx",
        "src/index.tsx",
        // Exclusion des dossiers de tests d'accessibilité et performance
        "**/Axe/**",
        "**/Pa11y/**",
        "**/Pa11y-old/**",
        "**/lighthouse/**",
        "**/.vscode/**",
        "**/coverage/**",
        "**/Maquette/**",
        "**/certs/**",
        "**/public/**",
        // Exclusions spécifiques pour les fichiers d'accessibilité (toutes extensions)
        "**/pa11y-auth.*",
        "**/pa11y-ci.config.*",
        "**/run-pa11y-tests.*",
        "**/axe-setup.*",
        "**/axe-reporter.*",
        "**/lighthouse-*.*",
        "**/test-debug.*",
        "**/update-port.*",
        "**/validate-setup.*",
        "**/analyze-performance.*",
        "**/lighthouse-analyzer.*",
        "**/lighthouse-auth-v2.*",
        "**/lighthouse-regression.*",
        // Exclusions spécifiques pour src/utils (fichiers d'accessibilité)
        "src/utils/axe-setup.*",
        "src/utils/pa11y-*",
        "src/utils/lighthouse-*",
        "**/lighthouse-global-report.*",
        "**/lighthouse-runner.*",
        "**/lighthouse-test-suite.*",
        // Exclusion des fichiers TypeScript auto-générés (.d.ts)
        "**/*.module.scss.d.ts",
        "**/*.module.css.d.ts",
        "src/pages/sitemap/sitemap.module.scss.d.ts",
        "src/pages/error404/Error404.module.css.d.ts",
        // Exclusion complète des dossiers Cypress (tests e2e)
        "**/cypress/**",
        "cypress/**",
        "cypress.config.ts",
        // Exclusion des fichiers de support et configuration
        "**/cypress/support/**",
        "**/cypress/e2e/**",
        "**/cypress/reports/**",
        "**/cypress/fixtures/**",
      ],
    },
  },
});
