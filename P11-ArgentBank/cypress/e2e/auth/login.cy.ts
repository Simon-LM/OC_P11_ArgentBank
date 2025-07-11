/** @format */

// cypress/e2e/auth/login.cy.ts

// Import of common User interface
import type { User } from "../../support/types";

describe("Authentication", () => {
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
            "Valid user not found or missing information in fixtures.",
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

  it("should allow a user to sign in with valid credentials", () => {
    // Inject axe-core for accessibility tests
    cy.injectAxe();
    cy.checkA11y();
    // Cypress session has already logged in the user, just need to test the UI
    cy.get('[data-cy="login-button"], form').should("not.exist");
    cy.url().should("include", "/user");
    cy.checkA11y();
    // Optional: check header if needed
    // cy.get('.header__nav-item').should('be.visible');
  });

  it("should display an error message with invalid credentials", () => {
    cy.fixture<User[]>("users.json").then((usersData) => {
      const invalidUser = usersData.find((user) => user.type === "invalid");
      if (!invalidUser || !invalidUser.email || !invalidUser.password) {
        throw new Error(
          "Invalid user not found or missing information (email, password) in fixtures for invalid credentials test.",
        );
      }
      cy.visit("/signin");
      cy.injectAxe();
      cy.checkA11y();
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
      cy.checkA11y();
    });
  });
  it("should be accessible on the login page", () => {
    cy.visit("/signin");
    // Inject axe-core for accessibility tests
    cy.injectAxe();
    cy.checkA11y();
    // Test accessibility with focus on form fields
    cy.get("input#email").focus();
    cy.checkA11y();
    cy.get("input#password").focus();
    cy.checkA11y();
  });

  // The logout test has been moved to cypress/e2e/auth/logout.cy.ts
});
