#!/usr/bin/env node
/** @format */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour lire et analyser un rapport Lighthouse JSON
function analyzeLighthouseReport(jsonPath) {
  try {
    const reportData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    const audits = reportData.audits;
    const categories = reportData.categories;

    // Extraction des métriques Core Web Vitals
    const metrics = {
      // Scores généraux
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories["best-practices"].score * 100),
      seo: Math.round(categories.seo.score * 100),

      // Core Web Vitals
      firstContentfulPaint: audits["first-contentful-paint"].numericValue,
      largestContentfulPaint: audits["largest-contentful-paint"].numericValue,
      speedIndex: audits["speed-index"].numericValue,
      totalBlockingTime: audits["total-blocking-time"].numericValue,
      cumulativeLayoutShift: audits["cumulative-layout-shift"].numericValue,
      timeToInteractive: audits["interactive"].numericValue,

      // Métriques réseau
      serverResponseTime: audits["server-response-time"]?.numericValue || 0,

      // Opportunités d'amélioration
      opportunities: [],
    };

    // Extraction des opportunités d'amélioration principales
    const opportunityAudits = [
      "render-blocking-resources",
      "unused-css-rules",
      "unused-javascript",
      "modern-image-formats",
      "uses-optimized-images",
      "uses-text-compression",
      "efficient-animated-content",
    ];

    opportunityAudits.forEach((auditId) => {
      const audit = audits[auditId];
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        metrics.opportunities.push({
          id: auditId,
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs,
          score: audit.score,
        });
      }
    });

    // Tri des opportunités par impact
    metrics.opportunities.sort((a, b) => b.savings - a.savings);

    return metrics;
  } catch (error) {
    console.error(
      `Erreur lors de l'analyse du rapport ${jsonPath}:`,
      error.message,
    );
    return null;
  }
}

