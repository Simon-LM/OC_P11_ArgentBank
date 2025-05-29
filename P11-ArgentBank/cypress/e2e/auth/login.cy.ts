/** @format */

// cypress/e2e/auth/login.cy.ts

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Authentification", () => {
	beforeEach(() => {
		// Visiter la page de connexion avant chaque test de ce bloc
		cy.visit("/signin");
		// Charger les fixtures utilisateur
		cy.fixture<User[]>("users.json").as("usersData");
	});

	it("devrait permettre à un utilisateur de se connecter avec des identifiants valides", function () {
		// Utilisation de function() pour accéder à this.usersData
		// Accéder aux données de l'utilisateur valide depuis la fixture
		const validUser = (this.usersData as User[]).find(
			(user) => user.type === "valid"
		);

		if (!validUser || !validUser.email || !validUser.password) {
			throw new Error(
				"Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le test de connexion."
			);
		}

		// Injecter axe-core pour les tests d'accessibilité
		cy.injectAxe();

		// Test d'accessibilité de la page de connexion (ignorer les violations de contraste connues)
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});

		cy.get("input#email").type(validUser.email);
		cy.get("input#password").type(validUser.password);

		// Cibler le bouton par son texte dans le formulaire
		cy.get("form").contains("button", "Connect").click();

		// Vérifications après la connexion
		cy.url().should("include", "/User");

		// Test d'accessibilité de la page utilisateur après connexion
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});
		// Optionnel : ajouter une vérification plus spécifique de la page utilisateur,
		// par exemple, la présence du nom de l'utilisateur.
		// cy.contains(`Welcome back, ${validUser.firstName}`).should("be.visible");
	});

	it("devrait afficher un message d'erreur avec des identifiants invalides", function () {
		// Utilisation de function() pour accéder à this.usersData
		// Accéder aux données de l'utilisateur invalide depuis la fixture
		const invalidUser = (this.usersData as User[]).find(
			(user) => user.type === "invalid"
		);

		if (!invalidUser || !invalidUser.email || !invalidUser.password) {
			throw new Error(
				"Utilisateur invalide non trouvé ou informations manquantes (email, password) dans les fixtures pour le test d'identifiants invalides."
			);
		}

		// Injecter axe-core pour les tests d'accessibilité
		cy.injectAxe();

		// Test d'accessibilité de la page de connexion (ignorer les violations de contraste connues)
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});

		cy.get("input#email").type(invalidUser.email);
		cy.get("input#password").type(invalidUser.password);
		cy.get("form").contains("button", "Connect").click();

		// Vérifications de l'erreur
		// L'URL ne devrait pas changer ou rediriger vers /User
		cy.url().should("not.include", "/User");
		cy.url().should("include", "/signin"); // S'assurer qu'on est toujours sur la page de connexion

		// Vérifier que le message d'erreur spécifique est visible
		// Ce message vient de la fonction getErrorMessage dans SignIn.tsx pour une erreur 401
		cy.contains("Invalid email or password").should("be.visible");

		// Test d'accessibilité de la page avec le message d'erreur (ignorer les violations de contraste connues)
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});
	});
	it("devrait être accessible sur la page de connexion", () => {
		// Injecter axe-core pour les tests d'accessibilité
		cy.injectAxe();

		// Test d'accessibilité dédié pour la page de connexion (ignorer les violations de contraste connues)
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});

		// Tester l'accessibilité avec focus sur les champs de formulaire
		cy.get("input#email").focus();
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});

		cy.get("input#password").focus();
		cy.checkA11y(undefined, {
			rules: {
				"color-contrast": { enabled: false },
			},
		});
	});

	// Le test de déconnexion a été déplacé dans cypress/e2e/auth/logout.cy.ts
});
