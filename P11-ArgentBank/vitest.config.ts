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
		coverage: {
			exclude: [
				"api/lib/blacklist.js",
				"src/mockData/users.ts",
				"src/pages/user/user.module.scss.d.ts",
				"src/components/TransactionSearch/TransactionSearch.module.scss.d.ts",
				"src/pages/signIn/signin.module.scss.d.ts",
				"src/components/EditUserForm/editUserForm.module.scss.d.ts",
				"src/pages/error404/Error404.module.scss.d.ts",
				"src/types/aliases.d.ts",
				"src/types/declarations.d.ts",
				"src/vite-env.d.ts",
				"src/generated/prisma/**/*.d.ts",
				"src/generated/prisma/**/*.js",
				"src/prismaTest.ts",
				"src/prismaTest.js",
				"test-sql.js",
				"vite.config.ts",
				"vitest.config.ts",
				"eslint.config.js",
				"scripts/*.js",
				"dist/**",
				"my-react-app/src/data/**",
				"my-react-app/src/models/**",
				"prisma/seed.ts",
				"src/main.tsx",
				"src/App.tsx",
				"src/pages/**/index.tsx",
				"src/components/**/index.tsx",
				"src/index.tsx",
			],
		},
	},
});