// Fonction pour formater les métriques en milliseconds
function formatMs(ms) {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// Fonction pour évaluer les performances selon les seuils Google
function evaluateMetric(metricName, value) {
  const thresholds = {
    firstContentfulPaint: { good: 1800, needs: 3000 },
    largestContentfulPaint: { good: 2500, needs: 4000 },
    speedIndex: { good: 3400, needs: 5800 },
    totalBlockingTime: { good: 200, needs: 600 },
    cumulativeLayoutShift: { good: 0.1, needs: 0.25 },
    timeToInteractive: { good: 3800, needs: 7300 },
  };

  const threshold = thresholds[metricName];
  if (!threshold) return "❓";

  if (value <= threshold.good) return "🟢";
  if (value <= threshold.needs) return "🟡";
  return "🔴";
}

// Analyse des rapports
console.log("🔍 Analyse des Performances Lighthouse - ArgentBank\n");
console.log("=".repeat(60));

const reportsDir = path.join(__dirname, "../reports");

// Analyse du rapport mobile
const mobileJsonPath = path.join(reportsDir, "mobile-dev-optimized.json");
let mobileMetrics = null;
if (fs.existsSync(mobileJsonPath)) {
  console.log("\n📱 RAPPORT MOBILE");
  console.log("-".repeat(30));

  mobileMetrics = analyzeLighthouseReport(mobileJsonPath);
  if (mobileMetrics) {
    console.log(`🎯 Score Performance: ${mobileMetrics.performance}/100`);
    console.log(`♿ Score Accessibilité: ${mobileMetrics.accessibility}/100`);
    console.log(`✅ Bonnes Pratiques: ${mobileMetrics.bestPractices}/100`);
    console.log(`🔍 Score SEO: ${mobileMetrics.seo}/100\n`);

    console.log("📊 Core Web Vitals:");
    console.log(
      `  ${evaluateMetric("firstContentfulPaint", mobileMetrics.firstContentfulPaint)} First Contentful Paint: ${formatMs(mobileMetrics.firstContentfulPaint)}`,
    );
    console.log(
      `  ${evaluateMetric("largestContentfulPaint", mobileMetrics.largestContentfulPaint)} Largest Contentful Paint: ${formatMs(mobileMetrics.largestContentfulPaint)}`,
    );
    console.log(
      `  ${evaluateMetric("speedIndex", mobileMetrics.speedIndex)} Speed Index: ${formatMs(mobileMetrics.speedIndex)}`,
    );
    console.log(
      `  ${evaluateMetric("totalBlockingTime", mobileMetrics.totalBlockingTime)} Total Blocking Time: ${formatMs(mobileMetrics.totalBlockingTime)}`,
    );
    console.log(
      `  ${evaluateMetric("cumulativeLayoutShift", mobileMetrics.cumulativeLayoutShift)} Cumulative Layout Shift: ${mobileMetrics.cumulativeLayoutShift.toFixed(3)}`,
    );
    console.log(
      `  ${evaluateMetric("timeToInteractive", mobileMetrics.timeToInteractive)} Time to Interactive: ${formatMs(mobileMetrics.timeToInteractive)}`,
    );

    if (mobileMetrics.opportunities.length > 0) {
      console.log("\n🚀 Principales Opportunités d'Amélioration:");
      mobileMetrics.opportunities.slice(0, 5).forEach((opp, index) => {
        console.log(
          `  ${index + 1}. ${opp.title} (${formatMs(opp.savings)} économisées)`,
        );
      });
    }
  }
} else {
  console.log("\n📱 RAPPORT MOBILE: Fichier JSON non trouvé");
}

// Analyse du rapport desktop
const desktopJsonPath = path.join(reportsDir, "desktop-dev-optimized.json");
let desktopMetrics = null;
if (fs.existsSync(desktopJsonPath)) {
  console.log("\n🖥️ RAPPORT DESKTOP");
  console.log("-".repeat(30));

  desktopMetrics = analyzeLighthouseReport(desktopJsonPath);
  if (desktopMetrics) {
    console.log(`🎯 Score Performance: ${desktopMetrics.performance}/100`);
    console.log(`♿ Score Accessibilité: ${desktopMetrics.accessibility}/100`);
    console.log(`✅ Bonnes Pratiques: ${desktopMetrics.bestPractices}/100`);
    console.log(`🔍 Score SEO: ${desktopMetrics.seo}/100\n`);

    console.log("📊 Core Web Vitals:");
    console.log(
      `  ${evaluateMetric("firstContentfulPaint", desktopMetrics.firstContentfulPaint)} First Contentful Paint: ${formatMs(desktopMetrics.firstContentfulPaint)}`,
    );
    console.log(
      `  ${evaluateMetric("largestContentfulPaint", desktopMetrics.largestContentfulPaint)} Largest Contentful Paint: ${formatMs(desktopMetrics.largestContentfulPaint)}`,
    );
    console.log(
      `  ${evaluateMetric("speedIndex", desktopMetrics.speedIndex)} Speed Index: ${formatMs(desktopMetrics.speedIndex)}`,
    );
    console.log(
      `  ${evaluateMetric("totalBlockingTime", desktopMetrics.totalBlockingTime)} Total Blocking Time: ${formatMs(desktopMetrics.totalBlockingTime)}`,
    );
    console.log(
      `  ${evaluateMetric("cumulativeLayoutShift", desktopMetrics.cumulativeLayoutShift)} Cumulative Layout Shift: ${desktopMetrics.cumulativeLayoutShift.toFixed(3)}`,
    );
    console.log(
      `  ${evaluateMetric("timeToInteractive", desktopMetrics.timeToInteractive)} Time to Interactive: ${formatMs(desktopMetrics.timeToInteractive)}`,
    );

    if (desktopMetrics.opportunities.length > 0) {
      console.log("\n🚀 Principales Opportunités d'Amélioration:");
      desktopMetrics.opportunities.slice(0, 5).forEach((opp, index) => {
        console.log(
          `  ${index + 1}. ${opp.title} (${formatMs(opp.savings)} économisées)`,
        );
      });
    }
  }
} else {
  console.log("\n🖥️ RAPPORT DESKTOP: Fichier JSON non trouvé");
}

// Création d'un rapport de synthèse
const summaryPath = path.join(reportsDir, "performance-summary.md");
let summaryContent = `# 📊 Rapport d'Analyse des Performances - ArgentBank

*Généré automatiquement le ${new Date().toLocaleString("fr-FR")}*

## 🎯 Résumé Exécutif

Cette analyse présente les résultats des tests de performance Lighthouse effectués sur l'application ArgentBank après les optimisations récentes.

## 📊 Comparaison Mobile vs Desktop

| Métrique | Mobile | Desktop | Différence |
|----------|--------|---------|------------|
| Performance | ${mobileMetrics?.performance || "N/A"}/100 | ${desktopMetrics?.performance || "N/A"}/100 | ${mobileMetrics && desktopMetrics ? (desktopMetrics.performance - mobileMetrics.performance > 0 ? "+" : "") + (desktopMetrics.performance - mobileMetrics.performance) : "N/A"} |
| Accessibilité | ${mobileMetrics?.accessibility || "N/A"}/100 | ${desktopMetrics?.accessibility || "N/A"}/100 | ${mobileMetrics && desktopMetrics ? (desktopMetrics.accessibility - mobileMetrics.accessibility > 0 ? "+" : "") + (desktopMetrics.accessibility - mobileMetrics.accessibility) : "N/A"} |
| Bonnes Pratiques | ${mobileMetrics?.bestPractices || "N/A"}/100 | ${desktopMetrics?.bestPractices || "N/A"}/100 | ${mobileMetrics && desktopMetrics ? (desktopMetrics.bestPractices - mobileMetrics.bestPractices > 0 ? "+" : "") + (desktopMetrics.bestPractices - mobileMetrics.bestPractices) : "N/A"} |
| SEO | ${mobileMetrics?.seo || "N/A"}/100 | ${desktopMetrics?.seo || "N/A"}/100 | ${mobileMetrics && desktopMetrics ? (desktopMetrics.seo - mobileMetrics.seo > 0 ? "+" : "") + (desktopMetrics.seo - mobileMetrics.seo) : "N/A"} |

`;

if (mobileMetrics) {
  summaryContent += `
## 📱 Performances Mobile

### Scores Lighthouse
- **Performance**: ${mobileMetrics.performance}/100
- **Accessibilité**: ${mobileMetrics.accessibility}/100  
- **Bonnes Pratiques**: ${mobileMetrics.bestPractices}/100
- **SEO**: ${mobileMetrics.seo}/100

### Core Web Vitals
| Métrique | Valeur | Status | Seuil Recommandé |
|----------|--------|--------|------------------|
| First Contentful Paint | ${formatMs(mobileMetrics.firstContentfulPaint)} | ${evaluateMetric("firstContentfulPaint", mobileMetrics.firstContentfulPaint)} | < 1.8s |
| Largest Contentful Paint | ${formatMs(mobileMetrics.largestContentfulPaint)} | ${evaluateMetric("largestContentfulPaint", mobileMetrics.largestContentfulPaint)} | < 2.5s |
| Speed Index | ${formatMs(mobileMetrics.speedIndex)} | ${evaluateMetric("speedIndex", mobileMetrics.speedIndex)} | < 3.4s |
| Total Blocking Time | ${formatMs(mobileMetrics.totalBlockingTime)} | ${evaluateMetric("totalBlockingTime", mobileMetrics.totalBlockingTime)} | < 200ms |
| Cumulative Layout Shift | ${mobileMetrics.cumulativeLayoutShift.toFixed(3)} | ${evaluateMetric("cumulativeLayoutShift", mobileMetrics.cumulativeLayoutShift)} | < 0.1 |
| Time to Interactive | ${formatMs(mobileMetrics.timeToInteractive)} | ${evaluateMetric("timeToInteractive", mobileMetrics.timeToInteractive)} | < 3.8s |

### 🚀 Recommandations d'Optimisation Mobile

`;
  if (mobileMetrics.opportunities.length > 0) {
    mobileMetrics.opportunities.slice(0, 3).forEach((opp, index) => {
      summaryContent += `${index + 1}. **${opp.title}** - Gain potentiel: ${formatMs(opp.savings)}\n`;
    });
  } else {
    summaryContent += "Aucune optimisation majeure identifiée pour mobile!\n";
  }
}

if (desktopMetrics) {
  summaryContent += `
## 🖥️ Performances Desktop

### Scores Lighthouse
- **Performance**: ${desktopMetrics.performance}/100
- **Accessibilité**: ${desktopMetrics.accessibility}/100  
- **Bonnes Pratiques**: ${desktopMetrics.bestPractices}/100
- **SEO**: ${desktopMetrics.seo}/100

### Core Web Vitals
| Métrique | Valeur | Status | Seuil Recommandé |
|----------|--------|--------|------------------|
| First Contentful Paint | ${formatMs(desktopMetrics.firstContentfulPaint)} | ${evaluateMetric("firstContentfulPaint", desktopMetrics.firstContentfulPaint)} | < 1.8s |
| Largest Contentful Paint | ${formatMs(desktopMetrics.largestContentfulPaint)} | ${evaluateMetric("largestContentfulPaint", desktopMetrics.largestContentfulPaint)} | < 2.5s |
| Speed Index | ${formatMs(desktopMetrics.speedIndex)} | ${evaluateMetric("speedIndex", desktopMetrics.speedIndex)} | < 3.4s |
| Total Blocking Time | ${formatMs(desktopMetrics.totalBlockingTime)} | ${evaluateMetric("totalBlockingTime", desktopMetrics.totalBlockingTime)} | < 200ms |
| Cumulative Layout Shift | ${desktopMetrics.cumulativeLayoutShift.toFixed(3)} | ${evaluateMetric("cumulativeLayoutShift", desktopMetrics.cumulativeLayoutShift)} | < 0.1 |
| Time to Interactive | ${formatMs(desktopMetrics.timeToInteractive)} | ${evaluateMetric("timeToInteractive", desktopMetrics.timeToInteractive)} | < 3.8s |

### 🚀 Recommandations d'Optimisation Desktop

`;
  if (desktopMetrics.opportunities.length > 0) {
    desktopMetrics.opportunities.slice(0, 3).forEach((opp, index) => {
      summaryContent += `${index + 1}. **${opp.title}** - Gain potentiel: ${formatMs(opp.savings)}\n`;
    });
  } else {
    summaryContent += "Aucune optimisation majeure identifiée pour desktop!\n";
  }
}

summaryContent += `
## 📋 Actions Recommandées

### 🎯 Priorité Haute
- [ ] Optimiser les ressources bloquant le rendu
- [ ] Réduire le CSS et JavaScript inutilisés  
- [ ] Implémenter la compression des images

### 🔧 Priorité Moyenne  
- [ ] Mettre en place la compression de texte
- [ ] Optimiser les polices avec font-display
- [ ] Précharger les ressources critiques

### 📊 Suivi Continu
- [ ] Surveiller les Core Web Vitals en production
- [ ] Intégrer Lighthouse CI dans le pipeline
- [ ] Mettre en place un monitoring continu

## 🔗 Liens Utiles

- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
`;

fs.writeFileSync(summaryPath, summaryContent);
console.log(`\n📄 Rapport de synthèse généré: ${summaryPath}`);

console.log("\n" + "=".repeat(60));
console.log("✅ Analyse des performances terminée!");
