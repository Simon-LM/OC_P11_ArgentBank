#!/usr/bin/env node
/**
 * Script d'analyse des rapports Lighthouse JSON
 * Extrait les métriques principales et génère un résumé
 *
 * @format
 */

import fs from "fs/promises";
import path from "path";

// Seuils de performance recommandés
const THRESHOLDS = {
  performance: {
    good: 90,
    needsImprovement: 50,
  },
  "first-contentful-paint": {
    good: 1800,
    needsImprovement: 3000,
  },
  "largest-contentful-paint": {
    good: 2500,
    needsImprovement: 4000,
  },
  "cumulative-layout-shift": {
    good: 0.1,
    needsImprovement: 0.25,
  },
  "total-blocking-time": {
    good: 200,
    needsImprovement: 600,
  },
  "speed-index": {
    good: 3400,
    needsImprovement: 5800,
  },
  interactive: {
    good: 3800,
    needsImprovement: 7300,
  },
};

// Fonction pour déterminer le statut d'une métrique
function getMetricStatus(value, thresholds, isScore = false) {
  if (isScore) {
    // Pour les scores (0-100)
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.needsImprovement) return "needs-improvement";
    return "poor";
  } else {
    // Pour les métriques de temps/valeur
    if (value <= thresholds.good) return "good";
    if (value <= thresholds.needsImprovement) return "needs-improvement";
    return "poor";
  }
}

// Fonction pour formater les valeurs
function formatValue(value, unit) {
  switch (unit) {
    case "millisecond":
      return value >= 1000
        ? `${(value / 1000).toFixed(1)}s`
        : `${Math.round(value)}ms`;
    case "unitless":
      return value.toFixed(3);
    default:
      return Math.round(value);
  }
}

// Fonction pour analyser un rapport Lighthouse
async function analyzeReport(filePath) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const report = JSON.parse(content);

    const analysis = {
      url: report.finalUrl,
      timestamp: new Date(report.fetchTime).toLocaleString("en-US"),
      device: report.configSettings.formFactor,
      categories: {},
      metrics: {},
      opportunities: [],
    };

    // Analyser les catégories
    Object.entries(report.categories).forEach(([key, category]) => {
      const score = Math.round(category.score * 100);
      analysis.categories[key] = {
        title: category.title,
        score,
        status: getMetricStatus(score, THRESHOLDS.performance, true),
      };
    });

    // Analyser les métriques Core Web Vitals
    const coreMetrics = [
      "first-contentful-paint",
      "largest-contentful-paint",
      "cumulative-layout-shift",
      "total-blocking-time",
      "speed-index",
      "interactive",
    ];

    coreMetrics.forEach((metricKey) => {
      const audit = report.audits[metricKey];
      if (audit && audit.numericValue !== undefined) {
        const value = audit.numericValue;
        const displayValue =
          audit.displayValue || formatValue(value, audit.numericUnit);

        analysis.metrics[metricKey] = {
          title: audit.title,
          value,
          displayValue,
          unit: audit.numericUnit,
          status: getMetricStatus(value, THRESHOLDS[metricKey]),
          score: audit.score ? Math.round(audit.score * 100) : null,
        };
      }
    });

    // Analyser les opportunités d'amélioration
    Object.values(report.audits)
      .filter((audit) => audit.details && audit.details.type === "opportunity")
      .sort(
        (a, b) =>
          (b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0),
      )
      .slice(0, 10)
      .forEach((audit) => {
        const savings = audit.details.overallSavingsMs || 0;
        if (savings > 50) {
          // Seuil minimum de 50ms
          analysis.opportunities.push({
            title: audit.title,
            description: audit.description,
            savings: Math.round(savings),
            score: audit.score ? Math.round(audit.score * 100) : null,
          });
        }
      });

    return analysis;
  } catch (error) {
    throw new Error(
      `Erreur lors de l'analyse du rapport ${filePath}: ${error.message}`,
    );
  }
}

// Fonction pour générer le rapport d'analyse
function generateReport(analyses) {
  let report = "";

  // En-tête
  report += "🚀 ANALYSE DES RAPPORTS LIGHTHOUSE\n";
  report += "=".repeat(50) + "\n\n";

  analyses.forEach((analysis, index) => {
    if (index > 0) report += "\n" + "-".repeat(50) + "\n\n";

    report += `📊 ${analysis.device.toUpperCase()} - ${analysis.url}\n`;
    report += `🕒 ${analysis.timestamp}\n\n`;

    // Scores par catégorie
    report += "📈 SCORES PAR CATÉGORIE:\n";
    Object.entries(analysis.categories).forEach(([key, category]) => {
      const emoji =
        category.status === "good"
          ? "🟢"
          : category.status === "needs-improvement"
            ? "🟡"
            : "🔴";
      report += `${emoji} ${category.title}: ${category.score}%\n`;
    });

    // Métriques Core Web Vitals
    report += "\n⚡ CORE WEB VITALS:\n";
    Object.entries(analysis.metrics).forEach(([key, metric]) => {
      const emoji =
        metric.status === "good"
          ? "🟢"
          : metric.status === "needs-improvement"
            ? "🟡"
            : "🔴";
      report += `${emoji} ${metric.title}: ${metric.displayValue}`;
      if (metric.score !== null) {
        report += ` (${metric.score}%)`;
      }
      report += "\n";
    });

    // Opportunités d'amélioration
    if (analysis.opportunities.length > 0) {
      report += "\n🔧 PRINCIPALES OPPORTUNITÉS:\n";
      analysis.opportunities.slice(0, 5).forEach((opp) => {
        report += `⚠️  ${opp.title}: ${opp.savings}ms d'économie potentielle\n`;
      });
    }
  });

  return report;
}

