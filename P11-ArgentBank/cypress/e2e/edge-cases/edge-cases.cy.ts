/** @format */

// cypress/e2e/edge-cases/edge-cases.cy.ts

import type { User } from "../../support/types";

describe("Tests de cas limites", () => {
	beforeEach(() => {
		cy.fixture<User[]>("users.json").as("usersData");
	});

	context("Gestion de l'affichage avec des données vides", () => {
		it("devrait afficher un message approprié quand aucun compte n'est trouvé", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Intercepter les appels d'API pour retourner des comptes vides
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-no-accounts" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			// Retourner une liste vide de comptes
			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [], // Format correct selon l'API réelle
				},
			}).as("emptyAccounts");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@emptyAccounts");

			// Vérifier que la page utilisateur s'affiche même sans comptes
			cy.get('h1[class*="header"]').should("be.visible");

			// Vérifier qu'aucun compte n'est affiché (pas de boutons de compte)
			cy.get('button[class*="account"]').should("not.exist");

			// Test d'accessibilité
			cy.injectAxe();
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});

		it("devrait gérer des comptes avec solde zéro", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration avec comptes à solde zéro
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-zero-balance" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [
						{
							id: "account1",
							accountNumber: "x0000",
							accountType: "Checking",
							balance: 0.0, // Solde zéro
						},
						{
							id: "account2",
							accountNumber: "x0001",
							accountType: "Savings",
							balance: -150.75, // Solde négatif
						},
					],
				},
			}).as("zeroBalanceAccounts");

			cy.intercept("GET", "/api/transactions/search*", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Transactions retrieved successfully",
					body: {
						transactions: [], // Aucune transaction
						pagination: {
							page: 1,
							limit: 10,
							total: 0,
						},
					},
				},
			}).as("emptyTransactions");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@zeroBalanceAccounts");

			// Vérifier l'affichage des comptes avec solde zéro/négatif
			cy.get('button[class*="account"]').should("have.length", 2);

			// Vérifier le premier compte (solde zéro)
			cy.get('button[class*="account"]')
				.first()
				.within(() => {
					cy.contains("0.00").should("be.visible");
				});

			// Vérifier le deuxième compte (solde négatif)
			cy.get('button[class*="account"]')
				.eq(1)
				.within(() => {
					cy.contains("-150.75").should("be.visible");
				});

			// Cliquer sur un compte et vérifier les transactions vides
			cy.get('button[class*="account"]').first().click();
			cy.wait("@emptyTransactions");

			// Vérifier qu'un message approprié s'affiche pour les transactions vides
			cy.get("body").should("contain", "No transactions");

			// Test d'accessibilité
			cy.injectAxe();
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});

		it("devrait gérer des noms d'utilisateur très longs ou spéciaux", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration avec nom très long
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-long-name" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: "Jean-Baptiste-Emmanuel-Marie-Joseph",
						lastName: "De-La-Fontaine-Des-Roches-Saint-Martin",
						userName: "VeryLongUserNameThatShouldBeHandledProperly",
					},
				},
			}).as("longNameProfile");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [
						{
							id: "account1",
							accountNumber: "x8949",
							accountType: "Checking",
							balance: 2082.79,
						},
					],
				},
			}).as("accountsSuccess");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@longNameProfile");
			cy.wait("@accountsSuccess");

			// Vérifier que les noms longs sont correctement affichés
			cy.get("h1").should("be.visible").and("contain", "Jean-Baptiste");

			// Vérifier que le layout n'est pas cassé par les noms longs
			cy.get("header").should("be.visible");
			cy.get("main").should("be.visible");

			// Test d'accessibilité avec noms longs
			cy.injectAxe();
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});
	});

	context("Données corrompues ou malformées", () => {
		it("devrait gérer des données de transaction malformées", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration normale pour connexion et comptes
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-malformed" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [
						{
							id: "account1",
							accountNumber: "x8949",
							accountType: "Checking",
							balance: 2082.79,
						},
					],
				},
			}).as("accountsSuccess");

			// Données de transaction malformées
			cy.intercept("GET", "/api/transactions/search*", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Transactions retrieved successfully",
					body: {
						transactions: [
							{
								id: "trans1",
								// Date malformée
								date: "invalid-date",
								description: null, // Description nulle
								amount: "not-a-number", // Montant invalide
								category: "",
							},
							{
								id: "trans2",
								date: "2024-02-30", // Date impossible
								description: "A".repeat(1000), // Description très longue
								amount: -50.99,
								category: "Category with special chars: @#$%^&*()",
							},
							{
								// Transaction avec données manquantes
								id: "trans3",
								// date manquante
								description: "Valid transaction",
								amount: 25.5,
							},
						],
						pagination: {
							page: 1,
							limit: 10,
							total: 3,
						},
					},
				},
			}).as("malformedTransactions");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@accountsSuccess");

			// Cliquer sur le compte pour voir les transactions
			cy.get('button[class*="account"]').first().click();
			cy.wait("@malformedTransactions");

			// Vérifier que l'application gère les données malformées sans crash
			cy.get("body").should("be.visible");

			// Vérifier la présence des transactions même avec des données malformées
			cy.get("body").should("contain", "trans");

			// Test d'accessibilité avec données malformées
			cy.injectAxe();
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});

		it("devrait gérer des réponses API avec structure inattendue", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-unexpected" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			// Réponse avec structure inattendue
			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					// Structure différente de celle attendue
					data: "unexpected string instead of array",
					metadata: {
						unexpected: "structure",
					},
				},
			}).as("unexpectedStructure");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@unexpectedStructure");

			// Vérifier que l'application gère gracieusement la structure inattendue
			// L'application devrait afficher la page utilisateur même si les comptes ne se chargent pas
			cy.get("h1").should("be.visible");

			// Vérifier que le reste de l'interface reste fonctionnel
			cy.get("header").should("be.visible");
		});
	});

	context("Limites de pagination et de performance", () => {
		it("devrait gérer une pagination avec beaucoup de pages", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration normale pour connexion
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-pagination" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [
						{
							id: "account1",
							accountNumber: "x8949",
							accountType: "Checking",
							balance: 2082.79,
						},
					],
				},
			}).as("accountsSuccess");

			// Pagination avec beaucoup de pages (1000 transactions)
			cy.intercept("GET", "/api/transactions/search*", (req) => {
				const url = new URL(req.url);
				const page = parseInt(url.searchParams.get("page") || "1");
				const limit = parseInt(url.searchParams.get("limit") || "10");
				const totalTransactions = 1000;
				const totalPages = Math.ceil(totalTransactions / limit);

				// Générer des transactions pour la page demandée
				const startIndex = (page - 1) * limit;
				const transactions = [];
				for (let i = 0; i < limit && startIndex + i < totalTransactions; i++) {
					transactions.push({
						id: `trans${startIndex + i + 1}`,
						date: "2024-01-15",
						description: `Transaction ${startIndex + i + 1}`,
						amount: (Math.random() * 1000 - 500).toFixed(2),
						category: "Test",
					});
				}

				req.reply({
					statusCode: 200,
					body: {
						status: 200,
						message: "Transactions retrieved successfully",
						body: {
							transactions,
							pagination: {
								page,
								limit,
								total: totalTransactions,
								totalPages,
							},
						},
					},
				});
			}).as("paginatedTransactions");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@accountsSuccess");

			// Aller aux transactions
			cy.get('button[class*="account"]').first().click();
			cy.wait("@paginatedTransactions");

			// Vérifier que les transactions sont affichées
			cy.get("body").should("contain", "Transaction");

			// Test basique de la pagination
			cy.get("body").should("be.visible");
		});

		it("devrait gérer des transactions avec montants extrêmes", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration normale pour connexion
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-extreme" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
					},
				},
			}).as("profileSuccess");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					body: [
						{
							id: "account1",
							accountNumber: "x8949",
							accountType: "Checking",
							balance: 999999999.99, // Solde très élevé
						},
					],
				},
			}).as("extremeAccounts");

			// Transactions avec montants extrêmes
			cy.intercept("GET", "/api/transactions/search*", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Transactions retrieved successfully",
					body: {
						transactions: [
							{
								id: "trans1",
								date: "2024-01-15",
								description: "Très gros virement",
								amount: 999999999.99, // Montant maximum
								category: "Transfer",
							},
							{
								id: "trans2",
								date: "2024-01-14",
								description: "Très gros débit",
								amount: -999999999.99, // Montant minimum
								category: "Withdrawal",
							},
							{
								id: "trans3",
								date: "2024-01-13",
								description: "Micro transaction",
								amount: 0.01, // Montant très petit
								category: "Fee",
							},
							{
								id: "trans4",
								date: "2024-01-12",
								description: "Transaction zéro",
								amount: 0.0, // Montant zéro
								category: "Adjustment",
							},
						],
						pagination: {
							page: 1,
							limit: 10,
							total: 4,
						},
					},
				},
			}).as("extremeTransactions");

			cy.visit("/signin");

			// Se connecter
			cy.get("input#email").type(validUser.email);
			cy.get("input#password").type(validUser.password);
			cy.get("form").contains("button", "Connect").click();

			// Attendre la redirection et l'appel des APIs
			cy.url().should("include", "/user");
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@extremeAccounts");

			// Vérifier l'affichage du solde extrême
			cy.get("body").should("contain", "999999999.99");

			// Aller aux transactions
			cy.get('button[class*="account"]').first().click();
			cy.wait("@extremeTransactions");

			// Vérifier l'affichage des montants extrêmes
			cy.get("body").should("contain", "999999999.99");
			cy.get("body").should("contain", "-999999999.99");

			// Vérifier que le layout n'est pas cassé par les grands nombres
			cy.get("body").should("be.visible");

			// Test d'accessibilité avec montants extrêmes
			cy.injectAxe();
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});
	});
});
