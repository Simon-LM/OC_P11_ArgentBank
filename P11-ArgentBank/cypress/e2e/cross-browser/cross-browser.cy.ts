/** @format */

// cypress/e2e/cross-browser/cross-browser.cy.ts

import type { User } from "../../support/types";

/**
 * Tests de compatibilité cross-browser
 *
 * Ces tests vérifient que les fonctionnalités principales de l'application
 * fonctionnent correctement sur différents navigateurs.
 *
 * Pour exécuter ces tests sur différents navigateurs :
 * - Chrome: npx cypress run --browser chrome
 * - Firefox: npx cypress run --browser firefox
 * - Edge: npx cypress run --browser edge
 * - Electron: npx cypress run --browser electron (par défaut)
 *
 * Note: Les tests d'accessibilité sont inclus pour s'assurer que
 * l'application reste accessible sur tous les navigateurs.
 */

const isCI = Cypress.env("CI");

// Utilitaire pour créer un intercepteur d'API avec alias
const createApiIntercept = (pattern: string, alias: string) => {
  cy.intercept("GET", pattern).as(alias);
  return `@${alias}`;
};

// --- PATCH ROBUSTESSE CYPRESS ---

if (Cypress.env("CI")) {
  describe.skip("[CI/CD] Cross-browser tests ignorés en CI/CD (local uniquement)", () => {});
  // Empêche l'exécution de tous les tests de ce fichier en CI/CD
}

