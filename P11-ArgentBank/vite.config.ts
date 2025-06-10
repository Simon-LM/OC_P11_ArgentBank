/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import autoAlias from "vite-plugin-auto-alias";
// import viteSassDts from "vite-plugin-sass-dts"; // Désactivé pour éviter la génération CSS automatique
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
    // viteSassDts({
    //   enabledMode: ["development", "production"], // Génère des fichiers .d.ts pour SCSS en dev et prod
    // }),
    visualizer({
      open: true, // Ouvre automatiquement le rapport après la construction
      gzipSize: true, // Affiche la taille compressée avec gzip
      brotliSize: true, // Affiche la taille compressée avec brotli
      filename: "stats.html", // Emplacement du rapport (dans dist/)
      emitFile: true, // Force la génération même en mode développement
    }),
  ],
  server: {
    watch: {
      // Ignore certains dossiers pour éviter trop de surveillance de fichiers
      ignored: [
        "**/node_modules/**",
        "**/dist/**",
        "**/.git/**",
        "**/coverage/**",
        "**/lighthouse/**",
        "**/Pa11y-backup/**",
        "**/.vercel/**",
        "**/.next/**",
      ],
      // Utilise le polling pour éviter les problèmes de limites de fichiers
      usePolling: false,
    },
  },
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
