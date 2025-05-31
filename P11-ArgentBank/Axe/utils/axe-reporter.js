/** @format */

// Générateur de rapports Axe personnalisés
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

export class AxeReporter {
  constructor(outputDir = "Axe/reports") {
    this.outputDir = outputDir;
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    try {
      mkdirSync(resolve(this.outputDir, "html"), { recursive: true });
      mkdirSync(resolve(this.outputDir, "json"), { recursive: true });
    } catch (error) {
      console.error("Error creating report directories:", error);
    }
  }

  // Générer un rapport JSON détaillé
  generateJSONReport(results, metadata = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `axe-report-${timestamp}.json`;

    const report = {
      metadata: {
        timestamp: new Date().toISOString(),
        project: "ArgentBank",
        tool: "Axe-core",
        version: "4.10.3",
        ...metadata,
      },
      summary: {
        total:
          results.violations.length +
          results.passes.length +
          results.incomplete.length,
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length,
      },
      results: results,
      analysis: this.analyzeResults(results),
    };

    const filepath = resolve(this.outputDir, "json", filename);
    writeFileSync(filepath, JSON.stringify(report, null, 2));

    return { filepath, filename, report };
  }

  // Générer un rapport HTML lisible
  generateHTMLReport(results, metadata = {}) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `axe-report-${timestamp}.html`;

    const html = this.createHTMLTemplate(results, metadata);
    const filepath = resolve(this.outputDir, "html", filename);

    writeFileSync(filepath, html);

    return { filepath, filename };
  }

  // Analyser les résultats pour des insights
  analyzeResults(results) {
    const violationsByImpact = results.violations.reduce((acc, violation) => {
      acc[violation.impact] = (acc[violation.impact] || 0) + 1;
      return acc;
    }, {});

    const violationsByRule = results.violations.reduce((acc, violation) => {
      acc[violation.id] = (acc[violation.id] || 0) + 1;
      return acc;
    }, {});

    const topViolations = Object.entries(violationsByRule)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      violationsByImpact,
      violationsByRule,
      topViolations,
      compliance: {
        score: this.calculateComplianceScore(results),
        level: this.determineComplianceLevel(results),
      },
    };
  }

  // Calculer un score de conformité
  calculateComplianceScore(results) {
    const total = results.violations.length + results.passes.length;
    if (total === 0) return 100;

    const weightedViolations = results.violations.reduce((sum, violation) => {
      const weights = { critical: 4, serious: 3, moderate: 2, minor: 1 };
      return sum + (weights[violation.impact] || 1);
    }, 0);

    const maxPossibleScore = total * 4; // Si toutes les règles étaient critical
    const score = Math.max(
      0,
      ((maxPossibleScore - weightedViolations) / maxPossibleScore) * 100,
    );

    return Math.round(score * 100) / 100;
  }

  // Déterminer le niveau de conformité
  determineComplianceLevel(results) {
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical",
    ).length;
    const seriousViolations = results.violations.filter(
      (v) => v.impact === "serious",
    ).length;

    if (criticalViolations > 0) return "Non-conforme";
    if (seriousViolations > 5) return "Partiellement conforme";
    if (seriousViolations > 0) return "Conforme avec réserves";
    return "Pleinement conforme";
  }

  // Template HTML pour les rapports
  createHTMLTemplate(results, metadata) {
    const timestamp = new Date().toLocaleString("fr-FR");
    const analysis = this.analyzeResults(results);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Axe - ArgentBank</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #00bc77; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { color: #00bc77; font-size: 24px; font-weight: bold; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .metric { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; border-left: 4px solid #00bc77; }
    .metric-value { font-size: 2em; font-weight: bold; color: #333; }
    .metric-label { color: #666; font-size: 0.9em; margin-top: 5px; }
    .violation { background: #fff5f5; border-left: 4px solid #e53e3e; margin: 10px 0; padding: 15px; border-radius: 4px; }
    .violation-critical { border-left-color: #e53e3e; }
    .violation-serious { border-left-color: #dd6b20; }
    .violation-moderate { border-left-color: #d69e2e; }
    .violation-minor { border-left-color: #38a169; }
    .pass { background: #f0fff4; border-left: 4px solid #38a169; margin: 5px 0; padding: 10px; border-radius: 4px; }
    .score { font-size: 3em; font-weight: bold; color: ${analysis.compliance.score > 80 ? "#38a169" : analysis.compliance.score > 60 ? "#d69e2e" : "#e53e3e"}; }
    pre { background: #f8f9fa; padding: 15px; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🛡️ ArgentBank - Rapport d'Accessibilité Axe</div>
      <p>Généré le ${timestamp}</p>
    </div>
    
    <div class="summary">
      <div class="metric">
        <div class="metric-value score">${analysis.compliance.score}%</div>
        <div class="metric-label">Score de conformité</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #e53e3e;">${results.violations.length}</div>
        <div class="metric-label">Violations</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #38a169;">${results.passes.length}</div>
        <div class="metric-label">Tests réussis</div>
      </div>
      <div class="metric">
        <div class="metric-value" style="color: #d69e2e;">${results.incomplete.length}</div>
        <div class="metric-label">Tests incomplets</div>
      </div>
    </div>
    
    <h2>📊 Niveau de conformité : ${analysis.compliance.level}</h2>
    
    ${
      results.violations.length > 0
        ? `
    <h2>❌ Violations d'accessibilité</h2>
    ${results.violations
      .map(
        (violation) => `
    <div class="violation violation-${violation.impact}">
      <h3>${violation.id} - ${violation.impact.toUpperCase()}</h3>
      <p><strong>Description:</strong> ${violation.description}</p>
      <p><strong>Aide:</strong> ${violation.help}</p>
      <p><strong>Éléments affectés:</strong> ${violation.nodes.length}</p>
      <a href="${violation.helpUrl}" target="_blank">📖 En savoir plus</a>
    </div>
    `,
      )
      .join("")}
    `
        : "<h2>✅ Aucune violation détectée !</h2>"
    }
    
    <h2>📈 Analyse détaillée</h2>
    <pre>${JSON.stringify(analysis, null, 2)}</pre>
    
    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
      <p>Rapport généré par Axe-core v4.10.3 pour ArgentBank</p>
    </footer>
  </div>
</body>
</html>`;
  }

  // Générer un rapport de synthèse pour CI/CD
  generateCISummary(results) {
    const analysis = this.analyzeResults(results);

    return {
      success: results.violations.length === 0,
      score: analysis.compliance.score,
      level: analysis.compliance.level,
      violations: results.violations.length,
      critical: results.violations.filter((v) => v.impact === "critical")
        .length,
      serious: results.violations.filter((v) => v.impact === "serious").length,
      summary: `Axe: ${results.violations.length} violations, score: ${analysis.compliance.score}%`,
    };
  }
}

export default AxeReporter;
