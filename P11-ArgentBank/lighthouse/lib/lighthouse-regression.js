#!/usr/bin/env node
/** @format */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration pour modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dossier de rapports
const REPORTS_DIR = path.join(__dirname, "../reports");
const BASELINE_REPORT = path.join(REPORTS_DIR, "baseline.json");

// Seuils de régression (% de dégradation autorisée)
const REGRESSION_THRESHOLDS = {
	performance: 5, // 5% de dégradation maximum
	accessibility: 2,
	"best-practices": 2,
	seo: 2,
	"first-contentful-paint": 10, // 10% de dégradation maximum
	"largest-contentful-paint": 10,
	"total-blocking-time": 15,
	"cumulative-layout-shift": 10,
	"speed-index": 10,
	interactive: 10,
};

async function main() {
	try {
		// Lire le dernier rapport
		const reports = await fs.readdir(REPORTS_DIR);
		const jsonReports = reports.filter(
			(file) => file.endsWith(".json") && file !== "baseline.json"
		);

		if (jsonReports.length === 0) {
			console.error("❌ Aucun rapport JSON trouvé dans", REPORTS_DIR);
			process.exit(1);
		}

		// Trier par date de modification (le plus récent en premier)
		const reportStats = await Promise.all(
			jsonReports.map(async (file) => {
				const stats = await fs.stat(path.join(REPORTS_DIR, file));
				return { file, mtime: stats.mtime };
			})
		);

		reportStats.sort((a, b) => b.mtime - a.mtime);
		const latestReport = reportStats[0].file;

		// Lire le contenu du rapport
		const reportPath = path.join(REPORTS_DIR, latestReport);
		const report = JSON.parse(await fs.readFile(reportPath, "utf-8"));

		// Vérifier si un rapport de référence existe
		let baseline;
		try {
			baseline = JSON.parse(await fs.readFile(BASELINE_REPORT, "utf-8"));
			console.log("✅ Rapport de référence trouvé, comparaison en cours...");
		} catch (err) {
			console.log(
				"⚠️ Aucun rapport de référence trouvé, création d'une nouvelle référence..."
			);
			await fs.writeFile(BASELINE_REPORT, JSON.stringify(report, null, 2));
			console.log("✅ Nouvelle référence créée:", BASELINE_REPORT);
			process.exit(0);
		}

		// Comparer les résultats
		const results = compareReports(report, baseline);

		// Afficher les résultats
		console.log("\n📊 RAPPORT DE RÉGRESSION LIGHTHOUSE");
		console.log("===================================");

		let hasFailures = false;

		for (const [metric, data] of Object.entries(results)) {
			const { current, baseline, change, failed } = data;

			const status = failed ? "❌ ÉCHEC" : "✅ OK";
			const changeFormatted = change.toFixed(2);
			const sign = change > 0 ? "+" : "";

			console.log(
				`${status} ${metric}: ${current.toFixed(2)} (${sign}${changeFormatted}% vs référence: ${baseline.toFixed(2)})`
			);

			if (failed) {
				hasFailures = true;
			}
		}

		console.log("\n");

		if (hasFailures) {
			console.error(
				"❌ Échec des tests de régression Lighthouse. Des métriques se sont dégradées au-delà des seuils acceptables."
			);
			process.exit(1);
		} else {
			console.log(
				"✅ Tests de régression Lighthouse réussis. Aucune dégradation significative détectée."
			);
			process.exit(0);
		}
	} catch (error) {
		console.error("❌ Erreur lors de l'analyse des rapports:", error);
		process.exit(1);
	}
}

function compareReports(current, baseline) {
	const results = {};

	// Comparer les catégories
	for (const category of [
		"performance",
		"accessibility",
		"best-practices",
		"seo",
	]) {
		const currentScore = current.categories[category]?.score * 100 || 0;
		const baselineScore = baseline.categories[category]?.score * 100 || 0;

		const change = ((currentScore - baselineScore) / baselineScore) * 100;
		const threshold = REGRESSION_THRESHOLDS[category] || 5;

		results[category] = {
			current: currentScore,
			baseline: baselineScore,
			change,
			failed: change < -threshold, // Échoue si la dégradation est supérieure au seuil
		};
	}

	// Comparer les métriques spécifiques
	const metrics = [
		"first-contentful-paint",
		"largest-contentful-paint",
		"total-blocking-time",
		"cumulative-layout-shift",
		"speed-index",
		"interactive",
	];

	for (const metric of metrics) {
		const currentValue = current.audits[metric]?.numericValue || 0;
		const baselineValue = baseline.audits[metric]?.numericValue || 0;

		// Pour les métriques de temps, une augmentation est une dégradation
		const change = ((currentValue - baselineValue) / baselineValue) * 100;
		const threshold = REGRESSION_THRESHOLDS[metric] || 10;

		results[metric] = {
			current: currentValue,
			baseline: baselineValue,
			change,
			failed: change > threshold, // Échoue si l'augmentation est supérieure au seuil
		};
	}

	return results;
}

main();
