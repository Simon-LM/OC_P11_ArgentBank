/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import autoAlias from "vite-plugin-auto-alias";
import viteSassDts from "vite-plugin-sass-dts";
// import { vitest } from "vitest";
// import fs from "fs";
// import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		autoAlias({
			// "@": "src", // Alias pour le dossier src
			// "@components": "src/components", // Alias pour le dossier components
			// "@styles": "src/styles", // Alias pour le dossier styles
		}),
		viteSassDts({
			enabledMode: ["development", "production"], // Génère des fichiers .d.ts pour SCSS en dev et prod
		}),
		// vitest(),
	],
	// css: {
	// 	preprocessorOptions: {
	// 		scss: {
	// 			// Options de préprocessing SCSS, comme l'ajout de variables globales
	// 			additionalData: `@import "./src/styles/variables.scss";`,
	// 		},
	// 	},
	// },
	// resolve: {
	// 	alias: {
	// 		redux: require.resolve("redux"),
	// 	},
	// },
	// test: {
	// 	globals: true,
	// 	environment: 'jsdom', // Utilisation de jsdom pour les tests de composants React
	//   },
	// test: {
	// 	globals: true,
	// 	environment: "jsdom",
	// 	setupFiles: "./src/setupTests.ts",
	// 	include: ["**/*.test.{js,ts}"],
	// },

	// resolve: {
	// 	alias: {
	// 		"@": "/src", // Alias pour le dossier src (facultatif si vous utilisez auto-alias)
	// 	},
	// },

	// server: {
	// 	https: {
	// 		key: fs.readFileSync(path.resolve(__dirname, "certs/localhost-key.pem")),
	// 		cert: fs.readFileSync(path.resolve(__dirname, "certs/localhost.pem")),
	// 	},
	// 	port: 3000,
	// },
});

// // // // // // // // // // // // //

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import autoAlias from "vite-plugin-auto-alias";
// import viteSassDts from "vite-plugin-sass-dts";
// import { fileURLToPath } from "url";
// import { dirname, resolve } from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// export default defineConfig({
// 	plugins: [
// 		react(),
// 		autoAlias(),
// 		viteSassDts({
// 			enabledMode: ["development", "production"],
// 		}),
// 	],
// 	css: {
// 		preprocessorOptions: {
// 			scss: {
// 				additionalData: `@import "@/styles/variables.scss";`,
// 			},
// 		},
// 	},
// });
