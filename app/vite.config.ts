/** @format */

import { defineConfig, type Plugin, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import autoAlias from "vite-plugin-auto-alias";
// import viteSassDts from "vite-plugin-sass-dts"; // Désactivé pour éviter la génération CSS automatique
import { visualizer } from "rollup-plugin-visualizer";
import { themeInitScript, THEMES } from "darkmode-plus-a11y/react";
import { A11Y_INIT_OPTIONS } from "./src/a11y/react/accessibilityPreferences";

// Anti-FOUC: sets [data-theme] on <html> before first paint. Reads the
// script straight from the installed package version (not hand-copied into
// index.html) so it never goes stale on a future THEMES change.
//
// The second argument restores the *typography* preferences before that
// same first paint — dyslexia mode, text size, chosen font. Restored after
// hydration instead, they flash: someone reading at 200% gets a frame of
// text they cannot read, on every single page load. The theme alone can
// afford to arrive late; type cannot.
function darkmodeAntiFouc(): Plugin {
  return {
    name: "darkmode-plus-a11y-anti-fouc",
    transformIndexHtml(html) {
      return html.replace(
        "<head>",
        `<head>\n    <script>${themeInitScript(THEMES, A11Y_INIT_OPTIONS)}</script>`,
      );
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    darkmodeAntiFouc(),
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
    }) as unknown as PluginOption,
  ],
  server: {
    proxy: {
      "/api": {
        target: "https://db.lostintab.com",
        changeOrigin: true,
        secure: true,
      },
    },
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
      // Utilise le polling pour éviter les problèmes de limites de fichiers (EMFILE sur disques externes)
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) n'accepte plus la forme objet, uniquement la fonction
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
            return "vendor";
          }
          if (id.includes("/src/components/Features")) {
            return "features";
          }
          // Deliberately NO manual chunk for react-select / Emotion. Naming
          // a chunk here promotes it into the entry's modulepreload graph,
          // so index.html gets a <link rel="modulepreload"> for it and the
          // browser downloads it eagerly — which defeats the point of
          // importing AccessibilityMenu lazily. Left unnamed, Rollup emits
          // it as a true dynamic chunk, fetched only when the menu opens.
        },
      },
    },
  },
});
