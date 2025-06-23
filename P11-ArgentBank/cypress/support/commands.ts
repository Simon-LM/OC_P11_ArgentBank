/** @format */

/// <reference types="cypress" />
// ***********************************************
// Custom commands for ArgentBank application
// ***********************************************

import type { User } from "./types";

// Track login attempts to prevent rate limiting
let lastLoginAttempt = 0;
const MIN_LOGIN_INTERVAL = 2000; // 2 seconds minimum between login attempts

/**
 * Smart login command with rate limiting protection
 * This command includes delays and retry logic to prevent API rate limiting
 */
Cypress.Commands.add(
  "smartLogin",
  (email: string, password: string, options: { timeout?: number } = {}) => {
    const now = Date.now();
    const timeSinceLastLogin = now - lastLoginAttempt;

    // If not enough time has passed, wait
    if (timeSinceLastLogin < MIN_LOGIN_INTERVAL) {
      const waitTime = MIN_LOGIN_INTERVAL - timeSinceLastLogin;
      cy.wait(waitTime);
    }

    lastLoginAttempt = Date.now();

    // Add Vercel bypass header in CI environment
    const isCI = Cypress.env("CI");
    const vercelSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");

    if (isCI && vercelSecret) {
      cy.intercept("POST", "/api/user/login", (req) => {
        req.headers["x-vercel-protection-bypass"] = vercelSecret;
      }).as("loginWithBypass");
    }

    // Intercept login requests to handle rate limiting
    cy.intercept("POST", "/api/user/login", (req) => {
      // Add delay to prevent rapid requests
      return new Promise((resolve) => {
        setTimeout(() => resolve(req.continue()), 500);
      });
    }).as("loginRequest");

    // Navigate to signin if not already there
    cy.url().then((url) => {
      if (!url.includes("/signin")) {
        cy.visit("/signin");
      }
    });

    // Perform login with robust selectors
    cy.get('[data-cy="email-input"], input#email', { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type(email, { delay: 50 });

    cy.get('[data-cy="password-input"], input#password', { timeout: 10000 })
      .should("be.visible")
      .clear()
      .type(password, { delay: 50 });

    cy.get('[data-cy="login-button"], form button:contains("Connect")', {
      timeout: 10000,
    })
      .should("be.visible")
      .click();

    // Wait for login request and handle potential rate limiting
    cy.wait("@loginRequest", { timeout: options.timeout || 15000 }).then(
      (interception) => {
        if (interception.response?.statusCode === 429) {
          // If rate limited, wait and retry once
          cy.wait(3000);
          cy.get(
            '[data-cy="login-button"], form button:contains("Connect")',
          ).click();
          cy.wait("@loginRequest", { timeout: 15000 });
        }
      },
    );

    // Verify successful login
    cy.url({ timeout: 15000 }).should("include", "/user");
  },
);

/**
 * Login with session persistence to avoid repeated logins
 */
Cypress.Commands.add(
  "loginWithSession",
  (
    user: User,
    options: { sessionId?: string; cacheAcrossSpecs?: boolean } = {},
  ) => {
    // Create unique session ID based on user and optional identifier
    const baseSessionKey = `user-${user.email}`;
    const sessionKey = options.sessionId
      ? `${baseSessionKey}-${options.sessionId}`
      : baseSessionKey;
    const cacheAcrossSpecs = options.cacheAcrossSpecs ?? false; // Default to false for safety

    cy.session(
      sessionKey,
      () => {
        if (user.email && user.password) {
          cy.smartLogin(user.email, user.password);
          // Verify we're logged in
          cy.url().should("include", "/user");
          // Store session info
          cy.window().then((win) => {
            const token = win.localStorage.getItem("token");
            if (token) {
              cy.wrap(token).as("authToken");
            }
          });
        }
      },
      {
        validate: () => {
          // More robust validation: Check token and wait for authentication state
          cy.window().then((win) => {
            const token = win.sessionStorage.getItem("authToken");
            const expiresAt = win.sessionStorage.getItem("expiresAt");

            if (!token || !expiresAt) {
              throw new Error(
                "Session validation failed: Missing authentication data",
              );
            }

            const now = Date.now();
            const expiry = parseInt(expiresAt, 10);
            if (now > expiry) {
              throw new Error("Session validation failed: Token expired");
            }
          });

          // Visit user page and wait for authentication to be processed
          cy.visit("/user");

          // Wait for either successful authentication (staying on /user) or redirect
          cy.url({ timeout: 10000 }).then((url) => {
            if (url.includes("/signin")) {
              throw new Error(
                "Session validation failed: Redirected to signin",
              );
            }
          });

          // Ensure we're on the user page
          cy.url().should("include", "/user");

          // Wait for page content to ensure authentication state is loaded
          cy.get(
            'h2[class*="user__title"], .user-title, [data-testid="user-title"]',
            { timeout: 10000 },
          ).should("be.visible");
        },
        cacheAcrossSpecs,
      },
    );
  },
);

/**
 * Enhanced visit command with Vercel bypass header
 */
Cypress.Commands.add(
  "visitWithBypass",
  (url: string, options: Partial<Cypress.VisitOptions> = {}) => {
    const isCI = Cypress.env("CI");
    const vercelSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");

    if (isCI && vercelSecret) {
      const headers = {
        "x-vercel-protection-bypass": vercelSecret,
        ...options.headers,
      };

      cy.visit(url, { ...options, headers });
    } else {
      cy.visit(url, options);
    }
  },
);

// Type declarations for custom Cypress commands
export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Smart login with rate limiting protection
       */
      smartLogin(
        email: string,
        password: string,
        options?: { timeout?: number },
      ): Chainable<Element> /**
       * Login with session persistence
       */;
      loginWithSession(
        user: User,
        options?: { sessionId?: string; cacheAcrossSpecs?: boolean },
      ): Chainable<Element>;

      /**
       * Visit with Vercel bypass header in CI
       */
      visitWithBypass(
        url: string,
        options?: Partial<Cypress.VisitOptions>,
      ): Chainable<Element>;
    }
  }
}
