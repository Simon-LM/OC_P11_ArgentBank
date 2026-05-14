/** @format */

// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Import Testing Library
import "@testing-library/cypress/add-commands";

// Import Cypress Axe
import "cypress-axe";

// Import Cypress Real Events
import "cypress-real-events/support";

// Import Mochawesome Reporter
import "cypress-mochawesome-reporter/register";

// 🔐 Configuration globale pour CI/CD - Headers de bypass Vercel
// Cette configuration résout le problème d'accès aux URLs Vercel Preview protégées
beforeEach(() => {
  // Détection de l'environnement CI/CD
  const isCI = Cypress.env("CI") === "true" || Cypress.env("CI") === true;
  const bypassSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");

  if (isCI && bypassSecret) {
    console.log("🔐 [Cypress CI/CD] Configuring Vercel bypass headers...");

    // Intercepter TOUTES les requêtes pour ajouter les headers de bypass
    cy.intercept("**", (req) => {
      // Ajouter le header de bypass Vercel (même approche que Pa11y)
      req.headers["x-vercel-protection-bypass"] = bypassSecret;

      // Log pour debugging (masquer le secret)
      console.log(`🔐 [Cypress CI/CD] Adding bypass header to: ${req.url}`);
    });

    console.log(
      "✅ [Cypress CI/CD] Vercel bypass headers configured successfully",
    );
  } else if (isCI && !bypassSecret) {
    console.warn(
      "⚠️ [Cypress CI/CD] Running in CI but VERCEL_AUTOMATION_BYPASS_SECRET not found",
    );
  } else {
    console.log(
      "🏠 [Cypress Local] Running locally - no bypass headers needed",
    );
  }

  // Injecter axe automatiquement (optionnel - décommenté pour tests d'accessibilité)
  cy.injectAxe();
});

// Optionnel : si vous voulez que cy.injectAxe() soit appelé automatiquement avant chaque test
// beforeEach(() => {
//   cy.injectAxe();
// });
