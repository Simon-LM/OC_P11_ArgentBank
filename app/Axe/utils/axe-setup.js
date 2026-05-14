/** @format */

// Configuration et setup pour les tests Axe
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { axeConfig, axeEnvironments } from "../config/axe.config.js";

// Extension des matchers Vitest avec jest-axe
expect.extend(toHaveNoViolations);

// Mock pour window.matchMedia requis pour jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock pour IntersectionObserver requis pour jsdom
class MockIntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }

  observe() {
    // Mock observe method
  }

  unobserve() {
    // Mock unobserve method
  }

  disconnect() {
    // Mock disconnect method
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

// Configuration globale d'Axe pour les tests
export const setupAxe = () => {
  // Configuration par défaut pour l'environnement de test
  const config = axeEnvironments.unit;

  // Configuration des règles spécifiques au projet
  return {
    ...config,
    // Ajout de règles personnalisées si nécessaire
    rules: {
      ...config.rules,
      // Désactiver temporairement les règles problématiques en développement
      "color-contrast": { enabled: true }, // Garder activé pour ArgentBank
      "landmark-one-main": { enabled: true },
    },
  };
};

// Helper pour tester un composant React avec Axe
export const testComponentAccessibility = async (
  container,
  customConfig = {},
) => {
  const { axe } = await import("jest-axe");

  const config = {
    ...setupAxe(),
    ...customConfig,
  };

  const results = await axe(container, config);
  return results;
};

// Helper pour tester une page complète avec Axe
export const testPageAccessibility = async (container, customConfig = {}) => {
  const { axe } = await import("jest-axe");

  const config = {
    ...axeEnvironments.integration,
    ...customConfig,
  };

  const results = await axe(container, config);
  return results;
};

// Helper pour générer un rapport détaillé
export const generateAxeReport = (results, componentName) => {
  const report = {
    component: componentName,
    timestamp: new Date().toISOString(),
    summary: {
      violations: results.violations.length,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    },
    violations: results.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.length,
    })),
    details: results,
  };

  return report;
};

// Helper pour créer des assertions personnalisées
export const expectNoAccessibilityViolations = async (
  container,
  componentName = "Component",
) => {
  const results = await testComponentAccessibility(container);

  // Générer un rapport si des violations sont trouvées
  if (results.violations.length > 0) {
    const report = generateAxeReport(results, componentName);
    console.error(
      `❌ Accessibility violations found in ${componentName}:`,
      report.violations,
    );
  }

  expect(results).toHaveNoViolations();
  return results;
};

// Helper pour tester avec des règles spécifiques
export const testWithSpecificRules = async (container, rules = []) => {
  const { axe } = await import("jest-axe");

  const config = {
    ...setupAxe(),
    runOnly: rules,
  };

  const results = await axe(container, config);
  return results;
};

// Helper pour exclure des éléments spécifiques
export const testWithExclusions = async (container, exclusions = []) => {
  const { axe } = await import("jest-axe");

  const config = {
    ...setupAxe(),
    exclude: exclusions,
  };

  const results = await axe(container, config);
  return results;
};

// Configuration par défaut exportée
export default {
  setupAxe,
  testComponentAccessibility,
  testPageAccessibility,
  generateAxeReport,
  expectNoAccessibilityViolations,
  testWithSpecificRules,
  testWithExclusions,
};
