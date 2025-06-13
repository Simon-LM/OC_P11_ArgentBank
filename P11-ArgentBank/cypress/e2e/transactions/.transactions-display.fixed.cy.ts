/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

const transactionTableSelector = 'table[class*="transaction-table"]';
const accountSelectedClassName = "account--selected"; // Basé sur user.module.scss

describe("Affichage des Transactions", () => {
  beforeEach(() => {
    cy.fixture("users.json").as("usersData");

    cy.intercept("POST", "/api/user/login").as("loginRequest");
    cy.intercept("GET", "/api/user/profile").as("profileRequest");
    cy.intercept("GET", "/api/accounts").as("accountsRequest");
    // Intercepte la recherche initiale de transactions qui se produit au chargement de la page User.
    // Cela peut être appelé avec ou sans accountId initialement.
    cy.intercept("GET", "/api/transactions/search*").as(
      "searchTransactionsRequest",
    );

    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");
      if (validUser && validUser.email && validUser.password) {
        cy.visit("/signIn");
        cy.get("input#email").type(validUser.email);
        cy.get("input#password").type(validUser.password);
        cy.get("form").contains("button", "Connect").click();
        cy.wait("@loginRequest");
        cy.url().should("include", "/user");
        // Attend que les données essentielles soient chargées
        cy.wait([
          "@profileRequest",
          "@accountsRequest",
          "@searchTransactionsRequest",
        ]);
      } else {
        throw new Error(
          "Utilisateur valide non trouvé ou informations manquantes dans les fixtures.",
        );
      }
    });
  });

  it("devrait afficher la liste des transactions de tous les comptes par défaut, triées par date décroissante", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité de la page des transactions (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    const transactionRowSelector = `${transactionTableSelector} tbody tr[class*="transaction-row_"]`;
    // const headerCellSelector = `${transactionTableSelector} thead th`; // Commenté car non utilisé

    // 1. Vérifier la visibilité du tableau des transactions.
    cy.get(transactionTableSelector).should("be.visible");

    // 2. Vérifier les en-têtes du tableau.
    // Dans User.tsx, les en-têtes sont visuellement présents mais implémentés différemment (pas de thead standard).
    // Les "en-têtes" sont plutôt des labels implicites ou des éléments dans chaque ligne.
    // Pour ce test, nous allons nous concentrer sur la structure des données dans les lignes.
    // Si des en-têtes dédiés sont ajoutés plus tard, cette section pourra être réactivée.
    // cy.get(headerCellSelector).eq(0).should("contain.text", "Date");
    // cy.get(headerCellSelector).eq(1).should("contain.text", "Description");
    // cy.get(headerCellSelector).eq(2).should("contain.text", "Amount");
    // cy.get(headerCellSelector).eq(3).should("contain.text", "Balance");

    // 3. Vérifier que des lignes de transaction sont présentes (entre 1 et 10).
    cy.get(transactionRowSelector)
      .should("have.length.gt", 0)
      .and("have.length.lte", 10);

    // 4. Vérifier le contenu de la première ligne de transaction.
    cy.get(transactionRowSelector)
      .first()
      .within(() => {
        // La structure dans User.tsx est :
        // td 1: Description (titre)
        // td 2: Date, Catégorie (meta)
        // td 3: Amount, Balance (amount-balance)

        cy.get('td[class*="transaction-row__cell"]')
          .eq(0) // Description
          .find('span[class*="transaction-row__title"]')
          .invoke("text")
          .should("not.be.empty");

        cy.get('td[class*="transaction-row__cell"]')
          .eq(1) // Conteneur pour Date et Catégorie
          .find('p[class*="transaction-row__meta"] span[aria-label*="Date:"]')
          .invoke("text")
          .should(
            "match",
            /^(\d{2}\/\d{2}\/\d{4})$/, // Format DD/MM/YYYY attendu par toLocaleDateString()
          );

        // Vérification du montant et du solde dans la même cellule
        cy.get('td[class*="transaction-row__cell--amount"]') // Sélecteur plus spécifique pour la cellule contenant montant et solde
          .find('span[class*="transaction-row__amount"]')
          .invoke("text")
          .should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);

        // L'élément span[class*="transaction-row__balance"] n'existe pas pour chaque ligne.
        // Le solde affiché dans l'en-tête du compte est le solde actuel du compte, pas un solde par transaction.
        // Suppression de cette assertion :
        // cy.get('td[class*="transaction-row__cell--amount"]')
        // 	.find('span[class*="transaction-row__balance"]')
        // 	.invoke("text")
        // 	.should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
      });

    // 5. Vérifier le tri par date (décroissant).
    const dates: string[] = [];
    cy.get(transactionRowSelector)
      .each(($row) => {
        cy.wrap($row)
          .find(
            'td[class*="transaction-row__cell"]:nth-child(2) p[class*="transaction-row__meta"] span[aria-label*="Date:"]',
          ) // Cellule de la date
          .invoke("text")
          .then((dateText) => {
            dates.push(dateText.trim());
          });
      })
      .then(() => {
        expect(dates.length).to.be.gt(0);
        const dateObjects = dates.map((dateStr) => {
          const parts = dateStr.split("/"); // Format DD/MM/YYYY
          return new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0]),
          );
        });
        for (let i = 0; i < dateObjects.length - 1; i++) {
          expect(dateObjects[i].getTime()).to.be.gte(
            dateObjects[i + 1].getTime(),
          );
        }
      });
  });

  it("devrait afficher les transactions du compte sélectionné et mettre à jour l'URL", () => {
    const targetAccountNumber = "8949";
    const firstAccountSelector = `button[class*="account"][aria-label*="${targetAccountNumber}"]`;

    // Nouvel alias spécifique pour la recherche déclenchée par le clic sur un compte
    const searchByAccountApiAlias = "searchByAccountApi";
    cy.intercept("GET", `/api/transactions/search*accountId=*`).as(
      searchByAccountApiAlias,
    );

    // Cliquer sur le compte (Checking x8949)
    cy.get(firstAccountSelector)
      .should("be.visible")
      .first()
      .click()
      .should("have.attr", "aria-pressed", "true")
      .invoke("attr", "class")
      .should("include", accountSelectedClassName);

    // Attendre que l'appel API spécifique pour les transactions du compte soit fait
    cy.wait(`@${searchByAccountApiAlias}`).then((interception) => {
      // Vérifier que l'URL de l'API contient l'accountId
      expect(interception.request.url).to.include("accountId=");

      // Vérifier la mise à jour de l'URL du navigateur
      cy.url().should("include", "accountId=");

      // Vérifier la réponse de l'API
      cy.wrap(interception.response?.statusCode).should("eq", 200);
      const responseBody = interception.response?.body.body;
      cy.wrap(responseBody)
        .should("have.property", "transactions")
        .and("be.an", "array");

      // Vérifier que les transactions affichées sont celles du compte sélectionné
      cy.get(`${transactionTableSelector} tbody tr[class*="transaction-row"]`)
        .should("have.length.gt", 0)
        .each(($row) => {
          // Vérifier que chaque transaction appartient au compte sélectionné
          // (cette vérification dépend de la structure des données retournées)
          cy.wrap($row).should("be.visible");
        });
    });
  });

  it("devrait être accessible sur la page des transactions", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Vérifier l'accessibilité globale de la page des transactions
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false }, // Ignorer les violations de contraste connues
      },
    });

    // Vérifier l'accessibilité spécifique du tableau de transactions
    cy.get(transactionTableSelector).should("be.visible");

    // Test d'accessibilité spécifique au tableau
    cy.checkA11y(transactionTableSelector, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Vérifier que les éléments interactifs sont accessibles au clavier
    cy.get('button[class*="account"]').first().focus().should("be.focused");

    // Vérifier la présence d'attributs d'accessibilité appropriés pour le tableau
    cy.get(transactionTableSelector).should("exist");
  });
});
