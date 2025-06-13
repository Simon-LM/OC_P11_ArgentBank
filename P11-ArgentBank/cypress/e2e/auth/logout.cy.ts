/** @format */

// cypress/e2e/auth/logout.cy.ts

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Déconnexion de l'utilisateur", () => {
  beforeEach(() => {
    // Charger les fixtures utilisateur
    cy.fixture<User[]>("users.json").as("usersData");

    // Se connecter en tant qu'utilisateur valide avant chaque test de ce bloc
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");

      if (!validUser || !validUser.email || !validUser.password) {
        throw new Error(
          "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de déconnexion.",
        );
      }

      // Visiter la page de connexion
      cy.visit("/signIn");
      cy.get("input#email").type(validUser.email);
      cy.get("input#password").type(validUser.password);
      cy.get("form").contains("button", "Connect").click();

      // Attendre que la redirection vers la page utilisateur soit terminée
      cy.url().should("include", "/user");

      // Vérifier que le nom d'utilisateur est affiché dans l'en-tête
      // Assurez-vous que validUser.userName est défini dans vos fixtures
      if (!validUser.userName) {
        throw new Error(
          "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide.",
        );
      }
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("be.visible");
    });
  });

  it("devrait permettre à un utilisateur de se déconnecter", function () {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité de la page utilisateur avant déconnexion (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Utilisation de function() pour accéder à this.usersData si nécessaire, bien que non utilisé ici directement
    // Cliquer sur le bouton de déconnexion (Sign Out)
    // Le sélecteur cible le lien qui contient "Sign Out"
    cy.contains("Sign Out").click();

    // Vérifications après la déconnexion
    cy.url().should("eq", "http://localhost:3000/"); // Doit rediriger vers la page d'accueil
    cy.url().should("not.include", "/user"); // Ne doit plus être sur la page utilisateur

    // Test d'accessibilité de la page d'accueil après déconnexion (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Vérifier que le lien "Sign In" est à nouveau visible
    cy.contains("Sign In").should("be.visible");

    // Vérifier que les éléments spécifiques à l'utilisateur connecté ne sont plus visibles
    // Par exemple, le nom d'utilisateur dans l'en-tête ou le lien "Sign Out"
    const validUser = (this.usersData as User[]).find(
      (user) => user.type === "valid",
    );
    if (validUser && validUser.userName) {
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("not.exist");
    }
    cy.contains("Sign Out").should("not.exist");
  });
  it("devrait être accessible sur la page utilisateur connectée", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité dédié pour la page utilisateur connectée (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité après focus sur les éléments de navigation
    cy.contains("Sign Out").focus();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
  });
});
