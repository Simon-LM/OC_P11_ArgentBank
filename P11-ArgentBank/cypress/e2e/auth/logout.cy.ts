/** @format */

// cypress/e2e/auth/logout.cy.ts

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Déconnexion de l'utilisateur", () => {
  beforeEach(() => {
    cy.session("logout-valid-user-session", () => {
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
        cy.get("input#email").type(validUser.email);
        cy.get("input#password").type(validUser.password);
        cy.get("form").contains("button", "Connect").click();
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

  it("devrait permettre à un utilisateur de se déconnecter", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité de la page utilisateur avant déconnexion (ignorer les violations de contraste connues)
    cy.checkA11y();

    // Cliquer sur le bouton de déconnexion (Sign Out)
    // Le sélecteur cible le lien qui contient "Sign Out"
    cy.contains("Sign Out").click();

    // Vérifications après la déconnexion
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`); // Doit rediriger vers la page d'accueil, compatible local/CI
    cy.url().should("not.include", "/user"); // Ne doit plus être sur la page utilisateur

    // Test d'accessibilité de la page d'accueil après déconnexion (ignorer les violations de contraste connues)
    cy.checkA11y();

    // Vérifier que le lien "Sign In" est à nouveau visible
    cy.contains("Sign In").should("be.visible");

    // Vérifier que les éléments spécifiques à l'utilisateur connecté ne sont plus visibles
    // Par exemple, le nom d'utilisateur dans l'en-tête ou le lien "Sign Out"
    cy.fixture<User[]>("users.json").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.userName) {
        cy.get(".header__nav-item")
          .contains(validUser.userName)
          .should("not.exist");
      }
    });
    cy.contains("Sign Out").should("not.exist");
  });
  it("devrait être accessible sur la page utilisateur connectée", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité dédié pour la page utilisateur connectée (ignorer les violations de contraste connues)
    cy.checkA11y();

    // Tester l'accessibilité après focus sur les éléments de navigation
    cy.contains("Sign Out").focus();
    cy.checkA11y();
  });
});
