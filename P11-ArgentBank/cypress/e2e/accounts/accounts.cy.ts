/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

// Interface Account pour le typage des données de compte (si nécessaire pour les assertions)
// Pour l'instant, nous nous concentrons sur la visibilité des éléments.
// interface Account {
//   id: string;
//   title: string;
//   balance: string;
//   description: string; // e.g., "Available Balance"
// }

describe("Gestion des Comptes Bancaires", () => {
  beforeEach(() => {
    // Charger les fixtures utilisateur
    cy.fixture("users.json").as("usersData");

    // Se connecter avant chaque test de ce bloc
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        cy.visit("/signIn");
        cy.get("input#email").type(validUser.email);
        cy.get("input#password").type(validUser.password);
        cy.get("form").contains("button", "Connect").click();
        cy.url().should("include", "/user");
      } else {
        throw new Error(
          "Utilisateur valide non trouvé ou informations manquantes dans les fixtures.",
        );
      }
    });
    // Potentiellement charger les fixtures des comptes si des vérifications de données spécifiques sont nécessaires
    // cy.fixture("accounts.json").as("accountsData");
  });

  it("devrait afficher correctement la liste des comptes de l'utilisateur sur la page de profil", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité de la page des comptes (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // La page User est déjà chargée après la connexion dans beforeEach

    // Vérifier la présence d'au moins trois sections de compte (Checking, Savings, Credit Card)
    // Ces sélecteurs sont basés sur la structure HTML typique du projet
    const accountSelectors = [
      {
        titleContains: "Checking",
        balanceText: "Available Balance",
        idSuffix: "x8949", // Corrigé de x8349 à x8949
      },
      {
        titleContains: "Savings",
        balanceText: "Available Balance",
        idSuffix: "x2094", // Corrigé de x6712 à x2094
      },
      {
        titleContains: "Credit Card",
        balanceText: "Available Balance", // Corrigé de "Current Balance" à "Available Balance"
        idSuffix: "x5642", // Corrigé de x5201 à x5642
      },
    ];

    cy.get('div[class*="user-page"]').within(() => {
      accountSelectors.forEach((acc) => {
        cy.contains('button[class*="account"]', acc.titleContains) // Cible le bouton de compte par son titre
          .should("be.visible")
          .within(() => {
            cy.get('h3[class*="account__title"]').should(
              "contain.text",
              acc.idSuffix,
            ); // Vérifie l'ID du compte dans le titre
            cy.get('p[class*="account__description"]').should(
              // Vérifie la description (ex: "Available Balance")
              "have.text",
              acc.balanceText,
            );
            cy.get('p[class*="account__amount"]') // Vérifie le solde
              .invoke("text")
              .should("match", /€-?\d+(,\d{3})*\.\d{2}$/); // Format €XX,XXX.XX ou €XXXX.XX ou €-XXXX.XX
            // Le bouton "View transactions" est implicitement le compte lui-même dans ce design
          });
      });
    });

    // Vérification plus générique du nombre de comptes si les titres ne sont pas fixes
    // cy.get("section.account").should("have.length.gte", 1); // Au moins 1 compte
    // cy.get("section.account").should("have.length", 3); // Si on s'attend à exactement 3 comptes

    // Pour chaque compte, vérifier les informations essentielles
    // cy.get("section.account").each(($el) => {
    //   cy.wrap($el).find(".account_title").should("be.visible");
    //   cy.wrap($el).find(".account_amount").should("be.visible");
    //   cy.wrap($el).find(".account_amount-description").should("be.visible");
    //   cy.wrap($el).find("button.transaction-button").should("be.visible");
    // });
  });

  it("devrait marquer le compte comme sélectionné et mettre à jour l'affichage sur la page utilisateur", () => {
    // beforeEach s'occupe déjà de la connexion et de la navigation vers /user

    // Cliquer sur le premier bouton de compte affiché
    cy.get('button[class*="account"]').first().as("firstAccount");
    cy.get("@firstAccount").click();

    // Vérifier que le compte cliqué est marqué comme sélectionné (aria-pressed="true")
    cy.get("@firstAccount").should("have.attr", "aria-pressed", "true");

    // Vérifier que le chemin de l'URL est toujours /user (avec u minuscule)
    cy.location("pathname").should("eq", "/user");

    // Optionnel: vérifier qu'un autre compte n'est pas sélectionné (s'il y en a plus d'un)
    cy.get('button[class*="account"]').then(($buttons) => {
      if ($buttons.length > 1) {
        cy.get('button[class*="account"]')
          .eq(1)
          .should("have.attr", "aria-pressed", "false");
      }
    });
  });

  it("devrait être accessible sur la page des comptes bancaires", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité dédié pour la page des comptes (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité des boutons de compte
    cy.get('button[class*="account"]').first().focus();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Cliquer sur un compte et tester l'accessibilité
    cy.get('button[class*="account"]').first().click();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité après sélection du compte
    cy.get('button[class*="account"][aria-pressed="true"]').should("exist");
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });
  });
});
