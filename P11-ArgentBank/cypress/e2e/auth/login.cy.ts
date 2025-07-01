/** @format */

// cypress/e2e/auth/login.cy.ts

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Authentification", () => {
  beforeEach(() => {
    cy.session("login-valid-user-session", () => {
      cy.fixture<User[]>("users.json").then((usersData) => {
        const validUser = usersData.find((user) => user.type === "valid");
        if (
          !validUser ||
          !validUser.email ||
          !validUser.password ||
          !validUser.userName
        ) {
          throw new Error(
            "Utilisateur valide non trouvé ou informations manquantes dans les fixtures.",
          );
        }
        cy.visit("/signin");
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
        );
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .click();
        cy.url().should("include", "/user");
        cy.get(".header__nav-item")
          .contains(validUser.userName)
          .should("be.visible");
        cy.window().then((win) => {
          const token =
            win.sessionStorage.getItem("authToken") ||
            win.localStorage.getItem("token");
          cy.wrap(token).should("be.a", "string").and("not.be.empty");
        });
      });
    });
    cy.visit("/user");
  });

  it("devrait permettre à un utilisateur de se connecter avec des identifiants valides", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
    // La session Cypress a déjà connecté l'utilisateur, il suffit de tester l'UI
    cy.get('[data-cy="login-button"], form').should("not.exist");
    cy.url().should("include", "/user");
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
    // Optionnel : vérifier le header si besoin
    // cy.get('.header__nav-item').should('be.visible');
  });

  it("devrait afficher un message d'erreur avec des identifiants invalides", () => {
    cy.fixture<User[]>("users.json").then((usersData) => {
      const invalidUser = usersData.find((user) => user.type === "invalid");
      if (!invalidUser || !invalidUser.email || !invalidUser.password) {
        throw new Error(
          "Utilisateur invalide non trouvé ou informations manquantes (email, password) dans les fixtures pour le test d'identifiants invalides.",
        );
      }
      cy.visit("/signin");
      cy.injectAxe();
      cy.checkA11y(undefined, {
        rules: { "color-contrast": { enabled: false } },
      });
      cy.get('[data-cy="email-input"], input#email').type(invalidUser.email);
      cy.get('[data-cy="password-input"], input#password').type(
        invalidUser.password,
      );
      cy.get('[data-cy="login-button"], form')
        .contains("button", "Connect")
        .click();
      cy.url().should("not.include", "/user");
      cy.url().should("include", "/signin");
      cy.get("#error-message")
        .should("be.visible")
        .and("contain.text", "Invalid email or password");
      cy.checkA11y(undefined, {
        rules: { "color-contrast": { enabled: false } },
      });
    });
  });
  it("devrait être accessible sur la page de connexion", () => {
    cy.visit("/signin");
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
    // Tester l'accessibilité avec focus sur les champs de formulaire
    cy.get("input#email").focus();
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
    cy.get("input#password").focus();
    cy.checkA11y(undefined, {
      rules: { "color-contrast": { enabled: false } },
    });
  });

  // Le test de déconnexion a été déplacé dans cypress/e2e/auth/logout.cy.ts
});