// Fonction pour générer un rapport HTML
function generateHTMLReport(analyses) {
  const getStatusColor = (status) => {
    switch (status) {
      case "good":
        return "#22c55e";
      case "needs-improvement":
        return "#f59e0b";
      case "poor":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case "good":
        return "🟢";
      case "needs-improvement":
        return "🟡";
      case "poor":
        return "🔴";
      default:
        return "⚪";
    }
  };

  let html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analyse Lighthouse - ArgentBank</title>
    <style>
        body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f8fafc; }
        .header { text-align: center; margin-bottom: 40px; }
        .analysis { background: white; margin: 20px 0; padding: 30px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .device-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 500; margin-bottom: 15px; }
        .mobile { background: #fef3c7; color: #92400e; }
        .desktop { background: #dbeafe; color: #1e40af; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { padding: 15px; border-radius: 8px; border-left: 4px solid; }
        .metric.good { border-color: #22c55e; background: #f0fdf4; }
        .metric.needs-improvement { border-color: #f59e0b; background: #fffbeb; }
        .metric.poor { border-color: #ef4444; background: #fef2f2; }
        .metric-title { font-weight: 600; margin-bottom: 5px; }
        .metric-value { font-size: 1.2rem; font-weight: bold; }
        .opportunities { margin-top: 20px; }
        .opportunity { padding: 10px; margin: 5px 0; background: #f8fafc; border-radius: 6px; border-left: 3px solid #f59e0b; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Analyse des Rapports Lighthouse</h1>
        <p>Génération automatique des métriques de performance</p>
        <p style="color: #6b7280; font-size: 0.9rem;">Generated on ${new Date().toLocaleDateString("en-US")} at ${new Date().toLocaleTimeString("en-US")}</p>
    </div>
  `;

  analyses.forEach((analysis) => {
    html += `
    <div class="analysis">
        <div class="device-badge ${analysis.device}">${analysis.device === "mobile" ? "📱 Mobile" : "🖥️ Desktop"}</div>
        <h2>${analysis.url}</h2>
        <p style="color: #6b7280;">🕒 ${analysis.timestamp}</p>
        
        <h3>📈 Scores par catégorie</h3>
        <div class="metrics-grid">
    `;

    Object.entries(analysis.categories).forEach(([key, category]) => {
      html += `
            <div class="metric ${category.status}">
                <div class="metric-title">${getStatusEmoji(category.status)} ${category.title}</div>
                <div class="metric-value">${category.score}%</div>
            </div>
      `;
    });

    html += `
        </div>
        
        <h3>⚡ Core Web Vitals</h3>
        <div class="metrics-grid">
    `;

    Object.entries(analysis.metrics).forEach(([key, metric]) => {
      html += `
            <div class="metric ${metric.status}">
                <div class="metric-title">${getStatusEmoji(metric.status)} ${metric.title}</div>
                <div class="metric-value">${metric.displayValue}</div>
                ${metric.score !== null ? `<div style="font-size: 0.9rem; color: #6b7280;">Score: ${metric.score}%</div>` : ""}
            </div>
      `;
    });

    html += "</div>";

    if (analysis.opportunities.length > 0) {
      html += `
        <div class="opportunities">
            <h3>🔧 Principales Opportunités</h3>
      `;

      analysis.opportunities.slice(0, 5).forEach((opp) => {
        html += `
            <div class="opportunity">
                <strong>⚠️ ${opp.title}</strong><br>
                <span style="color: #6b7280;">Économie potentielle: ${opp.savings}ms</span>
            </div>
        `;
      });

      html += "</div>";
    }

    html += "</div>";
  });

  html += `
    <div style="text-align: center; margin-top: 40px; color: #6b7280;">
        <p>🔄 Pour mettre à jour cette analyse, relancez: <code>node lighthouse-analyzer.js</code></p>
    </div>
</body>
</html>
  `;

  return html;
}

// Fonction principale
async function main() {
  const reportsDir = path.join(process.cwd(), "reports");

  try {
    const files = await fs.readdir(reportsDir);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log("❌ Aucun fichier JSON trouvé dans le dossier reports/");
      console.log(
        "💡 Générez d'abord un rapport JSON avec: pnpm lighthouse:json",
      );
      return;
    }

    console.log(`🔍 Analyse de ${jsonFiles.length} rapport(s) JSON...`);

    const analyses = [];

    for (const file of jsonFiles) {
      const filePath = path.join(reportsDir, file);
      console.log(`📊 Analyse de ${file}...`);

      try {
        const analysis = await analyzeReport(filePath);
        analyses.push(analysis);
        console.log(`✅ ${file} analysé`);
      } catch (error) {
        console.error(`❌ Erreur avec ${file}: ${error.message}`);
      }
    }

    if (analyses.length === 0) {
      console.log("❌ Aucun rapport valide trouvé");
      return;
    }

    // Générer le rapport texte
    const textReport = generateReport(analyses);
    await fs.writeFile(path.join(reportsDir, "analysis.txt"), textReport);
    console.log("📄 Rapport texte généré: reports/analysis.txt");

    // Générer le rapport HTML
    const htmlReport = generateHTMLReport(analyses);
    await fs.writeFile(path.join(reportsDir, "analysis.html"), htmlReport);
    console.log("🌐 Rapport HTML généré: reports/analysis.html");

    // Afficher le résumé dans la console
    console.log("\n" + textReport);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (
  import.meta.url.startsWith("file:") &&
  process.argv[1] &&
  import.meta.url.includes(process.argv[1])
) {
  main();
}

export default { analyzeReport, generateReport, generateHTMLReport };
