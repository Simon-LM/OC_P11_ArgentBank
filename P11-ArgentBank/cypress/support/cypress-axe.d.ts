/** @format */

// Déclarations TypeScript pour cypress-axe
// Étend les types cypress-axe pour inclure toutes les options d'axe-core

declare namespace Cypress {
	interface Chainable {
		/**
		 * Injecte la bibliothèque axe-core dans la page
		 */
		injectAxe(): Chainable<void>;

		/**
		 * Exécute des tests d'accessibilité avec axe-core
		 * @param context - Sélecteur ou élément à tester (optionnel)
		 * @param options - Options de configuration axe-core
		 */
		checkA11y(
			context?: any,
			options?: any,
			violationCallback?: any,
			skipFailures?: any
		): Chainable<void>;
	}
}
