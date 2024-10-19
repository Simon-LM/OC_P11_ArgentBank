/** @format */

/// <reference types="vitest" />

import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom", // Utilise jsdom pour simuler le navigateur
		globals: true, // Permet d'utiliser des globales comme describe, it, expect sans importation
		setupFiles: "./src/setupTests.ts", // Chemin vers votre fichier de configuration des tests
	},
});
