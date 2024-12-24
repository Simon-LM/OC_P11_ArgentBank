/** @format */

/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom", // Utilise jsdom pour simuler le navigateur
		globals: true, // Permet d'utiliser des globales comme describe, it, expect sans importation
		setupFiles: "./src/setupTests.ts", // Chemin vers votre fichier de configuration des tests
		include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		typecheck: {
			tsconfig: "./tsconfig.json",
		},
	},
});
