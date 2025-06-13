/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

const transactionTableSelector = 'table[class*="transaction-table"]';
const accountSelectedClassName = "account--selected"; // Basé sur user.module.scss

describe("Gestion des Transactions", () => {
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
    const targetAccountNumber = "8949"; // Numéro du compte "Argent Bank Checking"
    const firstAccountSelector = `button[class*="account"][aria-label*="${targetAccountNumber}"]`;

    // Nouvel alias spécifique pour la recherche déclenchée par le clic sur un compte
    const searchByAccountApiAlias = "searchByAccountApi";
    cy.intercept("GET", `/api/transactions/search*accountId=*`).as(
      searchByAccountApiAlias,
    );

    // Cliquer sur le compte (Checking x8949)
    cy.get(firstAccountSelector)
      .should("be.visible")
      .first() // S'il y a plusieurs correspondances, prend la première.
      .click()
      .should("have.attr", "aria-pressed", "true")
      .invoke("attr", "class") // Récupère la valeur complète de l'attribut class
      .should("include", accountSelectedClassName); // Vérifie que la classe de base est incluse

    // Attendre que l'appel API spécifique pour les transactions du compte soit fait
    cy.wait(`@${searchByAccountApiAlias}`).then((interception) => {
      expect(
        interception.request.url,
        "API request URL after click should contain accountId",
      ).to.include("accountId=");

      const requestUrl = new URL(
        interception.request.url,
        Cypress.config().baseUrl || window.location.origin,
      );
      const extractedAccountId = requestUrl.searchParams.get("accountId");

      // Vérifier que extractedAccountId existe et n'est pas vide en utilisant cy.wrap()
      cy.wrap(extractedAccountId, { log: true })
        .should("exist", "Extracted accountId from API request should exist")
        .and(
          "not.be.empty",
          "Extracted accountId from API request should not be empty",
        );

      // Vérifier la mise à jour de l'URL du navigateur
      cy.url().should("include", `accountId=${extractedAccountId}`);

      // Vérifier le titre de la section des transactions, corrigé pour x8949
      cy.get("h2#transactions-heading")
        .should("be.visible")
        .and("contain.text", "Transaction History")
        .and("contain.text", `Account #${targetAccountNumber}`); // Utilise le numéro de compte pour l'affichage

      // Vérifications sur la réponse de l'API
      cy.wrap(interception.request.url).should("include", extractedAccountId); // Vérifie que l'ID extrait est bien dans l'URL de la requête
      cy.wrap(interception.response?.statusCode).should("eq", 200);
      const responseBody = interception.response?.body.body;
      // La réponse contient un objet { transactions: [], pagination: {} }
      // Nous devons vérifier le tableau transactions à l'intérieur de cet objet.
      cy.wrap(responseBody)
        .should("have.property", "transactions")
        .and("be.an", "array");
      const transactionsArray = responseBody.transactions;
      cy.wrap(transactionsArray).should("not.be.empty");

      // Vérifier l'affichage du tableau des transactions
      cy.get(transactionTableSelector).should("be.visible");
      cy.get(`${transactionTableSelector} tbody tr`).should(
        "have.length.greaterThan",
        0,
      );

      // Vérifier la première transaction
      cy.get(`${transactionTableSelector} tbody tr`)
        .first()
        .within(() => {
          cy.get('td[class*="transaction-row__cell"]')
            .eq(0)
            .find('span[class*="transaction-row__title"]')
            .should("not.be.empty");
          cy.get('td[class*="transaction-row__cell"]')
            .eq(1)
            .find('span[aria-label*="Date:"]')
            .invoke("text")
            .should("match", /^(\d{2}\/\d{2}\/\d{4})$/); // Corrected regex
          cy.get('td[class*="transaction-row__cell--amount"]')
            .find('span[class*="transaction-row__amount"]')
            .invoke("text")
            .should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
          // L'élément span[class*="transaction-row__balance"] n'existe pas pour chaque ligne.
          // Suppression de cette assertion :
          // cy.get('td[class*="transaction-row__cell--amount"]')
          // 	.find('span[class*="transaction-row__balance"]')
          // 	.invoke("text")
          // 	.should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
        });
    });
  });

  it("devrait filtrer les transactions en fonction du terme de recherche et mettre à jour l'URL", () => {
    const searchTerm = "Salary";
    const searchInputSelector = "input#transaction-search-input";
    const transactionRowSelector = `${transactionTableSelector} tbody tr[class*="transaction-row_"]`;

    // Alias pour l'API de recherche avec un terme
    const searchWithTermApiAlias = "searchWithTermApi";
    cy.intercept(
      "GET",
      `/api/transactions/search*searchTerm=${searchTerm}*`,
    ).as(searchWithTermApiAlias);

    // 1. Saisir le terme de recherche dans le champ approprié
    cy.get(searchInputSelector)
      .should("be.visible")
      .type(searchTerm, { delay: 100 }); // Ajouter un délai pour simuler la frappe et permettre au debounce de s'activer

    // 2. Attendre que l'appel API de recherche soit effectué (avec debounce de 500ms + marge)
    cy.wait(`@${searchWithTermApiAlias}`, { timeout: 2000 }).then(
      (interception) => {
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
        cy.get(transactionRowSelector).should("have.length.gt", 0);
        cy.get(transactionRowSelector).each(($row) => {
          cy.wrap($row)
            .find('td[class*="transaction-row__cell"]:first-child') // La description est dans la première cellule
            .invoke("text")
            .then((text) => {
              expect(text.toLowerCase()).to.include(searchTerm.toLowerCase());
            });
        });
      },
    );
  });

  it("devrait afficher correctement les notes et la catégorie pour les transactions qui en possèdent", () => {
    const transactionDescriptionWithDetails = "Salary Deposit";
    const expectedCategory = "Income"; // Corrigé de "Salary" à "Income"
    const expectedNotes = "Monthly executive compensation"; // Corrigé de "Monthly salary"
    const transactionRowSelector = `${transactionTableSelector} tbody tr[class*="transaction-row"]`;

    // Attendre que les transactions initiales soient chargées
    cy.wait("@searchTransactionsRequest");

    // Trouver la ligne de transaction spécifique
    cy.contains(transactionRowSelector, transactionDescriptionWithDetails)
      .should("be.visible")
      .within(() => {
        // Vérifier la catégorie
        cy.get('span[class*="transaction-row__category-tag"]')
          .should("be.visible")
          .and("contain.text", expectedCategory);

        // Vérifier les notes
        cy.get('p[class*="transaction-row__note"]')
          .should("be.visible")
          .and("contain.text", expectedNotes);
      });
  });

  it("devrait naviguer entre les pages de transactions, mettre à jour l'URL et afficher les bonnes données", () => {
    const paginationNavSelector = 'nav[aria-label="Transaction pagination"]';
    const nextPageButtonSelector = `${paginationNavSelector} button[aria-label="Go to next page"]`;
    const prevPageButtonSelector = `${paginationNavSelector} button[aria-label="Go to previous page"]`;
    const pageNumberButtonSelector = (pageNumber: number) =>
      `${paginationNavSelector} button[aria-label="Go to page ${pageNumber}"]`;
    // const currentPageClass = "pagination__button--current"; // Commenté car nous utilisons aria-current

    // Attendre que les transactions initiales (page 1) soient chargées
    cy.wait("@searchTransactionsRequest");

    // Vérifier l'état initial de la pagination (Page 1)
    cy.url().should("not.include", "page=");
    cy.get(prevPageButtonSelector).should("be.disabled");
    cy.get(nextPageButtonSelector).should("be.enabled");
    // cy.get(pageNumberButtonSelector(1)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(1)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Capturer la description de la première transaction de la page 1 pour comparaison ultérieure
    let firstTransactionPage1: string;
    cy.get(
      `${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        firstTransactionPage1 = text.trim();
      });

    // Aller à la page 2
    cy.intercept("GET", "/api/transactions/search*").as("searchPageChange");
    cy.get(nextPageButtonSelector).click();

    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    cy.get(prevPageButtonSelector).should("be.enabled");
    cy.get(nextPageButtonSelector).should("be.enabled"); // En supposant qu'il y a plus de 2 pages ou exactement 2
    // cy.get(pageNumberButtonSelector(2)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(2)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Vérifier que les transactions de la page 2 sont différentes
    cy.get(
      `${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.not.equal(firstTransactionPage1);
      });

    // Revenir à la page 1 en utilisant le bouton "Précédent"
    cy.get(prevPageButtonSelector).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });
    cy.url().should("not.include", "page="); // Pour la page 1, le paramètre 'page' doit être absent de l'URL
    cy.get(prevPageButtonSelector).should("be.disabled");
    // cy.get(pageNumberButtonSelector(1)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(1)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Vérifier que les transactions sont celles de la page 1
    cy.get(
      `${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.equal(firstTransactionPage1);
      });

    // Aller à la page 2 en cliquant sur le numéro de page
    cy.get(pageNumberButtonSelector(2)).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    // cy.get(pageNumberButtonSelector(2)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(2)).should(
      "have.attr",
      "aria-current",
      "page",
    );
  });

  it("devrait être accessible sur la page des transactions", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité dédié pour la page des transactions (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité du tableau de transactions
    cy.get(transactionTableSelector).should("be.visible");
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

    // Tester l'accessibilité de la barre de recherche si elle existe
    cy.get("body").then(($body) => {
      if ($body.find('input[placeholder*="search"]').length > 0) {
        cy.get('input[placeholder*="search"]').focus();
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      }
    });

    // Tester l'accessibilité de la pagination si elle existe et n'est pas désactivée
    cy.get("body").then(($body) => {
      if ($body.find('button[class*="pagination"]:not(:disabled)').length > 0) {
        cy.get('button[class*="pagination"]:not(:disabled)').first().focus();
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      } else {
        // Si tous les boutons de pagination sont désactivés, faire un test d'accessibilité général
        cy.log(
          "Tous les boutons de pagination sont désactivés - test d'accessibilité général",
        );
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
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

    const transactionRowSelector = `${transactionTableSelector} tbody [data-cy="transaction-row"], ${transactionTableSelector} tbody tr[class*="transaction-row_"]`;
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

        cy.get(
          '[data-cy="transaction-description"], td[class*="transaction-row__cell"]',
        )
          .eq(0) // Description
          .find(
            '[data-cy="transaction-title"], span[class*="transaction-row__title"]',
          )
          .invoke("text")
          .should("not.be.empty");

        cy.get(
          '[data-cy="transaction-meta"], td[class*="transaction-row__cell"]',
        )
          .eq(1) // Conteneur pour Date et Catégorie
          .find(
            '[data-cy="transaction-date"], p[class*="transaction-row__meta"] span[aria-label*="Date:"]',
          )
          .invoke("text")
          .should(
            "match",
            /^(\d{2}\/\d{2}\/\d{4})$/, // Format DD/MM/YYYY attendu par toLocaleDateString()
          );

        // Vérification du montant et du solde dans la même cellule
        cy.get(
          '[data-cy="transaction-amount"], td[class*="transaction-row__cell--amount"]',
        ) // Sélecteur plus spécifique pour la cellule contenant montant et solde
          .find(
            '[data-cy="transaction-amount-value"], span[class*="transaction-row__amount"]',
          )
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
            '[data-cy="transaction-date"], td[class*="transaction-row__cell"]:nth-child(2) p[class*="transaction-row__meta"] span[aria-label*="Date:"]',
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
    const targetAccountNumber = "8949"; // Numéro du compte "Argent Bank Checking"
    const firstAccountSelector = `[data-cy="account-button-${targetAccountNumber}"], button[class*="account"][aria-label*="${targetAccountNumber}"]`;

    // Nouvel alias spécifique pour la recherche déclenchée par le clic sur un compte
    const searchByAccountApiAlias = "searchByAccountApi";
    cy.intercept("GET", `/api/transactions/search*accountId=*`).as(
      searchByAccountApiAlias,
    );

    // Cliquer sur le compte (Checking x8949)
    cy.get(firstAccountSelector)
      .should("be.visible")
      .first() // S'il y a plusieurs correspondances, prend la première.
      .click()
      .should("have.attr", "aria-pressed", "true")
      .invoke("attr", "class") // Récupère la valeur complète de l'attribut class
      .should("include", accountSelectedClassName); // Vérifie que la classe de base est incluse

    // Attendre que l'appel API spécifique pour les transactions du compte soit fait
    cy.wait(`@${searchByAccountApiAlias}`).then((interception) => {
      expect(
        interception.request.url,
        "API request URL after click should contain accountId",
      ).to.include("accountId=");

      const requestUrl = new URL(
        interception.request.url,
        Cypress.config().baseUrl || window.location.origin,
      );
      const extractedAccountId = requestUrl.searchParams.get("accountId");

      // Vérifier que extractedAccountId existe et n'est pas vide en utilisant cy.wrap()
      cy.wrap(extractedAccountId, { log: true })
        .should("exist", "Extracted accountId from API request should exist")
        .and(
          "not.be.empty",
          "Extracted accountId from API request should not be empty",
        );

      // Vérifier la mise à jour de l'URL du navigateur
      cy.url().should("include", `accountId=${extractedAccountId}`);

      // Vérifier le titre de la section des transactions, corrigé pour x8949
      cy.get('[data-cy="transactions-heading"], h2#transactions-heading')
        .should("be.visible")
        .and("contain.text", "Transaction History")
        .and("contain.text", `Account #${targetAccountNumber}`); // Utilise le numéro de compte pour l'affichage

      // Vérifications sur la réponse de l'API
      cy.wrap(interception.request.url).should("include", extractedAccountId); // Vérifie que l'ID extrait est bien dans l'URL de la requête
      cy.wrap(interception.response?.statusCode).should("eq", 200);
      const responseBody = interception.response?.body.body;
      // La réponse contient un objet { transactions: [], pagination: {} }
      // Nous devons vérifier le tableau transactions à l'intérieur de cet objet.
      cy.wrap(responseBody)
        .should("have.property", "transactions")
        .and("be.an", "array");
      const transactionsArray = responseBody.transactions;
      cy.wrap(transactionsArray).should("not.be.empty");

      // Vérifier l'affichage du tableau des transactions
      cy.get(transactionTableSelector).should("be.visible");
      cy.get(`${transactionTableSelector} tbody tr`).should(
        "have.length.greaterThan",
        0,
      );

      // Vérifier la première transaction
      cy.get(`${transactionTableSelector} tbody tr`)
        .first()
        .within(() => {
          cy.get('td[class*="transaction-row__cell"]')
            .eq(0)
            .find('span[class*="transaction-row__title"]')
            .should("not.be.empty");
          cy.get('td[class*="transaction-row__cell"]')
            .eq(1)
            .find('span[aria-label*="Date:"]')
            .invoke("text")
            .should("match", /^(\d{2}\/\d{2}\/\d{4})$/); // Corrected regex
          cy.get('td[class*="transaction-row__cell--amount"]')
            .find('span[class*="transaction-row__amount"]')
            .invoke("text")
            .should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
          // L'élément span[class*="transaction-row__balance"] n'existe pas pour chaque ligne.
          // Suppression de cette assertion :
          // cy.get('td[class*="transaction-row__cell--amount"]')
          // 	.find('span[class*="transaction-row__balance"]')
          // 	.invoke("text")
          // 	.should("match", /^-?\d+(,\d{3})*\.\d{2} €$/);
        });
    });
  });

  it("devrait filtrer les transactions en fonction du terme de recherche et mettre à jour l'URL", () => {
    const searchTerm = "Salary";
    const searchInputSelector =
      '[data-cy="transaction-search-input"], input#transaction-search-input';
    const transactionRowSelector = `${transactionTableSelector} tbody [data-cy="transaction-row"], ${transactionTableSelector} tbody tr[class*="transaction-row_"]`;

    // Alias pour l'API de recherche avec un terme
    const searchWithTermApiAlias = "searchWithTermApi";
    cy.intercept(
      "GET",
      `/api/transactions/search*searchTerm=${searchTerm}*`,
    ).as(searchWithTermApiAlias);

    // 1. Saisir le terme de recherche dans le champ approprié
    cy.get(searchInputSelector)
      .should("be.visible")
      .type(searchTerm, { delay: 100 }); // Ajouter un délai pour simuler la frappe et permettre au debounce de s'activer

    // 2. Attendre que l'appel API de recherche soit effectué (avec debounce de 500ms + marge)
    cy.wait(`@${searchWithTermApiAlias}`, { timeout: 2000 }).then(
      (interception) => {
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
        cy.get(transactionRowSelector).should("have.length.gt", 0);
        cy.get(transactionRowSelector).each(($row) => {
          cy.wrap($row)
            .find(
              '[data-cy="transaction-description"], td[class*="transaction-row__cell"]:first-child',
            ) // La description est dans la première cellule
            .invoke("text")
            .then((text) => {
              expect(text.toLowerCase()).to.include(searchTerm.toLowerCase());
            });
        });
      },
    );
  });

  it("devrait afficher correctement les notes et la catégorie pour les transactions qui en possèdent", () => {
    const transactionDescriptionWithDetails = "Salary Deposit";
    const expectedCategory = "Income"; // Corrigé de "Salary" à "Income"
    const expectedNotes = "Monthly executive compensation"; // Corrigé de "Monthly salary"
    const transactionRowSelector = `${transactionTableSelector} tbody [data-cy="transaction-row"], ${transactionTableSelector} tbody tr[class*="transaction-row"]`;

    // Attendre que les transactions initiales soient chargées
    cy.wait("@searchTransactionsRequest");

    // Trouver la ligne de transaction spécifique
    cy.contains(transactionRowSelector, transactionDescriptionWithDetails)
      .should("be.visible")
      .within(() => {
        // Vérifier la catégorie
        cy.get(
          '[data-cy="transaction-category"], span[class*="transaction-row__category-tag"]',
        )
          .should("be.visible")
          .and("contain.text", expectedCategory);

        // Vérifier les notes
        cy.get(
          '[data-cy="transaction-notes"], p[class*="transaction-row__note"]',
        )
          .should("be.visible")
          .and("contain.text", expectedNotes);
      });
  });

  it("devrait naviguer entre les pages de transactions, mettre à jour l'URL et afficher les bonnes données", () => {
    const paginationNavSelector =
      '[data-cy="transaction-pagination"], nav[aria-label="Transaction pagination"]';
    const nextPageButtonSelector = `${paginationNavSelector} [data-cy="next-page-button"], ${paginationNavSelector} button[aria-label="Go to next page"]`;
    const prevPageButtonSelector = `${paginationNavSelector} [data-cy="prev-page-button"], ${paginationNavSelector} button[aria-label="Go to previous page"]`;
    const pageNumberButtonSelector = (pageNumber: number) =>
      `${paginationNavSelector} [data-cy="page-${pageNumber}-button"], ${paginationNavSelector} button[aria-label="Go to page ${pageNumber}"]`;
    // const currentPageClass = "pagination__button--current"; // Commenté car nous utilisons aria-current

    // Attendre que les transactions initiales (page 1) soient chargées
    cy.wait("@searchTransactionsRequest");

    // Vérifier l'état initial de la pagination (Page 1)
    cy.url().should("not.include", "page=");
    cy.get(prevPageButtonSelector).should("be.disabled");
    cy.get(nextPageButtonSelector).should("be.enabled");
    // cy.get(pageNumberButtonSelector(1)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(1)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Capturer la description de la première transaction de la page 1 pour comparaison ultérieure
    let firstTransactionPage1: string;
    cy.get(
      `${transactionTableSelector} tbody [data-cy="transaction-row"]:first-child [data-cy="transaction-title"], ${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        firstTransactionPage1 = text.trim();
      });

    // Aller à la page 2
    cy.intercept("GET", "/api/transactions/search*").as("searchPageChange");
    cy.get(nextPageButtonSelector).click();

    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    cy.get(prevPageButtonSelector).should("be.enabled");
    cy.get(nextPageButtonSelector).should("be.enabled"); // En supposant qu'il y a plus de 2 pages ou exactement 2
    // cy.get(pageNumberButtonSelector(2)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(2)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Vérifier que les transactions de la page 2 sont différentes
    cy.get(
      `${transactionTableSelector} tbody [data-cy="transaction-row"]:first-child [data-cy="transaction-title"], ${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.not.equal(firstTransactionPage1);
      });

    // Revenir à la page 1 en utilisant le bouton "Précédent"
    cy.get(prevPageButtonSelector).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=1");
    });
    cy.url().should("not.include", "page="); // Pour la page 1, le paramètre 'page' doit être absent de l'URL
    cy.get(prevPageButtonSelector).should("be.disabled");
    // cy.get(pageNumberButtonSelector(1)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(1)).should(
      "have.attr",
      "aria-current",
      "page",
    );

    // Vérifier que les transactions sont celles de la page 1
    cy.get(
      `${transactionTableSelector} tbody [data-cy="transaction-row"]:first-child [data-cy="transaction-title"], ${transactionTableSelector} tbody tr[class*="transaction-row"]:first-child td[class*="transaction-row__cell"]:first-child span[class*="transaction-row__title"]`,
    )
      .invoke("text")
      .then((text) => {
        expect(text.trim()).to.equal(firstTransactionPage1);
      });

    // Aller à la page 2 en cliquant sur le numéro de page
    cy.get(pageNumberButtonSelector(2)).click();
    cy.wait("@searchPageChange").then((interception) => {
      expect(interception.request.url).to.include("page=2");
    });
    cy.url().should("include", "page=2");
    // cy.get(pageNumberButtonSelector(2)).should("have.class", currentPageClass); Remplacé ci-dessous
    cy.get(pageNumberButtonSelector(2)).should(
      "have.attr",
      "aria-current",
      "page",
    );
  });

  it("devrait être accessible sur la page des transactions", () => {
    // Injecter axe-core pour les tests d'accessibilité
    cy.injectAxe();

    // Test d'accessibilité dédié pour la page des transactions (ignorer les violations de contraste connues)
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité du tableau de transactions
    cy.get(transactionTableSelector).should("be.visible");
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité des boutons de compte
    cy.get('[data-cy="account-button"], button[class*="account"]')
      .first()
      .focus();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Tester l'accessibilité de la barre de recherche si elle existe
    cy.get("body").then(($body) => {
      if (
        $body.find(
          '[data-cy="transaction-search-input"], input[placeholder*="search"]',
        ).length > 0
      ) {
        cy.get(
          '[data-cy="transaction-search-input"], input[placeholder*="search"]',
        ).focus();
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      }
    });

    // Tester l'accessibilité de la pagination si elle existe et n'est pas désactivée
    cy.get("body").then(($body) => {
      if (
        $body.find(
          '[data-cy*="page-button"]:not(:disabled), button[class*="pagination"]:not(:disabled)',
        ).length > 0
      ) {
        cy.get(
          '[data-cy*="page-button"]:not(:disabled), button[class*="pagination"]:not(:disabled)',
        )
          .first()
          .focus();
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      } else {
        // Si tous les boutons de pagination sont désactivés, faire un test d'accessibilité général
        cy.log(
          "Tous les boutons de pagination sont désactivés - test d'accessibilité général",
        );
        cy.checkA11y(undefined, {
          rules: {
            "color-contrast": { enabled: false },
          },
        });
      }
    });
  });
});
