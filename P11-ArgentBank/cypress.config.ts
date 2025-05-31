/** @format */

import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000", // Port Vercel dev server (nécessaire pour les fonctions serverless)
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
    apiUrl: "http://localhost:3001/api/v1",
  },
});
