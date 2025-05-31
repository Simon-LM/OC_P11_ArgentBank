/** @format */

// Configuration des seuils CI/CD pour Lighthouse
export default {
  ci: {
    collect: {
      // Configuration de collecte pour l'environnement CI
      url: ["http://localhost:3000"],
      numberOfRuns: 3, // Augmenté à 3 runs pour plus de fiabilité
      settings: {
        // Configuration adaptée pour GitHub Actions
        throttlingMethod: "provided", // Utiliser les conditions réelles sans simulation
        // Chrome flags pour l'environnement CI
        chromeFlags: [
          "--headless",
          "--disable-gpu",
          "--no-sandbox",
          "--disable-dev-shm-usage",
          "--disable-extensions",
        ],
        // Désactiver certaines vérifications non essentielles en CI
        skipAudits: [
          "uses-http2",
          "uses-long-cache-ttl",
          "efficient-animated-content",
          "offscreen-images",
          "third-party-facades",
        ],
        // Conditions réseau de référence pour l'environnement CI
        throttling: {
          cpuSlowdownMultiplier: 2, // Moins sévère que les 4 par défaut
          rttMs: 40, // Temps de latence plus réaliste pour un CI
          throughputKbps: 10240, // ~10 Mbps, plus représentatif d'un CI
        },
      },
    },
    assert: {
      // Définition des seuils pour l'environnement CI (GitHub Actions)
      assertions: {
        // Seuils globaux
        "categories:performance": ["warn", { minScore: 0.4 }], // 40% pour CI
        "categories:accessibility": ["error", { minScore: 0.9 }], // 90%
        "categories:best-practices": ["error", { minScore: 0.9 }], // 90%
        "categories:seo": ["error", { minScore: 0.9 }], // 90%

        // Métriques spécifiques adaptées à GitHub Actions
        "first-contentful-paint": ["warn", { maxNumericValue: 12000 }], // 12s
        "largest-contentful-paint": ["warn", { maxNumericValue: 30000 }], // 30s
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }], // 0.1
        "total-blocking-time": ["warn", { maxNumericValue: 500 }], // 500ms

        // Autres assertions importantes à surveiller même en CI
        "is-on-https": "error",
        viewport: "error",
        "installable-manifest": "warning",
        "service-worker": "warning",
        "dom-size": ["warning", { maxNumericValue: 2000 }],
        "resource-summary": ["warning", { maxNumericValue: 200 }],
      },
    },
  },
};
