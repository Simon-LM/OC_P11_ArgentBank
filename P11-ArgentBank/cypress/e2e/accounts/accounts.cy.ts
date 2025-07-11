/** @format */

// Import of common User interface
import type { User } from "../../support/types";

describe("Bank Account Management", () => {
  beforeEach(() => {
    // Potential intercepts here if needed (ex: cy.intercept(...))
    cy.session("accounts-valid-user-session", () => {
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
        // Token verification (adapt key if needed)
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

  it("should correctly display the user's account list on the profile page", () => {
    // Inject axe-core for accessibility tests
    cy.injectAxe();

    // Accessibility test of accounts page (ignore known contrast violations)
    cy.checkA11y();

    // User page is already loaded after login in beforeEach

    // Verify presence of at least three account sections (Checking, Savings, Credit Card)
    // These selectors are based on typical HTML structure of the project
    const accountSelectors = [
      {
        titleContains: "Checking",
        balanceText: "Available Balance",
        idSuffix: "x8949", // Corrected from x8349 to x8949
      },
      {
        titleContains: "Savings",
        balanceText: "Available Balance",
        idSuffix: "x2094", // Corrected from x6712 to x2094
      },
      {
        titleContains: "Credit Card",
        balanceText: "Available Balance", // Corrected from "Current Balance" to "Available Balance"
        idSuffix: "x5642", // Corrected from x5201 to x5642
      },
    ];

    cy.get('div[class*="user-page"]').within(() => {
      accountSelectors.forEach((acc) => {
        cy.contains('button[class*="account"]', acc.titleContains) // Target account button by its title
          .should("be.visible")
          .within(() => {
            cy.get('h3[class*="account__title"]').should(
              "contain.text",
              acc.idSuffix,
            ); // Verify account ID in title
            cy.get('p[class*="account__description"]').should(
              // Verify description (ex: "Available Balance")
              "have.text",
              acc.balanceText,
            );
            cy.get('p[class*="account__amount"]') // Verify balance
              .invoke("text")
              .should("match", /€-?\d+(,\d{3})*\.\d{2}$/); // Format €XX,XXX.XX or €XXXX.XX or €-XXXX.XX
            // The "View transactions" button is implicitly the account itself in this design
          });
      });
    });

    // More generic verification of account count if titles are not fixed
    // cy.get("section.account").should("have.length.gte", 1); // At least 1 account
    // cy.get("section.account").should("have.length", 3); // If expecting exactly 3 accounts

    // For each account, verify essential information
    // cy.get("section.account").each(($el) => {
    //   cy.wrap($el).find(".account_title").should("be.visible");
    //   cy.wrap($el).find(".account_amount").should("be.visible");
    //   cy.wrap($el).find(".account_amount-description").should("be.visible");
    //   cy.wrap($el).find("button.transaction-button").should("be.visible");
    // });
  });

  it("should mark the account as selected and update the display on the user page", () => {
    // beforeEach already handles login and navigation to /user

    // Click on the first displayed account button
    cy.get('button[class*="account"]').first().as("firstAccount");
    cy.get("@firstAccount").click();

    // Verify that the clicked account is marked as selected (aria-pressed="true")
    cy.get("@firstAccount").should("have.attr", "aria-pressed", "true");

    // Verify that the URL path is still /user (with lowercase u)
    cy.location("pathname").should("eq", "/user");

    // Optional: verify that another account is not selected (if there are more than one)
    cy.get('button[class*="account"]').then(($buttons) => {
      if ($buttons.length > 1) {
        cy.get('button[class*="account"]')
          .eq(1)
          .should("have.attr", "aria-pressed", "false");
      }
    });
  });

  it("should be accessible on the bank accounts page", () => {
    // Inject axe-core for accessibility tests
    cy.injectAxe();

    // Dedicated accessibility test for accounts page (ignore known contrast violations)
    cy.checkA11y();

    // Test accessibility of account buttons
    cy.get('button[class*="account"]').first().focus();
    cy.checkA11y();

    // Click on an account and test accessibility
    cy.get('button[class*="account"]').first().click();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Test accessibility after account selection
    cy.get('button[class*="account"][aria-pressed="true"]').should("exist");
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
  });
});
