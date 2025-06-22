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
    experimentalRunAllSpecs: true,
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
      // Configuration pour les tests d'accessibilité et le reporting
      // Note: Mochawesome sera configuré via les options du reporter
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
