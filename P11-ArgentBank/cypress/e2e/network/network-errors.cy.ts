/** @format */

// cypress/e2e/network/network-errors.cy.ts

import type { User } from "../../support/types";

describe("Gestion des erreurs réseau", () => {
	beforeEach(() => {
		cy.fixture<User[]>("users.json").as("usersData");
	});

	context("Erreurs de connexion API", () => {
		it("devrait afficher un message d'erreur quand l'API de connexion est indisponible", function () {
			// Intercepter la requête de connexion et simuler une erreur réseau
			cy.intercept("POST", "/api/user/login", {
				forceNetworkError: true,
			}).as("loginNetworkError");

			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			cy.visit("/signin");

			// Injecter axe pour les tests d'accessibilité
			cy.injectAxe();

			// Test d'accessibilité initial
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});

			// Remplir le formulaire avec sélecteurs robustes
			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			// Attendre l'erreur réseau
			cy.wait("@loginNetworkError");

			// Vérifier l'affichage du message d'erreur réseau
			cy.get('[data-cy="error-message"], #error-message, [role="alert"]')
				.should("be.visible")
				.and("contain.text", "Unable to login. Please check your credentials.");

			// Vérifier que l'utilisateur reste sur la page de connexion
			cy.url().should("include", "/signin");

			// Test d'accessibilité avec message d'erreur
			cy.checkA11y(undefined, {
				rules: { "color-contrast": { enabled: false } },
			});
		});

		it("devrait afficher une erreur quand l'API de profil échoue", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Connexion réussie
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token" },
				},
			}).as("loginSuccess");

			// Erreur API profil
			cy.intercept("GET", "/api/user/profile", {
				statusCode: 500,
				body: { error: "Internal server error" },
			}).as("profileError");

			cy.visit("/signin");

			// Connexion
			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			cy.wait("@loginSuccess");
			cy.wait("@profileError");

			// Vérifier l'affichage d'un message d'erreur ou d'un état de chargement
			cy.get('[data-cy="error-message"], #error-message, [role="alert"]')
				.should("be.visible")
				.and("contain.text", "Unable to login. Please check your credentials.");
		});

		it("devrait afficher une erreur quand l'API des comptes échoue", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Connexion réussie
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token" },
				},
			}).as("loginSuccess");

			// Profil réussi
			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						id: "test-user-id-123",
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
						accounts: [],
					},
				},
			}).as("profileSuccess");

			// Erreur API comptes
			cy.intercept("GET", "/api/accounts", {
				statusCode: 503,
				body: { error: "Service unavailable" },
			}).as("accountsError");

			cy.visit("/signin");

			// Connexion
			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			// Attendre que l'utilisateur soit redirigé vers /user et que la requête accounts se déclenche
			cy.url().should("include", "/user");
			cy.wait("@accountsError");

			// Vérifier que l'utilisateur est connecté mais voit une erreur pour les comptes
			cy.contains("Error loading accounts").should("be.visible");
		});
	});

	context("Timeouts et connexion lente", () => {
		it("devrait gérer les timeouts d'API lors de la connexion", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Simuler une erreur réseau (qui cause un timeout côté client)
			cy.intercept("POST", "/api/user/login", {
				forceNetworkError: true,
			}).as("loginTimeout");

			cy.visit("/signin");

			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			// Attendre la réponse d'erreur
			cy.wait("@loginTimeout");

			// Vérifier l'affichage du message d'erreur de timeout
			cy.get(
				'[role="alert"], .error-message, [data-cy="timeout-error-message"]'
			)
				.should("be.visible")
				.and("contain.text", "Unable to login. Please check your credentials.");
		});

		it("devrait afficher un indicateur de chargement pendant les requêtes lentes", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Simuler une réponse lente mais qui fonctionne
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				delay: 2000, // 2 secondes de délai
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-slow" },
				},
			}).as("slowLogin");

			cy.visit("/signin");

			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			// Vérifier l'état de chargement du bouton
			cy.get('[data-cy="login-button"], form button').should(
				"contain",
				"Authenticating..."
			);

			// Attendre la réponse
			cy.wait("@slowLogin");

			// Vérifier que le chargement se termine
			cy.get('[data-cy="login-button"], form button').should(
				"contain",
				"Connect"
			);
		});
	});

	context("Erreurs de transactions", () => {
		it("devrait gérer les erreurs lors du chargement des transactions", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Configuration des interceptions pour une connexion réussie
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token" },
				},
			}).as("loginSuccess");

			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Successfully got user profile data",
					body: {
						id: "test-user-id-123",
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "TonyStark",
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
						accounts: [],
					},
				},
			}).as("profileSuccess");

			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User accounts retrieved successfully",
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

			// Intercepter les transactions normales pour éviter les conflits
			cy.intercept("GET", "/api/transactions", {
				statusCode: 200,
				body: {
					status: 200,
					message: "Transactions retrieved successfully",
					body: [],
				},
			}).as("transactionsSuccess");

			// Erreur pour la recherche de transactions
			cy.intercept("GET", "/api/transactions/search*", {
				statusCode: 500,
				body: { error: "Database connection failed" },
			}).as("transactionsSearchError");

			cy.visit("/signin");

			// Se connecter
			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.wait("@accountsSuccess");
			cy.wait("@transactionsSuccess");
			cy.wait("@transactionsSearchError");

			// Vérifier l'affichage d'un message d'erreur pour les transactions
			cy.get('p:contains("Error searching transactions")')
				.should("be.visible")
				.and("contain.text", "Error searching transactions");

			// Vérifier que le reste de l'interface fonctionne
			cy.get("h2").contains("Welcome back").should("be.visible");
			cy.get('button[class*="account"]').should("be.visible");
		});
	});

	context("Reconnexion automatique", () => {
		it("devrait permettre de retry après une erreur réseau", function () {
			const validUser = (this.usersData as User[]).find(
				(user) => user.type === "valid"
			);

			if (!validUser?.email || !validUser?.password) {
				throw new Error("Utilisateur valide introuvable dans les fixtures");
			}

			// Première tentative échoue
			cy.intercept("POST", "/api/user/login", {
				forceNetworkError: true,
			}).as("loginNetworkError");

			cy.visit("/signin");

			cy.get('[data-cy="email-input"], input#email').type(validUser.email);
			cy.get('[data-cy="password-input"], input#password').type(
				validUser.password
			);
			cy.get('[data-cy="login-button"], form')
				.contains("button", "Connect")
				.click();

			// Première tentative échoue
			cy.wait("@loginNetworkError");
			cy.get(
				'[data-cy="error-message"], #error-message, [role="alert"]'
			).should("be.visible");

			// Reconfigurer l'interception pour réussir
			cy.intercept("POST", "/api/user/login", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User successfully logged in",
					body: { token: "fake-jwt-token-retry" },
				},
			}).as("loginSuccess");

			// Intercepter les autres requêtes nécessaires
			cy.intercept("GET", "/api/user/profile", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User profile retrieved successfully",
					body: {
						id: "test-user-id-123",
						email: validUser.email,
						firstName: validUser.firstName || "Tony",
						lastName: validUser.lastName || "Stark",
						userName: validUser.userName || "Iron",
						createdAt: "2024-01-01T00:00:00Z",
						updatedAt: "2024-01-01T00:00:00Z",
						accounts: [],
					},
				},
			}).as("profileSuccess");

			// Ajouter l'interception pour accounts car elle sera appelée automatiquement
			cy.intercept("GET", "/api/accounts", {
				statusCode: 200,
				body: {
					status: 200,
					message: "User accounts retrieved successfully",
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

			// Retry en cliquant à nouveau
			cy.get(
				'button[type="submit"], button:contains("Connect"), button:contains("Retry"), [data-cy="retry-button"]'
			).click();

			// Deuxième tentative réussit
			cy.wait("@loginSuccess");
			cy.wait("@profileSuccess");
			cy.url().should("include", "/user");
		});
	});
});
