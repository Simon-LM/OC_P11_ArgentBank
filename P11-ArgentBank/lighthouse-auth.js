#!/usr/bin/env node
/** @format */

import puppeteer from "puppeteer";

/**
 * 🔐 Module d'authentification automatisée pour Lighthouse
 * Permet de se connecter automatiquement et récupérer les cookies de session
 */

// Identifiants de test
const TEST_CREDENTIALS = {
	email: "tony@stark.com",
	password: "password123",
};

/**
 * Se connecte automatiquement et récupère les cookies de session
 * @param {string} baseUrl - URL de base de l'application
 * @returns {Promise<Array>} - Tableau des cookies de session
 */
async function getAuthenticatedCookies(baseUrl = "http://localhost:3000") {
	console.log("🔑 Démarrage de l'authentification automatique...");

	let browser;
	try {
		// Lancer un navigateur headless
		browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		const page = await browser.newPage();

		console.log("🌐 Navigation vers la page de connexion...");
		await page.goto(`${baseUrl}/signIn`, {
			waitUntil: "networkidle0",
			timeout: 30000,
		});

		// Attendre que React soit complètement chargé
		console.log("⏳ Attente du chargement complet de React...");

		// Attendre que React soit monté et que les éléments soient disponibles
		try {
			// Attendre la présence du root et du formulaire
			await page.waitForSelector("#root", { timeout: 15000 });
			await page.waitForSelector('form[aria-labelledby="signin-title"]', {
				timeout: 15000,
			});

			// Attendre les champs spécifiques utilisés par la page React
			await page.waitForSelector("#email", { visible: true, timeout: 15000 });
			await page.waitForSelector("#password", {
				visible: true,
				timeout: 15000,
			});
			await page.waitForSelector('button[type="submit"]', {
				visible: true,
				timeout: 15000,
			});

			console.log("✅ Tous les éléments React sont maintenant disponibles");

			// Délai supplémentaire pour s'assurer que tous les événements React sont attachés
			await page.waitForTimeout(1000);
		} catch (error) {
			console.error("❌ Échec de l'attente des éléments React:", error.message);

			// Debug: afficher le contenu de la page
			const bodyContent = await page.content();
			console.log("🔍 Contenu de la page pour debug:");
			console.log(bodyContent.substring(0, 3000));
			throw new Error(
				"Les éléments du formulaire React ne sont pas disponibles"
			);
		}

		// Utiliser les sélecteurs exacts de la page React
		const emailSelector = "#email";
		const passwordSelector = "#password";

		console.log("📝 Remplissage du formulaire...");
		// Effacer les champs d'abord puis saisir les valeurs
		await page.click(emailSelector);
		await page.keyboard.down("Control");
		await page.keyboard.press("KeyA");
		await page.keyboard.up("Control");
		await page.type(emailSelector, TEST_CREDENTIALS.email);

		await page.click(passwordSelector);
		await page.keyboard.down("Control");
		await page.keyboard.press("KeyA");
		await page.keyboard.up("Control");
		await page.type(passwordSelector, TEST_CREDENTIALS.password);

		console.log("🚀 Soumission du formulaire...");

		// Utiliser le bouton exact de la page React
		const submitButton = 'button[type="submit"]';

		try {
			// Attendre que le bouton soit cliquable
			await page.waitForSelector(submitButton, {
				visible: true,
				timeout: 5000,
			});
			await page.click(submitButton);
			console.log("✅ Bouton de soumission cliqué");
		} catch (error) {
			console.log("⚠️ Bouton submit non trouvé, essai avec Entrée");
			// Essayer d'appuyer sur Entrée dans le champ password
			await page.focus(passwordSelector);
			await page.keyboard.press("Enter");
			console.log("✅ Formulaire soumis avec Entrée");
		}

		// Attendre la redirection ou un changement d'URL
		console.log("⏳ Attente de la redirection...");
		await page.waitForFunction(() => window.location.pathname !== "/signIn", {
			timeout: 15000,
		});

		console.log("✅ Connexion réussie, récupération des cookies...");
		// Récupérer tous les cookies
		const cookies = await page.cookies();

		// Filtrer les cookies pertinents (tokens, session, etc.)
		const authCookies = cookies.filter(
			(cookie) =>
				cookie.name.includes("token") ||
				cookie.name.includes("session") ||
				cookie.name.includes("auth") ||
				cookie.name.includes("jwt") ||
				cookie.domain.includes("localhost")
		);

		console.log(
			`🍪 ${authCookies.length} cookies d'authentification récupérés`
		);

		return authCookies;
	} catch (error) {
		console.error("❌ Erreur lors de l'authentification:", error.message);
		throw error;
	} finally {
		if (browser) {
			await browser.close();
		}
	}
}

/**
 * Teste si une URL nécessite une authentification (version simplifiée)
 * @param {string} url - URL à tester
 * @returns {boolean} - true si authentification requise
 */
function requiresAuthentication(url) {
	// URLs protégées connues
	const protectedPaths = [
		"/user/profile",
		"/profile",
		"/dashboard",
		"/account",
	];

	return protectedPaths.some((path) => url.includes(path));
}

/**
 * Convertit les cookies Puppeteer au format Lighthouse
 * @param {Array} cookies - Cookies de Puppeteer
 * @returns {Array} - Cookies au format Lighthouse
 */
function convertCookiesForLighthouse(cookies) {
	return cookies.map((cookie) => ({
		name: cookie.name,
		value: cookie.value,
		domain: cookie.domain,
		path: cookie.path,
		httpOnly: cookie.httpOnly,
		secure: cookie.secure,
		sameSite: cookie.sameSite,
	}));
}

/**
 * Sauvegarde les cookies dans un fichier pour réutilisation
 * @param {Array} cookies - Cookies à sauvegarder
 * @param {string} filePath - Chemin du fichier
 */
async function saveCookies(cookies, filePath = "./auth-cookies.json") {
	try {
		await fs.writeFile(filePath, JSON.stringify(cookies, null, 2));
		console.log(`💾 Cookies sauvegardés dans: ${filePath}`);
	} catch (error) {
		console.error(
			"❌ Erreur lors de la sauvegarde des cookies:",
			error.message
		);
	}
}

/**
 * Charge les cookies depuis un fichier
 * @param {string} filePath - Chemin du fichier
 * @returns {Promise<Array>} - Cookies chargés
 */
async function loadCookies(filePath = "./auth-cookies.json") {
	try {
		const data = await fs.readFile(filePath, "utf8");
		const cookies = JSON.parse(data);
		console.log(`📂 ${cookies.length} cookies chargés depuis: ${filePath}`);
		return cookies;
	} catch (error) {
		console.warn(`⚠️ Impossible de charger les cookies: ${error.message}`);
		return [];
	}
}

export {
	getAuthenticatedCookies,
	requiresAuthentication,
	convertCookiesForLighthouse,
	saveCookies,
	loadCookies,
	TEST_CREDENTIALS,
};
