/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

const transactionTableSelector = 'table[class*="transaction-table"]';

// Sélecteurs pour les éléments de transaction
const selectors = {
  transactionRow: `${transactionTableSelector} tbody tr[class*="transaction-row_"]`,
  transactionRowGeneric: `${transactionTableSelector} tbody tr[class*="transaction-row"]`,
  transactionCell: 'td[class*="transaction-row__cell"]',
  transactionTitle: 'span[class*="transaction-row__title"]',
  transactionCategoryTag: 'span[class*="transaction-row__category-tag"]',
  transactionNote: 'p[class*="transaction-row__note"]',
  searchInput: "input#transaction-search-input",
  pagination: {
    nav: 'nav[aria-label="Transaction pagination"]',
    nextButton: (nav: string) => `${nav} button[aria-label="Go to next page"]`,
    prevButton: (nav: string) =>
      `${nav} button[aria-label="Go to previous page"]`,
    pageButton: (nav: string, pageNumber: number) =>
      `${nav} button[aria-label="Go to page ${pageNumber}"]`,
  },
} as const;

// Fonction utilitaire pour créer un intercepteur d'API avec alias
const createApiIntercept = (pattern: string, alias: string) => {
  cy.intercept("GET", pattern).as(alias);
  return `@${alias}`;
};

describe("Fonctionnalités des Transactions", () => {
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
          "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de transactions-functionality.",
        );
      }

      cy.visit("/signin");
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

  it("devrait filtrer les transactions en fonction du terme de recherche et mettre à jour l'URL", () => {
    const searchTerm = "Salary";

    // Alias pour l'API de recherche avec un terme
    const searchWithTermApiAlias = createApiIntercept(
      `/api/transactions/search*searchTerm=${searchTerm}*`,
      "searchWithTermApi",
    );

    // 1. Saisir le terme de recherche dans le champ approprié
    cy.get(selectors.searchInput)
      .should("be.visible")
      .type(searchTerm, { delay: 100 }); // Ajouter un délai pour simuler la frappe et permettre au debounce de s'activer

    // 2. Attendre que l'appel API de recherche soit effectué (avec debounce de 500ms + marge)
    cy.wait(searchWithTermApiAlias, { timeout: 2000 }).then((interception) => {
      // 3. Vérifier que l'URL de l'API contient le searchTerm
      expect(interception.request.url).to.include(`searchTerm=${searchTerm}`);

      // 4. Vérifier la mise à jour de l'URL du navigateur
      cy.url().should(
        "include",
        `searchTerm=${encodeURIComponent(searchTerm)}`,
      );

      // 5. Vérifier la réponse de l'API
      cy.wrap(interception.response?.statusCode).should("eq", 200);
      const responseBody = interception.response?.body.body;
      cy.wrap(responseBody)
        .should("have.property", "transactions")
        .and("be.an", "array");
      const transactionsArray = responseBody.transactions;
      cy.wrap(transactionsArray).should("not.be.empty");

      // 6. Vérifier que les transactions affichées contiennent le terme de recherche
      cy.get(selectors.transactionRow).should("have.length.gt", 0);
      cy.get(selectors.transactionRow).each(($row) => {
        cy.wrap($row)
          .find(`${selectors.transactionCell}:first-child`) // La description est dans la première cellule
          .invoke("text")
          .then((text) => {
            expect(text.toLowerCase()).to.include(searchTerm.toLowerCase());
          });
      });
    });
  });

  it("devrait afficher correctement les notes et la catégorie pour les transactions qui en possèdent", () => {
    const transactionDescriptionWithDetails = "Salary Deposit";
    const expectedCategory = "Income"; // Corrigé de "Salary" à "Income"
    const expectedNotes = "Monthly executive compensation"; // Corrigé de "Monthly salary"

    // Attendre que les transactions initiales soient chargées
    cy.wait("@searchTransactionsRequest");

    // Trouver la ligne de transaction spécifique
    cy.contains(
      selectors.transactionRowGeneric,
      transactionDescriptionWithDetails,
    )
      .should("be.visible")
      .within(() => {
        // Vérifier la catégorie
        cy.get(selectors.transactionCategoryTag)
          .should("be.visible")
          .and("contain.text", expectedCategory);

        // Vérifier les notes
        cy.get(selectors.transactionNote)
          .should("be.visible")
          .and("contain.text", expectedNotes);
      });
  });

  it("devrait naviguer entre les pages de transactions, mettre à jour l'URL et afficher les bonnes données", () => {
    const paginationNav = selectors.pagination.nav;
    const nextPageButton = selectors.pagination.nextButton(paginationNav);
    const prevPageButton = selectors.pagination.prevButton(paginationNav);
    const pageNumberButton = (pageNumber: number) =>
      selectors.pagination.pageButton(paginationNav, pageNumber);

    // Sélecteur pour la première transaction d'une page
    const firstTransactionTitleSelector = `${selectors.transactionRowGeneric}:first-child ${selectors.transactionCell}:first-child ${selectors.transactionTitle}`;

    // Attendre que les transactions initiales (page 1) soient chargées
    cy.wait("@searchTransactionsRequest");

    // Vérifier l'état initial de la pagination (Page 1)
    cy.url().should("not.include", "page=");
    cy.get(prevPageButton).should("be.disabled");
    cy.get(nextPageButton).should("be.enabled");
    cy.get(pageNumberButton(1)).should("have.attr", "aria-current", "page");

    // Capturer la description de la première transaction de la page 1 pour comparaison ultérieure
    let firstTransactionPage1: string;
    cy.get(firstTransactionTitleSelector)
      .invoke("text")
      .then((text) => {
        firstTransactionPage1 = text.trim();
      });

    // Aller à la page 2
    cy.intercept("GET", "/api/transactions/search*").as("searchPageChange");
    cy.get(nextPageButton).click();

    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    cy.get(prevPageButton).should("be.enabled");
    cy.get(nextPageButton).should("be.enabled"); // En supposant qu'il y a plus de 2 pages ou exactement 2
    cy.get(pageNumberButton(2)).should("have.attr", "aria-current", "page");

    // Vérifier que les transactions de la page 2 sont différentes
    cy.get(firstTransactionTitleSelector)
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.not.equal(firstTransactionPage1);
      });

    // Revenir à la page 1 en utilisant le bouton "Précédent"
    cy.get(prevPageButton).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });
    cy.url().should("not.include", "page="); // Pour la page 1, le paramètre 'page' doit être absent de l'URL
    cy.get(prevPageButton).should("be.disabled");
    cy.get(pageNumberButton(1)).should("have.attr", "aria-current", "page");

    // Vérifier que les transactions sont celles de la page 1
    cy.get(firstTransactionTitleSelector)
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.equal(firstTransactionPage1);
      });

    // Aller à la page 2 en cliquant sur le numéro de page
    cy.get(pageNumberButton(2)).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    cy.get(pageNumberButton(2)).should("have.attr", "aria-current", "page");
  });
});
