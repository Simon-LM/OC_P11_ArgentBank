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
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ["react", "react-dom"],
					features: ["./src/components/Features"],
				},
			},
		},
	},
});
