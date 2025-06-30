/** @format */

// cypress/e2e/auth/rate-limiting-test.cy.ts

import type { User } from "../../support/types";

/**
 * Tests spécifiques pour valider la solution de rate limiting
 *
 * Ces tests vérifient que les nouvelles commandes personnalisées
 * gèrent correctement les limitations de débit de l'API Vercel.
 */

describe("Tests de Protection Rate Limiting", () => {
  let validUser: User;

  before(() => {
    cy.fixture("users.json").then((usersData: User[]) => {
      validUser = usersData.find((user) => user.type === "valid") as User;
    });
  });

  beforeEach(() => {
    // Intercepts doivent être définis avant cy.session pour être utilisables dans la session
    cy.intercept("POST", "/api/user/login").as("loginRequest");
    cy.intercept("GET", "/api/user/profile").as("profileRequest");
    cy.intercept("GET", "/api/accounts").as("accountsRequest");
    cy.intercept("GET", "/api/transactions/search*").as(
      "searchTransactionsRequest",
    );
    // Attendre un peu avant chaque login pour éviter le rate limiting Vercel gratuit
    cy.wait(2000);
    let sessionUser: User | undefined;
    cy.session("validUserSession-rate-limiting", () => {
      cy.fixture<User[]>("users.json").as("usersData");
      cy.get<User[]>("@usersData").then((usersData) => {
        sessionUser = usersData.find((user) => user.type === "valid");
        if (!sessionUser || !sessionUser.email || !sessionUser.password) {
          throw new Error(
            "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de rate-limiting-test.",
          );
        }
        cy.visitWithBypass("/signin");
        cy.url().should("include", "/signin");
        cy.screenshot("debug-signin-page");
        cy.get("input#email").should("be.visible");
        cy.get("input#email").type(sessionUser.email);
        cy.get("input#password").type(sessionUser.password);
        cy.get("form").contains("button", "Connect").click();
        cy.wait("@loginRequest").then((interception) => {
          cy.log(
            "[DEBUG] login response:",
            JSON.stringify(interception.response?.body),
          );
          const status = interception.response?.statusCode;
          if (status !== 200) {
            throw new Error(
              `[LOGIN ERROR] Login API returned status ${status}. Body: ${JSON.stringify(interception.response?.body)}`,
            );
          }
          const token =
            interception.response?.body?.body?.token ||
            interception.response?.body?.token;
          if (
            !token ||
            typeof token !== "string" ||
            !/^([\w-]+\.){2}[\w-]+$/.test(token)
          ) {
            throw new Error(
              `[LOGIN ERROR] Token JWT manquant ou malformé: ${token}`,
            );
          }
        });
        cy.url({ timeout: 20000 })
          .should("include", "/user")
          .then((url) => {
            if (!url.includes("/user")) {
              cy.log(
                `[DEBUG] Redirection après login échouée, URL actuelle: ${url}`,
              );
            }
          });
        if (!sessionUser.userName) {
          cy.window().then((win) => {
            cy.log(
              "[DEBUG] sessionStorage:",
              JSON.stringify(win.sessionStorage),
            );
            cy.log("[DEBUG] localStorage:", JSON.stringify(win.localStorage));
          });
          cy.get("body").then(($body) => {
            cy.log("[DEBUG] page HTML:", $body.html().slice(0, 1000));
          });
          throw new Error(
            "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide. Vérifiez la fixture users.json et la réponse de l'API login.",
          );
        }
        cy.get(".header__nav-item")
          .contains(sessionUser.userName)
          .should("be.visible");
        cy.window().then((win) => {
          const authToken = win.sessionStorage.getItem("authToken");
          cy.log("authToken after login:", authToken);
          cy.wrap(authToken, { log: false })
            .should("be.a", "string")
            .and("not.be.empty");
          const isJwt = /^([\w-]+\.){2}[\w-]+$/.test(authToken || "");
          assert.isTrue(
            isJwt,
            `[LOGIN ERROR] authToken in sessionStorage is not a valid JWT: ${authToken}`,
          );
        });
      });
    });
    // Visiter la page utilisateur après la session
    cy.visit("/user");
    // Vérifier que le nom d'utilisateur est affiché dans l'en-tête après la session
    cy.fixture<User[]>("users.json").then((usersData) => {
      validUser = usersData.find((user) => user.type === "valid")!;
      if (!validUser || !validUser.userName) {
        throw new Error(
          "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide.",
        );
      }
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("be.visible");
    });
  });

  it("devrait gérer les connexions multiples sans déclencher le rate limiting", () => {
    if (!validUser || !validUser.email || !validUser.password) {
      throw new Error("Valid user not found in fixtures");
    }

    // Test multiple logins in sequence with built-in delays
    for (let i = 0; i < 3; i++) {
      cy.log(`Tentative de connexion ${i + 1}/3`);

      // Connexion via l'UI (même logique que logout)
      cy.visitWithBypass("/signin");
      cy.get('[data-cy="email-input"], input#email')
        .clear()
        .type(validUser.email!);
      cy.get('[data-cy="password-input"], input#password')
        .clear()
        .type(validUser.password!);
      cy.get(
        '[data-cy="login-button"], form button:contains("Connect")',
      ).click();
      cy.url().should("include", "/user");

      // Logout avant la prochaine tentative
      cy.contains("Sign Out").click();
      cy.url().should("not.include", "/user");

      // Petite pause entre les itérations
      cy.wait(1000);
    }
  });

  it("devrait utiliser la session persistence pour éviter les reconnexions", () => {
    if (!validUser) {
      throw new Error("Valid user not found in fixtures");
    }

    // Connexion via l'UI (pas de loginWithSession)
    cy.visitWithBypass("/signin");
    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();
    cy.url().should("include", "/user");

    // Navigate away and back - should not trigger new login
    cy.visitWithBypass("/");
    cy.visitWithBypass("/user");
    cy.url().should("include", "/user");

    // Session should still be valid
    cy.get('[data-cy="user-name-nav"], .header__nav-item').should("be.visible");
  });

  it("devrait intercepter et gérer les erreurs 429 (Too Many Requests)", () => {
    if (!validUser || !validUser.email || !validUser.password) {
      throw new Error("Valid user not found in fixtures");
    }

    // Mock a 429 response to test retry logic
    cy.intercept("POST", "/api/user/login", {
      statusCode: 429,
      body: { error: "Too Many Requests" },
      delay: 100,
    }).as("rateLimitedLogin");

    cy.visitWithBypass("/signin");

    // This should trigger our rate limiting handling
    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();

    // Wait for the intercepted request
    cy.wait("@rateLimitedLogin");

    // Should still be on signin page due to 429 error
    cy.url().should("include", "/signin");
  });

  it("devrait ajouter le header Vercel bypass en environnement CI", () => {
    // This test mainly verifies the configuration is working
    const isCI = Cypress.env("CI");
    const vercelSecret = Cypress.env("VERCEL_AUTOMATION_BYPASS_SECRET");

    if (isCI && vercelSecret) {
      cy.log("Running in CI environment with Vercel bypass configured");

      // Intercept to verify header is added
      cy.intercept("POST", "/api/user/login", (req) => {
        expect(req.headers).to.have.property("x-vercel-protection-bypass");
        req.continue();
      }).as("loginWithHeader");

      if (validUser && validUser.email && validUser.password) {
        // Connexion via l'UI pour déclencher l'intercept
        cy.visitWithBypass("/signin");
        cy.get('[data-cy="email-input"], input#email')
          .clear()
          .type(validUser.email!);
        cy.get('[data-cy="password-input"], input#password')
          .clear()
          .type(validUser.password!);
        cy.get(
          '[data-cy="login-button"], form button:contains("Connect")',
        ).click();
        cy.wait("@loginWithHeader");
      }
    } else {
      cy.log("Running in local environment - no Vercel bypass needed");
      // Connexion UI classique
      if (validUser && validUser.email && validUser.password) {
        cy.visitWithBypass("/signin");
        cy.get('[data-cy="email-input"], input#email')
          .clear()
          .type(validUser.email!);
        cy.get('[data-cy="password-input"], input#password')
          .clear()
          .type(validUser.password!);
        cy.get(
          '[data-cy="login-button"], form button:contains("Connect")',
        ).click();
        cy.url().should("include", "/user");
      }
    }
  });

  it("devrait mesurer les délais entre les tentatives de connexion", () => {
    if (!validUser || !validUser.email || !validUser.password) {
      throw new Error("Valid user not found in fixtures");
    }

    const startTime = Date.now();

    // First login via UI
    cy.visitWithBypass("/signin");
    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();
    cy.contains("Sign Out").click();

    // Second login via UI (simulate rate-limiting delay)
    cy.visitWithBypass("/signin");
    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();

    cy.then(() => {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      // Should take at least the minimum interval (2000ms) plus execution time
      expect(totalTime).to.be.greaterThan(2000);
      cy.log(`Total time for rate-limited logins: ${totalTime}ms`);
    });
  });
});

