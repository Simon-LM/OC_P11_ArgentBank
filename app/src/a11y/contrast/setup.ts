/** @format */

import path from "node:path";
import { configureThemeExtraction } from "darkmode-plus-a11y/testing/extract-themes";

// Must match darkmode-plus-a11y/react's THEMES export (see theme-setup.scss).
export const THEMES = [
  "light",
  "dark",
  "anti-glare-light",
  "anti-glare-dark",
  "high-contrast",
  "high-contrast-green",
  "high-contrast-white",
  "high-contrast-paper",
  "deuteranomaly",
  "deuteranopia",
  "protanomaly",
  "protanopia",
  "tritanomaly",
  "tritanopia",
  "achromatopsia",
] as const;

// Points directly at the theme partial rather than the app's full
// main.scss: that file also pulls in normalize.css (a bare npm-package
// import Vite resolves specially) and the @styles/* alias (Vite-config
// only) — neither of which plain Sass, run standalone here, understands.
// theme-setup.scss + theme.config.scss don't touch either, so they
// compile cleanly on their own and are all this test needs: the
// [data-theme] blocks and the role variables inside them.
configureThemeExtraction({
  entry: path.resolve(__dirname, "../scss/theme-setup.scss"),
  loadPaths: [path.resolve(__dirname, "../../../node_modules")],
  themes: THEMES,
});
