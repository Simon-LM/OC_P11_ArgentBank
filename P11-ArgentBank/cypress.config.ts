/** @format */

import { defineConfig } from "cypress";

// Détection de l'environnement
const isCI = process.env.CI === "true";
const baseUrl = process.env.CYPRESS_BASE_URL || "http://localhost:3000";

// Configuration API adaptative
const getApiUrl = () => {
  if (isCI && process.env.CYPRESS_BASE_URL) {
    // En CI : utilise l'URL Preview + /api (sans /v1 car la structure est /api directement)
    return `${process.env.CYPRESS_BASE_URL}/api`;
  }
  // En local : utilise l'URL locale avec le bon port
  return "http://localhost:3000/api";
};

console.log(`Cypress Config - Environment: ${isCI ? "CI" : "Local"}`);
console.log(`Cypress Config - Base URL: ${baseUrl}`);
console.log(`Cypress Config - API URL: ${getApiUrl()}`);

export default defineConfig({
  e2e: {
    baseUrl: baseUrl,
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: false, // Disable parallel execution to prevent rate limiting
    // Rate limiting protection
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    // Retry configuration
    retries: {
      runMode: 2, // Retry failed tests in CI
      openMode: 0, // No retries in interactive mode
    },
    // Configuration du reporter pour les tests d'accessibilité
    reporter: "mochawesome",
    reporterOptions: {
      reportDir: "cypress/reports",
      overwrite: false,
      html: true,
      json: true,
      timestamp: "mmddyyyy_HHMMss",
    },
    setupNodeEvents(on, config) {
      // Add rate limiting between spec files
      on("before:run", () => {
        console.log("Starting Cypress tests with rate limiting protection");
      });

      on("after:spec", (_spec, _results) => {
        // Add delay between spec files to prevent rate limiting
        return new Promise((resolve) => {
          const delayMs = isCI ? 3000 : 1000; // 3s in CI, 1s locally
          console.log(
            `Waiting ${delayMs}ms before next spec to prevent rate limiting...`,
          );
          setTimeout(resolve, delayMs);
        });
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "cypress/components/**/*.cy.{js,jsx,ts,tsx}",
  },
  env: {
    apiUrl: getApiUrl(),
    // Variables d'environnement pour CI/CD
    CI: process.env.CI,
    VERCEL_AUTOMATION_BYPASS_SECRET:
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
  },
});
