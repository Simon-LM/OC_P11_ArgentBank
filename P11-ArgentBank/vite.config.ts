/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import autoAlias from "vite-plugin-auto-alias";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		autoAlias({
			// "@": "src", // Alias pour le dossier src
			// "@components": "src/components", // Alias pour le dossier components
			// "@styles": "src/styles", // Alias pour le dossier styles
		}),
	],
	// resolve: {
	// 	alias: {
	// 		"@": "/src", // Alias pour le dossier src (facultatif si vous utilisez auto-alias)
	// 	},
	// },
});
