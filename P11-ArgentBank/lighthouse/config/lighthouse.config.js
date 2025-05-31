/**
 * @format
 * @type {import('lighthouse').Config}
 */

export default {
  extends: "lighthouse:default",
  settings: {
    // Configuration pour les tests locaux
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],

    // Configuration pour mobile par défaut
    formFactor: "mobile",
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 1638.4,
      uploadThroughputKbps: 675,
    },

    // Configuration d'écran mobile
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },

    // User Agent mobile
    emulatedUserAgent:
      "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36",

    // Délais pour les tests locaux
    maxWaitForLoad: 45000,
    maxWaitForFcp: 15000,

    // Configuration pour les erreurs JS (ignorer les erreurs de dev)
    skipAudits: ["unused-javascript", "unused-css-rules", "errors-in-console"],

    // Collecteurs spécifiques
    onlyAudits: [
      "first-contentful-paint",
      "largest-contentful-paint",
      "cumulative-layout-shift",
      "total-blocking-time",
      "speed-index",
      "interactive",
      "metrics",
      "performance-budget",
      "timing-budget",
      "resource-summary",
      "third-party-summary",
      "mainthread-work-breakdown",
      "diagnostics",
      "network-requests",
      "network-rtt",
      "network-server-latency",
      "main-thread-tasks",
      "bootup-time",
      "uses-responsive-images",
      "efficient-animated-content",
      "uses-optimized-images",
      "uses-webp-images",
      "uses-text-compression",
      "render-blocking-resources",
      "unminified-css",
      "unminified-javascript",
      "uses-rel-preconnect",
      "uses-rel-preload",
      "critical-request-chains",
      "prioritize-lcp-image",
      "non-composited-animations",
      "unsized-images",
      "preload-lcp-image",
      "lcp-lazy-loaded",
    ],
  },

  // Configuration pour Chrome
  chrome: {
    args: [
      "--no-sandbox",
      "--disable-dev-shm-usage",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-extensions",
      "--disable-default-apps",
      "--disable-background-networking",
      "--no-first-run",
      "--disable-hang-monitor",
      "--disable-prompt-on-repost",
      "--disable-client-side-phishing-detection",
      "--disable-component-extensions-with-background-pages",
      "--disable-ipc-flooding-protection",
    ],
  },
};
