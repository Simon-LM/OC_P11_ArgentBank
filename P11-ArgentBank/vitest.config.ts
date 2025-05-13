/** @format */

/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom", // Utilise jsdom pour simuler le navigateur
		globals: true, // Permet d'utiliser des globales comme describe, it, expect sans importation
		setupFiles: "./src/setupTests.ts", // Chemin vers votre fichier de configuration des tests
		// MODIFIÉ: Cible spécifiquement le dossier __tests__ ET les fichiers de test co-localisés
		include: [
			"__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
			"src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}", // Ajout pour les tests co-localisés dans src
			// Ajoutez d'autres chemins ici si vos tests co-localisés sont ailleurs, par exemple :
			// "api/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
		],
		typecheck: {
			tsconfig: "./tsconfig.json",
		},
	},
});
