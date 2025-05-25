/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import autoAlias from "vite-plugin-auto-alias";
import viteSassDts from "vite-plugin-sass-dts";
import { visualizer } from "rollup-plugin-visualizer";

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
		visualizer({
			open: true, // Ouvre automatiquement le rapport après la construction
			gzipSize: true, // Affiche la taille compressée avec gzip
			brotliSize: true, // Affiche la taille compressée avec brotli
			filename: "dist/stats.html", // Emplacement du rapport
		}),
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Groupe vendor pour les bibliothèques React principales
					if (
						id.includes("node_modules/react") ||
						id.includes("node_modules/react-dom")
					) {
						return "vendor-react";
					}
					// Groupe pour Redux et RTK
					if (
						id.includes("node_modules/@reduxjs") ||
						id.includes("node_modules/redux")
					) {
						return "vendor-redux";
					}
					// Groupe pour React Router
					if (id.includes("node_modules/react-router")) {
						return "vendor-router";
					}
					// Groupe pour les utilitaires
					if (
						id.includes("node_modules/react-hook-form") ||
						id.includes("node_modules/@hookform") ||
						id.includes("node_modules/zod")
					) {
						return "vendor-forms";
					}
					// Groupe pour les icônes (chargement différé)
					if (id.includes("node_modules/react-icons")) {
						return "vendor-icons";
					}
					// Autres bibliothèques node_modules
					if (id.includes("node_modules")) {
						return "vendor-misc";
					}
				},
			},
		},
		// Optimisations supplémentaires
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Supprime les console.log en production
				drop_debugger: true,
				pure_funcs: ["console.log", "console.info"], // Supprime les fonctions pures
			},
		},
		// Analyse de la taille des bundles
		reportCompressedSize: true,
		chunkSizeWarningLimit: 1000,
	},
	server: {
		port: 3000,
		host: true,
	},
});
