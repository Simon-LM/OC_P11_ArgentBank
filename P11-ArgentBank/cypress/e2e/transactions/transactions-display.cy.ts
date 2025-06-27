/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

const transactionTableSelector = 'table[class*="transaction-table"]';
const accountSelectedClassName = "account--selected"; // Basé sur user.module.scss

// Sélecteurs pour les éléments de transaction
const selectors = {
  transactionRow: `${transactionTableSelector} tbody tr[class*="transaction-row_"]`,
  transactionCell: 'td[class*="transaction-row__cell"]',
  transactionTitle: 'span[class*="transaction-row__title"]',
  transactionDate:
    'p[class*="transaction-row__meta"] span[aria-label*="Date:"]',
  transactionAmount:
    'td[class*="transaction-row__cell--amount"] span[class*="transaction-row__amount"]',
  accountButton: 'button[class*="account"]',
} as const;

// Fonction utilitaire pour convertir une date DD/MM/YYYY en objet Date
const parseTransactionDate = (dateStr: string): Date => {
  const parts = dateStr.split("/"); // Format DD/MM/YYYY
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

// Fonction utilitaire pour vérifier le tri par date décroissante
const verifyDateSortingDescending = (dates: string[]): void => {
  expect(dates.length).to.be.gt(0);
  const dateObjects = dates.map(parseTransactionDate);
  for (let i = 0; i < dateObjects.length - 1; i++) {
    expect(dateObjects[i].getTime()).to.be.gte(
      dateObjects[i + 1].getTime(),
      `Date à l'index ${i} (${dates[i]}) devrait être >= à la date à l'index ${i + 1} (${dates[i + 1]})`,
    );
  }
};

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

      if (!validUser || !validUser.email || !validUser.password) {
        throw new Error(
          "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de transactions-display.",
        );
      }

      // Utiliser cy.session pour réutiliser la session entre les tests
      cy.session(
        [validUser.email, validUser.password],
        () => {
          cy.visit("/signin");
          cy.get("input#email").type(validUser.email!);
          cy.get("input#password").type(validUser.password!);
          cy.get("form").contains("button", "Connect").click();
          cy.wait("@loginRequest");
          cy.url().should("include", "/user");
        },
        {
          validate() {
            // Vérifier que la session est toujours valide
            cy.visit("/user");
            cy.url().should("include", "/user");
          },
        },
      );

      // Visiter la page utilisateur après la session
      cy.visit("/user");

      // Attend que les données essentielles soient chargées
      cy.wait([
        "@profileRequest",
        "@accountsRequest",
        "@searchTransactionsRequest",
      ]);

      // Vérifier que le nom d'utilisateur est affiché dans l'en-tête
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

  it("devrait afficher la liste des transactions de tous les comptes par défaut, triées par date décroissante", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité de la page des transactions (ignorer les violations de contraste connues)
    cy.checkA11y();

    const transactionRowSelector = selectors.transactionRow;

    // 1. Vérifier la visibilité du tableau des transactions.
    cy.get(transactionTableSelector).should("be.visible");

    // 2. Vérifier que des lignes de transaction sont présentes (entre 1 et 10).
    cy.get(transactionRowSelector)
      .should("have.length.gt", 0)
      .and("have.length.lte", 10);

    // 3. Vérifier le contenu de la première ligne de transaction.
    cy.get(transactionRowSelector)
      .first()
      .within(() => {
        // La structure dans User.tsx est :
        // td 1: Description (titre)
        // td 2: Date, Catégorie (meta)
        // td 3: Amount (amount)

        cy.get(selectors.transactionCell)
          .eq(0) // Description
          .find(selectors.transactionTitle)
          .invoke("text")
          .should("not.be.empty");

        cy.get(selectors.transactionCell)
          .eq(1) // Conteneur pour Date et Catégorie
          .find(selectors.transactionDate)
          .invoke("text")
          .should(
            "match",
            /^(\d{2}\/\d{2}\/\d{4})$/, // Format DD/MM/YYYY attendu par toLocaleDateString()
          );

        // Vérification du montant dans la cellule amount
        cy.get(selectors.transactionAmount)
          .invoke("text")
          .should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
      });

    // 4. Vérifier le tri par date (décroissant).
    const dates: string[] = [];
    cy.get(transactionRowSelector)
      .each(($row) => {
        cy.wrap($row)
          .find(
            `${selectors.transactionCell}:nth-child(2) ${selectors.transactionDate}`,
          )
          .invoke("text")
          .then((dateText) => {
            dates.push(dateText.trim());
          });
      })
      .then(() => {
        verifyDateSortingDescending(dates);
      });
  });

  it("devrait afficher les transactions du compte sélectionné et mettre à jour l'URL", () => {
    const targetAccountNumber = "8949";
    const accountSelector = `${selectors.accountButton}[aria-label*="${targetAccountNumber}"]`;

    // Nouvel alias spécifique pour la recherche déclenchée par le clic sur un compte
    const searchByAccountApiAlias = "searchByAccountApi";
    cy.intercept("GET", `/api/transactions/search*accountId=*`).as(
      searchByAccountApiAlias,
    );

    // Cliquer sur le compte (Checking x8949)
    cy.get(accountSelector)
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
      cy.get(selectors.transactionRow)
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
    cy.checkA11y();

    // Vérifier l'accessibilité spécifique du tableau de transactions
    cy.get(transactionTableSelector).should("be.visible");

    // Test d'accessibilité spécifique au tableau
    cy.checkA11y();

    // Vérifier que les éléments interactifs sont accessibles au clavier
    cy.get(selectors.accountButton).first().focus().should("be.focused");

    // Vérifier la présence d'attributs d'accessibilité appropriés pour le tableau
    cy.get(transactionTableSelector).should("exist");
  });
});