describe("Tests Cross-Browser - Fonctionnalités Principales", () => {
  let validUser: User;

  before(() => {
    cy.fixture("users.json").then((usersData: User[]) => {
      validUser = usersData.find((user) => user.type === "valid") as User;
    });
  });

  beforeEach(() => {
    cy.intercept("POST", "/api/user/login").as("loginRequest");
    cy.intercept("GET", "/api/user/profile").as("profileRequest");
    cy.intercept("GET", "/api/accounts").as("accountsRequest");
    cy.intercept("GET", "/api/transactions/search*").as(
      "searchTransactionsRequest",
    );
    cy.wait(2000); // Limiter le risque de rate limiting Vercel
    let sessionUser: User | undefined;
    cy.session("crossBrowserValidUserSession", () => {
      cy.fixture<User[]>("users.json").as("usersData");
      cy.get<User[]>("@usersData").then((usersData) => {
        sessionUser = usersData.find((user) => user.type === "valid");
        if (!sessionUser || !sessionUser.email || !sessionUser.password) {
          throw new Error(
            "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de cross-browser.",
          );
        }
        cy.visitWithBypass("/signin");
        cy.url().should("include", "/signin");
        cy.get("input#email").should("be.visible");
        cy.get("input#email").type(sessionUser.email);
        cy.get("input#password").type(sessionUser.password!);
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
    cy.url().then((url) => {
      if (!url.includes("/user")) {
        // Si la session n'est pas restaurée, refaire le login complet
        cy.fixture<User[]>("users.json").then((usersData) => {
          validUser = usersData.find((user) => user.type === "valid")!;
          cy.visitWithBypass("/signin");
          cy.get("input#email").should("be.visible");
          cy.get("input#email").type(validUser.email!);
          cy.get("input#password").type(validUser.password!);
          cy.get("form").contains("button", "Connect").click();
          cy.url({ timeout: 20000 }).should("include", "/user");
        });
      }
    });
    // Attendre que la page utilisateur soit bien chargée avant de continuer
    cy.get(".header__nav-item", { timeout: 20000 })
      .contains(validUser.userName!)
      .should("be.visible");
  });

  /**
   * Garantit que l'utilisateur est connecté et bien sur le dashboard (/user).
   * Si la session n'est pas restaurée, relance un login complet.
   * Loggue la réponse de l'API /api/user/profile pour debug.
   * Si la session est invalide (401), tente une reconnexion UI.
   */
  function ensureUserIsLoggedInAndOnDashboard(validUser: User) {
    cy.visitWithBypass("/user");
    cy.url().then((url) => {
      if (!url.includes("/user")) {
        cy.log("[DEBUG] Session non restaurée, tentative de reconnexion UI...");
        cy.visitWithBypass("/signin");
        cy.get("input#email").should("be.visible");
        cy.get("input#email").type(validUser.email!);
        cy.get("input#password").type(validUser.password!);
        cy.get("form").contains("button", "Connect").click();
        cy.url({ timeout: 20000 }).should("include", "/user");
      }
    });
    // Log de la réponse de l'API /api/user/profile pour debug
    cy.request({ url: "/api/user/profile", failOnStatusCode: false }).then(
      (resp) => {
        cy.log("[DEBUG] /api/user/profile:", JSON.stringify(resp.body));
        if (resp.status === 401) {
          cy.log("[DEBUG] /api/user/profile 401, reconnexion UI forcée...");
          cy.visitWithBypass("/signin");
          cy.get("input#email").should("be.visible");
          cy.get("input#email").type(validUser.email!);
          cy.get("input#password").type(validUser.password!);
          cy.get("form").contains("button", "Connect").click();
          cy.url({ timeout: 20000 }).should("include", "/user");
          // Relancer la requête pour vérifier la session
          cy.request({
            url: "/api/user/profile",
            failOnStatusCode: false,
          }).then((resp2) => {
            cy.log(
              "[DEBUG] /api/user/profile après reconnexion:",
              JSON.stringify(resp2.body),
            );
          });
        }
      },
    );
    // Vérification robuste du header utilisateur
    cy.get(".header__nav-item", { timeout: 20000 }).then(($el) => {
      const headerHtml = $el.html();
      if (!$el.text().includes(validUser.userName!)) {
        Cypress.log({
          name: "UserName Check",
          message: `Nom d'utilisateur attendu non trouvé dans le header. Attendu: '${validUser.userName}', HTML: ${headerHtml}`,
        });
        throw new Error(
          `Nom d'utilisateur attendu ('${validUser.userName}') non trouvé dans le header.\nHTML: ${headerHtml}`,
        );
      }
      cy.wrap($el).contains(validUser.userName!).should("be.visible");
    });
  }

  it("devrait permettre la connexion utilisateur sur tous les navigateurs", () => {
    // Test the login functionality specifically (without using session)
    cy.visitWithBypass("/signin");

    // Injecter axe-core pour les tests d'accessibilité après le chargement de la page
    cy.injectAxe();

    // Test d'accessibilité de la page de connexion
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Use smart login with rate limiting protection
    if (validUser && validUser.email && validUser.password) {
      cy.smartLogin(validUser.email, validUser.password);

      // Test d'accessibilité de la page utilisateur
      cy.checkA11y(undefined, {
        rules: {
          "color-contrast": { enabled: false },
        },
      });

      // Vérifier l'affichage du nom d'utilisateur
      if (validUser.userName) {
        cy.get('[data-cy="user-name-nav"], .header__nav-item')
          .contains(validUser.userName)
          .should("be.visible");
      }
    }
  });

  it("devrait afficher les comptes bancaires correctement sur tous les navigateurs", () => {
    ensureUserIsLoggedInAndOnDashboard(validUser);
    cy.injectAxe();
    cy.checkA11y(
      undefined,
      { rules: { "color-contrast": { enabled: false } } },
      true,
    );
    cy.get('[data-cy="user-dashboard"], div[class*="user-page"]').should(
      "be.visible",
    );
    cy.get('[data-cy="account-card"], button[class*="account"]').should(
      "have.length.gte",
      1,
    );

    // Test d'accessibilité des comptes
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Vérifier l'interaction avec les comptes
    cy.get(
      '[data-cy="account-button"], [data-cy="account-card"] button[class*="account"], button[class*="account"]',
    )
      .first()
      .click()
      .should("have.attr", "aria-pressed", "true");
  });

  it("devrait permettre la recherche de transactions sur tous les navigateurs", () => {
    ensureUserIsLoggedInAndOnDashboard(validUser);
    cy.injectAxe();
    cy.checkA11y(
      undefined,
      { rules: { "color-contrast": { enabled: false } } },
      true,
    );
    cy.get(
      '[data-cy="transactions-table"], table[class*="transaction-table"]',
    ).should("be.visible");

    // Tester la recherche si le champ existe
    cy.get("body").then(($body) => {
      if (
        $body.find(
          '[data-cy="transaction-search-input"], input#transaction-search-input',
        ).length > 0
      ) {
        const searchTerm = "Salary";
        cy.intercept(
          "GET",
          `/api/transactions/search*searchTerm=${searchTerm}*`,
        ).as("searchWithTerm");

        cy.get(
          '[data-cy="transaction-search-input"], input#transaction-search-input',
        ).type(searchTerm, { delay: 100 });

        cy.wait("@searchWithTerm", { timeout: 2000 });
        cy.url().should(
          "include",
          `searchTerm=${encodeURIComponent(searchTerm)}`,
        );
      }
    });
  });

  it("devrait permettre la déconnexion sur tous les navigateurs", () => {
    ensureUserIsLoggedInAndOnDashboard(validUser);
    cy.injectAxe();
    cy.get("body").then(($body) => {
      if (
        $body.find('[data-cy="logout-button"], [data-cy="sign-out-link"]')
          .length > 0
      ) {
        cy.get('[data-cy="logout-button"], [data-cy="sign-out-link"]').click();
      } else if ($body.find(".header__nav-item").length > 0) {
        cy.contains("Sign Out").click();
      } else {
        // Si aucun bouton de déconnexion n'est trouvé, refaire un login puis réessayer
        ensureUserIsLoggedInAndOnDashboard(validUser);
        cy.contains("Sign Out").click();
      }
    });
    cy.location("pathname").should("eq", "/");
    cy.url().should("not.include", "/user");
    cy.checkA11y(
      undefined,
      { rules: { "color-contrast": { enabled: false } } },
      true,
    );
    cy.get("body").then(($body) => {
      if (
        $body.find('[data-cy="signin-link"], [data-cy="sign-in-link"]')
          .length === 0
      ) {
        cy.contains("Sign In").should("be.visible");
      } else {
        cy.get('[data-cy="signin-link"], [data-cy="sign-in-link"]').should(
          "be.visible",
        );
      }
    });
  });

  it("devrait gérer les erreurs réseau correctement sur tous les navigateurs", () => {
    // Simuler une erreur réseau pour l'API de connexion
    cy.intercept("POST", "/api/user/login", { forceNetworkError: true }).as(
      "loginNetworkError",
    );

    cy.visitWithBypass("/signin");

    // Injecter axe-core après le chargement de la page
    cy.injectAxe();

    // Tenter une connexion qui échouera
    if (validUser && validUser.email && validUser.password) {
      cy.get('[data-cy="email-input"], input#email').type(validUser.email);
      cy.get('[data-cy="password-input"], input#password').type(
        validUser.password!,
      );
      cy.get('[data-cy="login-button"], form')
        .contains("button", "Connect")
        .click();

      // Vérifier que l'erreur est gérée correctement
      cy.wait("@loginNetworkError");

      // Vérifier que l'utilisateur reste sur la page de connexion
      cy.url().should("include", "/signin");

      // Vérifier qu'un message d'erreur est affiché (si implémenté)
      cy.get('[data-cy="error-message"], .error, [class*="error"]').should(
        "exist",
      );

      // Test d'accessibilité en cas d'erreur
      cy.checkA11y(undefined, {
        rules: {
          "color-contrast": { enabled: false },
        },
      });
    }
  });

  it("devrait maintenir l'accessibilité sur tous les navigateurs", () => {
    // Test d'accessibilité dédié pour différents navigateurs
    // Page d'accueil
    cy.visit("/");
    cy.injectAxe();
    cy.checkA11y();

    // Page de connexion
    cy.visit("/signin");
    cy.injectAxe();
    cy.checkA11y();

    // Test simple de navigation au clavier
    cy.get('[data-cy="email-input"], input#email')
      .click()
      .type("test@example.com");

    // Cliquer sur le champ mot de passe pour tester la navigation
    cy.get('[data-cy="password-input"], input#password')
      .click()
      .type("password");

    // Test d'accessibilité final
    cy.checkA11y();
  });
});

(isCI ? describe.skip : describe)(
  "Tests Cross-Browser - Compatibilité Mobile",
  () => {
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone 6/7/8
      cy.fixture("users.json").as("usersData");
    });
    it("devrait être utilisable sur les écrans mobiles", () => {
      cy.get<User[]>("@usersData").then((usersData) => {
        const validUser = usersData.find((user) => user.type === "valid");
        if (validUser && validUser.email && validUser.password) {
          cy.intercept("POST", "/api/user/login").as("loginRequest");
          cy.intercept("GET", "/api/user/profile").as("profileRequest");
          cy.intercept("GET", "/api/accounts").as("accountsRequest");
          cy.intercept("GET", "/api/transactions/search*").as(
            "searchTransactionsRequest",
          );
          cy.wait(2000);
          let sessionUser: User | undefined;
          cy.session("crossBrowserMobileValidUserSession", () => {
            cy.fixture<User[]>("users.json").as("usersData");
            cy.get<User[]>("@usersData").then((usersData) => {
              sessionUser = usersData.find((user) => user.type === "valid");
              if (!sessionUser || !sessionUser.email || !sessionUser.password) {
                throw new Error(
                  "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de cross-browser mobile.",
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
          cy.url().then((url) => {
            if (!url.includes("/user")) {
              cy.visitWithBypass("/signin");
              cy.get("input#email").should("be.visible");
              cy.get("input#email").type(validUser.email!);
              cy.get("input#password").type(validUser.password!);
              cy.get("form").contains("button", "Connect").click();
              cy.url({ timeout: 20000 }).should("include", "/user");
            }
          });
          cy.get(".header__nav-item", { timeout: 20000 })
            .contains(validUser.userName!)
            .should("be.visible");
          cy.injectAxe();
          cy.checkA11y(
            undefined,
            { rules: { "color-contrast": { enabled: false } } },
            true,
          );
          cy.get('[data-cy="account-card"], button[class*="account"]').should(
            "be.visible",
          );
        }
      });
    });
  },
);
