#!/usr/bin/env node
/** @format */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
	getAuthenticatedCookies,
	requiresAuthentication,
	convertCookiesForLighthouse,
} from "../lib/lighthouse-auth-v2.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour générer un timestamp
function generateTimestamp() {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, "0");
	const day = String(now.getDate()).padStart(2, "0");
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const seconds = String(now.getSeconds()).padStart(2, "0");

	return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

// Configuration par défaut
const defaultConfig = {
	url: "http://localhost:3000",
	output: "html",
	outputPath: path.join(
		__dirname,
		`../reports/lighthouse-${generateTimestamp()}.html`
	),
	configPath: path.join(__dirname, "../config/lighthouse.config.js"),
	mobile: true,
	desktop: false,
};

// Parse des arguments de ligne de commande
function parseArgs() {
	const args = process.argv.slice(2);
	const config = { ...defaultConfig };

	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case "--url":
				config.url = args[++i];
				break;
			case "--output":
				config.output = args[++i];
				break;
			case "--output-path":
				config.outputPath = args[++i];
				break;
			case "--desktop":
				config.mobile = false;
				config.desktop = true;
				break;
			case "--mobile":
				config.mobile = true;
				config.desktop = false;
				break;
			case "--help":
				console.log(`
Usage: node lighthouse-runner.js [options]

Options:
  --url <url>           URL à tester (défaut: ${defaultConfig.url})
  --output <format>     Format de sortie: html, json, csv (défaut: ${defaultConfig.output})
  --output-path <path>  Chemin du fichier de sortie (défaut: ${defaultConfig.outputPath})
  --mobile             Test en mode mobile (défaut)
  --desktop            Test en mode desktop
  --help               Affiche cette aide

Exemples:
  node lighthouse-runner.js
  node lighthouse-runner.js --url http://localhost:3000/profile --desktop
  node lighthouse-runner.js --output json --output-path ./reports/perf.json
        `);
				process.exit(0);
		}
	}

	return config;
}

// Configuration Lighthouse
function getLighthouseConfig(isMobile = true) {
	return {
		extends: "lighthouse:default",
		settings: {
			onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
			formFactor: isMobile ? "mobile" : "desktop",
			throttling: isMobile
				? {
						rttMs: 150,
						throughputKbps: 1638.4,
						cpuSlowdownMultiplier: 4,
						requestLatencyMs: 0,
						downloadThroughputKbps: 1638.4,
						uploadThroughputKbps: 675,
					}
				: {
						rttMs: 40,
						throughputKbps: 10240,
						cpuSlowdownMultiplier: 1,
						requestLatencyMs: 0,
						downloadThroughputKbps: 10240,
						uploadThroughputKbps: 10240,
					},
			screenEmulation: isMobile
				? {
						mobile: true,
						width: 375,
						height: 667,
						deviceScaleFactor: 2,
						disabled: false,
					}
				: {
						mobile: false,
						width: 1350,
						height: 940,
						deviceScaleFactor: 1,
						disabled: false,
					},
			emulatedUserAgent: isMobile
				? "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36"
				: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
			maxWaitForLoad: 45000,
			maxWaitForFcp: 15000,
			skipAudits: ["unused-javascript", "unused-css-rules"],
		},
	};
}

