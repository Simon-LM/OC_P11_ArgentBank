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

describe("Tests Cross-Browser - Fonctionnalités Principales", () => {
  beforeEach(() => {
    cy.fixture("users.json").as("usersData");
  });

  it("devrait permettre la connexion utilisateur sur tous les navigateurs", () => {
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        cy.visit("/signin");

        // Injecter axe-core pour les tests d'accessibilité après le chargement de la page
        cy.injectAxe();

        // Test d'accessibilité de la page de connexion
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });

        // Connexion avec sélecteurs robustes
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
        );
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .click();

        // Vérifier la redirection
        cy.url().should("include", "/user");

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
  });

  it("devrait afficher les comptes bancaires correctement sur tous les navigateurs", () => {
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        // Connexion
        cy.visit("/signin");
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
        );
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .click();
        cy.url().should("include", "/user");

        // Injecter axe-core pour les tests d'accessibilité après connexion
        cy.injectAxe();

        // Vérifier l'affichage des comptes
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
      }
    });
  });

  it("devrait permettre la recherche de transactions sur tous les navigateurs", () => {
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        // Connexion
        cy.visit("/signin");
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
        );
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .click();
        cy.url().should("include", "/user");

        // Intercepter les appels API de recherche
        cy.intercept("GET", "/api/transactions/search*").as(
          "searchTransactions",
        );

        // Attendre que les transactions initiales soient chargées
        cy.wait("@searchTransactions");

        // Injecter axe-core pour les tests d'accessibilité après le chargement des données
        cy.injectAxe();

        // Vérifier la présence du tableau de transactions
        cy.get(
          '[data-cy="transactions-table"], table[class*="transaction-table"]',
        ).should("be.visible");

        // Test d'accessibilité du tableau de transactions
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });

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
      }
    });
  });

  it("devrait permettre la déconnexion sur tous les navigateurs", () => {
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        // Connexion
        cy.visit("/signin");
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
        );
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .click();
        cy.url().should("include", "/user");

        // Injecter axe-core pour les tests d'accessibilité après connexion
        cy.injectAxe();

        // Déconnexion - utiliser directement le fallback car les data-cy ne sont pas encore implémentés
        cy.get("body").then(($body) => {
          if (
            $body.find('[data-cy="logout-button"], [data-cy="sign-out-link"]')
              .length > 0
          ) {
            cy.get(
              '[data-cy="logout-button"], [data-cy="sign-out-link"]',
            ).click();
          } else {
            // Fallback - chercher le lien "Sign Out" dans la navigation
            cy.contains("Sign Out").click();
          }
        });

        // Vérifier la redirection
        cy.location("pathname").should("eq", "/");
        cy.url().should("not.include", "/user");

        // Test d'accessibilité de la page d'accueil
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });

        // Vérifier que Sign In est visible
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
      }
    });
  });

  it("devrait gérer les erreurs réseau correctement sur tous les navigateurs", () => {
    // Simuler une erreur réseau pour l'API de connexion
    cy.intercept("POST", "/api/user/login", { forceNetworkError: true }).as(
      "loginNetworkError",
    );

    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        cy.visit("/signin");

        // Injecter axe-core après le chargement de la page
        cy.injectAxe();

        // Tenter une connexion qui échouera
        cy.get('[data-cy="email-input"], input#email').type(validUser.email);
        cy.get('[data-cy="password-input"], input#password').type(
          validUser.password,
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

// Tests spécifiques aux navigateurs mobiles (si Cypress supporte mobile testing)
describe("Tests Cross-Browser - Compatibilité Mobile", () => {
  beforeEach(() => {
    // Simuler un viewport mobile
    cy.viewport(375, 667); // iPhone 6/7/8
    cy.fixture("users.json").as("usersData");
  });

  it("devrait être utilisable sur les écrans mobiles", () => {
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        cy.visit("/signin");

        // Injecter axe-core pour les tests d'accessibilité après le chargement de la page
        cy.injectAxe();

        // Test d'accessibilité sur mobile
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });

        // Vérifier que les éléments sont visibles et cliquables sur mobile
        cy.get('[data-cy="email-input"], input#email')
          .should("be.visible")
          .type(validUser.email);
        cy.get('[data-cy="password-input"], input#password')
          .should("be.visible")
          .type(validUser.password);
        cy.get('[data-cy="login-button"], form')
          .contains("button", "Connect")
          .should("be.visible")
          .click();

        cy.url().should("include", "/user");

        // Vérifier l'affichage des comptes sur mobile
        cy.get('[data-cy="account-card"], button[class*="account"]').should(
          "be.visible",
        );

        // Test d'accessibilité de la page utilisateur sur mobile
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      }
    });
  });
});
