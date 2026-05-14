/** @format */

// cypress/e2e/auth/login.cy.ts

// Import of common User interface
import type { User } from "../../support/types";

describe("Authentication", () => {
  it("should allow a user to sign in with valid credentials", () => {
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

      cy.visitWithBypass("/signin");
      cy.injectAxe();
      cy.checkA11y();
      cy.smartLogin(validUser.email, validUser.password, { timeout: 20000 });
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("be.visible");
      cy.window().then((win) => {
        const token =
          win.sessionStorage.getItem("authToken") ||
          win.localStorage.getItem("token");
        cy.wrap(token).should("be.a", "string").and("not.be.empty");
      });
      cy.checkA11y();
    });
  });

  it("should display an error message with invalid credentials", () => {
    cy.fixture<User[]>("users.json").then((usersData) => {
      const invalidUser = usersData.find((user) => user.type === "invalid");
      if (!invalidUser || !invalidUser.email || !invalidUser.password) {
        throw new Error(
          "Invalid user not found or missing information (email, password) in fixtures for invalid credentials test.",
        );
      }
      cy.visitWithBypass("/signin");
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
    cy.visitWithBypass("/signin");
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