// Fonction principale
async function runLighthouse() {
	const config = parseArgs();

	console.log(`🚀 Démarrage de l'audit Lighthouse...`);
	console.log(`📱 Mode: ${config.mobile ? "Mobile" : "Desktop"}`);
	console.log(`🌐 URL: ${config.url}`);

	let chrome;

	try {
		// Vérifier si l'URL nécessite une authentification
		const needsAuth = requiresAuthentication(config.url);
		let cookies = null;

		if (needsAuth) {
			console.log("🔐 URL protégée détectée - authentification automatique...");
			try {
				const authData = await getAuthenticatedCookies();
				cookies = authData.cookies || [];
				const storage = authData.storage || {
					localStorage: {},
					sessionStorage: {},
				};

				console.log("✅ Authentification réussie - données récupérées");

				// Vérifier si nous avons trouvé des tokens dans le stockage
				const hasStorageTokens =
					Object.keys(storage.localStorage || {}).length > 0 ||
					Object.keys(storage.sessionStorage || {}).length > 0;

				if (hasStorageTokens) {
					console.log("🔑 Tokens trouvés dans le localStorage/sessionStorage");
					console.log(
						"⚠️ Note: Lighthouse ne peut pas automatiquement utiliser ces tokens."
					);
					console.log(
						"💡 Solution: Utilisez le pre-auth state avec les extensions Chrome pour Lighthouse."
					);
				}
			} catch (authError) {
				console.error(
					"❌ Échec de l'authentification automatique:",
					authError.message
				);
				throw new Error(
					`Impossible d'accéder à la page protégée: ${authError.message}`
				);
			}
		} else {
			console.log("🔍 Vérification de l'accessibilité de l'URL...");
		}

		// Lancer Chrome
		chrome = await chromeLauncher.launch({
			chromeFlags: [
				"--headless",
				"--no-sandbox",
				"--disable-dev-shm-usage",
				"--disable-background-timer-throttling",
				"--disable-backgrounding-occluded-windows",
				"--disable-renderer-backgrounding",
				"--disable-extensions",
				"--disable-default-apps",
			],
		});

		console.log(`🔧 Chrome lancé sur le port ${chrome.port}`);

		// Configuration Lighthouse
		const options = {
			logLevel: "info",
			output: config.output,
			port: chrome.port,
		};

		// Ajouter les cookies si nécessaires
		if (cookies) {
			const lighthouseCookies = convertCookiesForLighthouse(cookies);
			if (lighthouseCookies.length > 0) {
				options.extraHeaders = options.extraHeaders || {};
				options.extraHeaders.Cookie = lighthouseCookies
					.map((cookie) => `${cookie.name}=${cookie.value}`)
					.join("; ");
				console.log("🍪 Cookies d'authentification ajoutés à Lighthouse");
			}
		}

		const lighthouseConfig = getLighthouseConfig(config.mobile);

		console.log("⚡ Exécution de l'audit Lighthouse...");

		// Exécuter Lighthouse
		const runnerResult = await lighthouse(
			config.url,
			options,
			lighthouseConfig
		);

		if (!runnerResult) {
			throw new Error("Lighthouse n'a pas pu s'exécuter");
		}

		const { lhr, report } = runnerResult;

		// Afficher les résultats principaux
		console.log("\n📊 RÉSULTATS LIGHTHOUSE");
		console.log("========================");

		const categories = lhr.categories;
		Object.keys(categories).forEach((categoryName) => {
			const category = categories[categoryName];
			const score = Math.round(category.score * 100);
			const emoji = score >= 90 ? "🟢" : score >= 50 ? "🟡" : "🔴";
			console.log(`${emoji} ${category.title}: ${score}%`);
		});

		// Métriques de performance détaillées
		if (categories.performance) {
			console.log("\n⚡ MÉTRIQUES DE PERFORMANCE");
			console.log("============================");

			const audits = lhr.audits;
			const metrics = [
				{ key: "first-contentful-paint", name: "First Contentful Paint (FCP)" },
				{
					key: "largest-contentful-paint",
					name: "Largest Contentful Paint (LCP)",
				},
				{
					key: "cumulative-layout-shift",
					name: "Cumulative Layout Shift (CLS)",
				},
				{ key: "total-blocking-time", name: "Total Blocking Time (TBT)" },
				{ key: "speed-index", name: "Speed Index" },
				{ key: "interactive", name: "Time to Interactive (TTI)" },
			];

			metrics.forEach((metric) => {
				const audit = audits[metric.key];
				if (audit && audit.displayValue) {
					const score = audit.score ? Math.round(audit.score * 100) : "N/A";
					const emoji =
						audit.score >= 0.9 ? "🟢" : audit.score >= 0.5 ? "🟡" : "🔴";
					console.log(
						`${emoji} ${metric.name}: ${audit.displayValue} (${score}%)`
					);
				}
			});
		}

		// Opportunités d'amélioration
		console.log("\n🔧 PRINCIPALES OPPORTUNITÉS");
		console.log("============================");

		const opportunities = Object.values(lhr.audits)
			.filter((audit) => audit.details && audit.details.type === "opportunity")
			.sort(
				(a, b) =>
					(b.details.overallSavingsMs || 0) - (a.details.overallSavingsMs || 0)
			)
			.slice(0, 5);

		if (opportunities.length > 0) {
			opportunities.forEach((audit) => {
				const savings = audit.details.overallSavingsMs || 0;
				if (savings > 100) {
					console.log(`⚠️  ${audit.title}: ${Math.round(savings)}ms`);
				}
			});
		} else {
			console.log("✅ Aucune opportunité majeure détectée");
		}

		// Sauvegarder le rapport
		await fs.writeFile(config.outputPath, report);
		console.log(`\n📁 Rapport sauvegardé: ${config.outputPath}`);

		// Afficher le chemin absolu pour faciliter l'ouverture
		const absolutePath = path.resolve(config.outputPath);
		console.log(`🔗 Chemin absolu: ${absolutePath}`);

		if (config.output === "html") {
			console.log(
				`💡 Ouvrez le rapport dans votre navigateur: file://${absolutePath}`
			);
		}
	} catch (error) {
		console.error(
			"❌ Erreur lors de l'exécution de Lighthouse:",
			error.message
		);

		if (error.message.includes("ECONNREFUSED")) {
			console.error("\n💡 Suggestions:");
			console.error(
				"   • Vérifiez que votre serveur de développement fonctionne"
			);
			console.error('   • Lancez "pnpm dev" dans un autre terminal');
			console.error("   • Vérifiez que l'URL est correcte");
		}

		process.exit(1);
	} finally {
		if (chrome) {
			await chrome.kill();
		}
	}
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
	runLighthouse();
}

export default runLighthouse;