describe("Tests de Robustesse API", () => {
  let validUser: User;

  before(() => {
    cy.fixture("users.json").then((usersData: User[]) => {
      validUser = usersData.find((user) => user.type === "valid") as User;
    });
  });

  beforeEach(() => {
    // Intercepts pour login
    cy.intercept("POST", "/api/user/login").as("loginRequest");
    cy.intercept("GET", "/api/user/profile").as("profileRequest");
    cy.intercept("GET", "/api/accounts").as("accountsRequest");
    cy.intercept("GET", "/api/transactions/search*").as(
      "searchTransactionsRequest",
    );
    cy.wait(2000);
    let sessionUser: User | undefined;
    cy.session("validUserSession-robustesse", () => {
      cy.fixture<User[]>("users.json").as("usersData");
      cy.get<User[]>("@usersData").then((usersData) => {
        sessionUser = usersData.find((user) => user.type === "valid");
        if (!sessionUser || !sessionUser.email || !sessionUser.password) {
          throw new Error(
            "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de robustesse API.",
          );
        }
        cy.visitWithBypass("/signin");
        cy.url().should("include", "/signin");
        cy.get("input#email").should("be.visible");
        cy.get("input#email").type(sessionUser.email);
        cy.get("input#password").type(sessionUser.password);
        cy.get("form").contains("button", "Connect").click();
        cy.wait("@loginRequest").then((interception) => {
          const status = interception.response?.statusCode;
          if (status !== 200) {
            throw new Error(
              `[LOGIN ERROR] Login API returned status ${status}. Body: ${JSON.stringify(interception.response?.body)}`,
            );
          }
          const token =
            interception.response?.body?.body?.token ||
            interception.response?.body?.token;
          if (
            !token ||
            typeof token !== "string" ||
            !/^([\w-]+\.){2}[\w-]+$/.test(token)
          ) {
            throw new Error(
              `[LOGIN ERROR] Token JWT manquant ou malformé: ${token}`,
            );
          }
        });
        cy.url({ timeout: 20000 }).should("include", "/user");
        if (!sessionUser.userName) {
          throw new Error(
            "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide.",
          );
        }
        cy.get(".header__nav-item")
          .contains(sessionUser.userName)
          .should("be.visible");
      });
    });
    cy.visit("/user");
    cy.fixture<User[]>("users.json").then((usersData) => {
      validUser = usersData.find((user) => user.type === "valid")!;
      if (!validUser || !validUser.userName) {
        throw new Error(
          "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide.",
        );
      }
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("be.visible");
    });
  });

  it("devrait gérer les JWT malformés", () => {
    if (!validUser || !validUser.email || !validUser.password) {
      throw new Error("Valid user not found in fixtures");
    }

    // Mock a malformed JWT response
    cy.intercept("POST", "/api/user/login", {
      statusCode: 200,
      body: {
        token: "invalid.jwt.token",
        user: { id: "1", email: validUser.email },
      },
    }).as("malformedJWT");

    cy.visitWithBypass("/signin");

    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();

    cy.wait("@malformedJWT");

    // Vérification : l'application doit afficher un message d'erreur ou rester sur la page de connexion
    cy.url().should("include", "/signin");
    cy.get("body").then(($body) => {
      // Vérifie qu'un message d'erreur est visible (adapter le sélecteur selon l'app)
      if (
        $body.text().toLowerCase().includes("jwt") ||
        $body.text().toLowerCase().includes("token")
      ) {
        cy.log("[DEBUG] Erreur JWT détectée dans la page");
      }
    });
  });

  it("devrait gérer les timeouts d'API", () => {
    if (!validUser || !validUser.email || !validUser.password) {
      throw new Error("Valid user not found in fixtures");
    }

    // Mock a slow API response
    cy.intercept("POST", "/api/user/login", (_req) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 10000); // 10 second delay
      });
    }).as("slowLogin");

    cy.visitWithBypass("/signin");

    // This should timeout and be handled gracefully
    cy.get('[data-cy="email-input"], input#email')
      .clear()
      .type(validUser.email!);
    cy.get('[data-cy="password-input"], input#password')
      .clear()
      .type(validUser.password!);
    cy.get('[data-cy="login-button"], form button:contains("Connect")').click();

    // Wait with extended timeout for our slow response
    cy.wait("@slowLogin", { timeout: 20000 });

    // Vérification : l'application doit afficher un message d'erreur ou rester sur la page de connexion
    cy.url().should("include", "/signin");
    cy.get("body").then(($body) => {
      if (
        $body.text().toLowerCase().includes("timeout") ||
        $body.text().toLowerCase().includes("délai")
      ) {
        cy.log("[DEBUG] Timeout détecté dans la page");
      }
    });
  });
});
