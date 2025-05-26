/** @format */

import pa11y from "pa11y";
import puppeteer from "puppeteer"; // Importer puppeteer
import path from "path";
import { fileURLToPath } from "url";
import authScript from "./pa11y-auth.js"; // Importer le script d'authentification

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des URLs à tester
const urlsToTest = [
	{
		url: "http://localhost:3000/",
		needsAuth: false,
	},
	{
		url: "http://localhost:3000/signIn",
		needsAuth: false,
	},
	{
		url: "http://localhost:3000/user",
		name: "User Dashboard Page (Authenticated)",
		needsAuth: true,
		// Actions à exécuter APRÈS que authScript ait terminé et que nous soyons sur la page /user
		postAuthActions: [
			`screenCapture ${path.join(__dirname, "screenshots/success/screenshot_user_page_after_auth.png")}`, // On garde seulement la capture
		],
		pa11yOptions: {
			screenCapture: path.join(
				__dirname,
				"screenshots/success/pa11y_user_page_after_auth.png"
			),
		},
	},
];

// Options Pa11y par défaut
const defaultOptions = {
	log: {
		debug: console.log,
		error: console.error,
		info: console.log,
	},
	runners: ["htmlcs"], // Utiliser le runner HTML CodeSniffer
	chromeLaunchConfig: {
		// Utilisé par puppeteer.launch()
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
		// headless: false, // Décommenter pour voir le navigateur (utile pour le débogage)
		// slowMo: 50, // Ralentit les opérations de Puppeteer (utile pour le débogage)
	},
	timeout: 90000, // Timeout global pour chaque appel pa11y()
};

async function runTests() {
	console.log("Starting Pa11y tests with external Puppeteer page setup...");
	let allTestsPassed = true;
	let results = [];

	const browser = await puppeteer.launch(defaultOptions.chromeLaunchConfig);

	for (const scenario of urlsToTest) {
		console.log(`Testing URL: ${scenario.url}`);
		let page;
		// Cloner defaultOptions et préparer les options spécifiques pour cet appel pa11y
		let pa11yOptions = {
			...defaultOptions,
			actions: [], // Initialiser les actions
		};
		// Ces options ne sont pas pour pa11y() directement si on fournit une page
		delete pa11yOptions.chromeLaunchConfig;

		try {
			page = await browser.newPage();
			await page.setViewport({ width: 1280, height: 800 }); // Définir une taille de fenêtre

			if (scenario.needsAuth) {
				console.log(`Authenticating for ${scenario.url} using authScript...`);
				// authScript prend la page, navigue vers /signIn, se connecte, et devrait laisser la page sur /user
				await authScript(page);
				console.log(`Auth script finished. Current page URL: ${page.url()}`);

				// Configurer les actions post-authentification pour Pa11y
				if (scenario.postAuthActions) {
					pa11yOptions.actions = scenario.postAuthActions;
				}
			} else {
				console.log(`Navigating to ${scenario.url}...`);
				// Pour les pages sans authentification, naviguer directement
				await page.goto(scenario.url, {
					waitUntil: "networkidle0",
					timeout: defaultOptions.timeout / 2,
				});
				// Si des actions sont définies pour les pages non authentifiées
				if (scenario.actions) {
					pa11yOptions.actions = scenario.actions;
				}
			}

			// Passer la page préparée (authentifiée ou non) à Pa11y
			pa11yOptions.page = page;
			pa11yOptions.browser = browser; // Ajouter l'instance du navigateur

			// Pa11y testera le contenu actuel de pa11yOptions.page.
			// scenario.url est utilisé ici principalement pour le rapport.
			const result = await pa11y(scenario.url, pa11yOptions);
			results.push(result);

			if (result.issues.length > 0) {
				allTestsPassed = false;
				console.error(`Pa11y found issues on ${result.pageUrl}:`); // Utiliser result.pageUrl
				result.issues.forEach((issue) => {
					console.error(`  - ${issue.message} (${issue.code})`);
				});
			} else {
				console.log(`No issues found on ${result.pageUrl}.`);
			}
		} catch (error) {
			allTestsPassed = false;
			console.error(`Error testing ${scenario.url}:`, error.message);
			if (page && !page.isClosed()) {
				const errorScreenshotPath = path.join(
					__dirname,
					"screenshots/errors",
					`error_test_${scenario.url.replace(/[^a-zA-Z0-9]/g, "_")}.png`
				);
				try {
					await page.screenshot({ path: errorScreenshotPath });
					console.log(`Screenshot captured on error: ${errorScreenshotPath}`);
				} catch (ssError) {
					console.error(`Could not take screenshot: ${ssError.message}`);
				}
			}
			results.push({
				documentTitle: `Error testing ${scenario.url}`,
				pageUrl: scenario.url,
				issues: [
					{
						code: "Pa11yScriptError",
						message: error.message,
						type: "error",
						selector: "",
						context: "",
					},
				],
			});
		} finally {
			if (page && !page.isClosed()) {
				await page.close(); // Fermer la page après chaque scénario
			}
		}
		console.log("---");
	}

	await browser.close(); // Fermer le navigateur une fois tous les tests terminés

	if (allTestsPassed) {
		console.log("All Pa11y tests passed!");
		process.exit(0);
	} else {
		console.error("Some Pa11y tests failed. Check logs and screenshots.");
		// Afficher un résumé des problèmes
		results.forEach((result) => {
			if (result.issues && result.issues.length > 0) {
				console.error(`
Issues for ${result.pageUrl}:`);
				result.issues.forEach((issue) => {
					console.error(
						`  - ${issue.message} (Code: ${issue.code}, Selector: ${issue.selector || "N/A"})`
					);
				});
			}
		});
		process.exit(1);
	}
}

runTests();
