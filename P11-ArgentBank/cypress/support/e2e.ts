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

// Configuration globale pour contourner la protection Vercel en CI
const isCI = Cypress.env("CI") === "true" || Cypress.env("CI") === true;
const vercelBypassSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");

if (isCI && vercelBypassSecret) {
  beforeEach(() => {
    // Intercepter toutes les requêtes pour ajouter les headers de contournement Vercel
    cy.intercept("**", (req) => {
      req.headers["x-vercel-protection-bypass"] = vercelBypassSecret;
      req.headers["x-vercel-set-bypass-cookie"] = "true";
    });
  });
}

// Optionnel : si vous voulez que cy.injectAxe() soit appelé automatiquement avant chaque test
// beforeEach(() => {
//   cy.injectAxe();
// });
