#!/usr/bin/env node
/** @format */

import puppeteer from "puppeteer";
import fs from "fs/promises";
import { loadCookies } from "./lighthouse-auth-v2.js";

/**
 * Injecte les tokens d'authentification dans le localStorage et sessionStorage
 * avant l'exécution de Lighthouse.
 */

async function injectAuthTokens(
	url = "http://localhost:3000",
	authDataPath = "./auth-cookies.json"
) {
	console.log(
		"🔑 Initialisation de l'injection des tokens d'authentification..."
	);
	let browser;

	try {
		// Charger les données d'authentification
		const authData = await loadCookies(authDataPath);

		// Vérifier si nous avons des tokens à injecter
		const hasLocalStorage =
			Object.keys(authData.storage?.localStorage || {}).length > 0;
		const hasSessionStorage =
			Object.keys(authData.storage?.sessionStorage || {}).length > 0;

		if (!hasLocalStorage && !hasSessionStorage) {
			console.log("⚠️ Aucun token trouvé dans le stockage - rien à injecter");
			return false;
		}

		// Lancer un navigateur
		browser = await puppeteer.launch({
			headless: false, // Pour permettre de voir ce qui se passe
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-web-security",
			],
		});

		const page = await browser.newPage();

		// Naviguer vers l'URL
		console.log(`🌐 Navigation vers ${url}...`);
		await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

		// Injecter les tokens dans le localStorage et sessionStorage
		await page.evaluate((storageData) => {
			// Injecter dans localStorage
			if (storageData.localStorage) {
				console.log("Injection dans localStorage...");
				for (const [key, value] of Object.entries(storageData.localStorage)) {
					localStorage.setItem(key, value);
					console.log(`  - ${key}: ${value.substring(0, 20)}...`);
				}
			}

			// Injecter dans sessionStorage
			if (storageData.sessionStorage) {
				console.log("Injection dans sessionStorage...");
				for (const [key, value] of Object.entries(storageData.sessionStorage)) {
					sessionStorage.setItem(key, value);
					console.log(`  - ${key}: ${value.substring(0, 20)}...`);
				}
			}

			return {
				localStorage: Object.keys(storageData.localStorage || {}),
				sessionStorage: Object.keys(storageData.sessionStorage || {}),
			};
		}, authData.storage);

		// Vérifier l'état de connexion
		const isLoggedIn = await page.evaluate(() => {
			// Vérifier si le token existe
			return !!(
				sessionStorage.getItem("authToken") || localStorage.getItem("authToken")
			);
		});

		if (isLoggedIn) {
			console.log("✅ Injection réussie - tokens d'authentification injectés");

			// Attendre que l'utilisateur soit prêt à continuer (pour permettre de lancer Lighthouse)
			console.log("\n📣 IMPORTANT: Maintenant que vous êtes authentifié:");
			console.log("1. Gardez cette fenêtre ouverte");
			console.log("2. Lancez Lighthouse dans ce même navigateur");
			console.log(
				"3. Après avoir terminé les tests, revenez ici et appuyez sur Entrée\n"
			);

			// Garder le navigateur ouvert pour permettre à l'utilisateur de lancer Lighthouse
			await new Promise((resolve) => {
				process.stdin.once("data", (data) => {
					console.log("🔄 Fermeture du navigateur...");
					resolve();
				});

				console.log("Appuyez sur Entrée pour terminer...");
			});

			return true;
		} else {
			console.log(
				"❌ L'injection a échoué - impossible de vérifier l'état de connexion"
			);
			return false;
		}
	} catch (error) {
		console.error("❌ Erreur lors de l'injection des tokens:", error.message);
		return false;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
	const args = process.argv.slice(2);
	const url = args[0] || "http://localhost:3000";

	injectAuthTokens(url)
		.then((success) => {
			console.log(
				success
					? "✅ Injection terminée avec succès"
					: "⚠️ Injection terminée avec des avertissements"
			);
			process.exit(success ? 0 : 1);
		})
		.catch((error) => {
			console.error("❌ Échec de l'injection:", error);
			process.exit(1);
		});
}

export default injectAuthTokens;
