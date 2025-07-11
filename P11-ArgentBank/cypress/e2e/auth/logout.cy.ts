/** @format */

// cypress/e2e/auth/logout.cy.ts

// Import of common User interface
import type { User } from "../../support/types";

describe("User logout", () => {
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
            "Valid user not found or missing information in fixtures.",
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

  it("should allow a user to log out", () => {
    // Inject axe-core for accessibility tests
    cy.injectAxe();

    // Accessibility test of user page before logout (ignore known contrast violations)
    cy.checkA11y();

    // Click on logout button (Sign Out)
    // Selector targets the link containing "Sign Out"
    cy.contains("Sign Out").click();

    // Verifications after logout
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`); // Should redirect to home page, local/CI compatible
    cy.url().should("not.include", "/user"); // Should no longer be on user page

    // Accessibility test of home page after logout (ignore known contrast violations)
    cy.checkA11y();

    // Verify that "Sign In" link is visible again
    cy.contains("Sign In").should("be.visible");

    // Verify that logged-in user specific elements are no longer visible
    // For example, username in header or "Sign Out" link
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
  it("should be accessible on the logged-in user page", () => {
    // Inject axe-core for accessibility tests
    cy.injectAxe();

    // Dedicated accessibility test for logged-in user page (ignore known contrast violations)
    cy.checkA11y();

    // Test accessibility after focusing on navigation elements
    cy.contains("Sign Out").focus();
    cy.checkA11y();
  });
});
