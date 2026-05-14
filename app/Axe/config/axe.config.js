/** @format */

// Configuration principale Axe-core
// Règles d'accessibilité WCAG 2.1 AA

export const axeConfig = {
  // Configuration des règles d'accessibilité
  rules: {
    // Contraste des couleurs - WCAG 2.1 AA
    "color-contrast": {
      enabled: true,
      tags: ["wcag2aa"],
    },

    // Navigation au clavier
    keyboard: {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Gestion du focus
    "focus-management": {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Labels des formulaires
    label: {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Structure des headings
    "heading-order": {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Texte alternatif des images
    "image-alt": {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Landmarks ARIA
    "landmark-one-main": {
      enabled: true,
      tags: ["wcag2a"],
    },

    // Liens avec contexte
    "link-name": {
      enabled: true,
      tags: ["wcag2a"],
    },
  },

  // Tags de conformité à tester
  tags: ["wcag2a", "wcag2aa", "wcag21aa"],

  // Niveau de conformité minimum
  level: "AA",

  // Configuration du reporter
  reporter: "v2",

  // Éléments à exclure globalement (si nécessaire)
  exclude: [
    // Exemple : exclure les iframes tiers
    // 'iframe[src*="youtube.com"]'
  ],

  // Configuration pour les tests React
  reactConfig: {
    // Mode de test pour les composants React
    mode: "component",

    // Timeout pour les tests asynchrones
    timeout: 5000,

    // Configuration spécifique React
    rules: {
      // Règles spécifiques aux composants React
      "react/jsx-no-target-blank": true,
      "react/no-array-index-key": true,
    },
  },
};

// Configuration pour différents environnements
export const axeEnvironments = {
  // Configuration pour les tests unitaires
  unit: {
    ...axeConfig,
    timeout: 3000,
    reporter: "v2",
  },

  // Configuration pour les tests d'intégration
  integration: {
    ...axeConfig,
    timeout: 10000,
    reporter: "v2",
  },

  // Configuration pour CI/CD
  ci: {
    ...axeConfig,
    timeout: 8000,
    reporter: "no-passes", // Seulement les violations et incomplètes
  },
};

// Règles personnalisées spécifiques au projet
export const customRules = {
  // Exemple de règle personnalisée pour ArgentBank
  "argentbank-button-contrast": {
    enabled: true,
    description: "Les boutons ArgentBank doivent avoir un contraste suffisant",
    selector: '.btn, button[class*="btn"]',
    tags: ["custom", "argentbank"],
  },
};

export default axeConfig;
