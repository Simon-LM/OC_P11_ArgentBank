/** @format */

import path from "path";
import { fileURLToPath } from "url";

// Définir __dirname pour les modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour générer un nom de fichier horodaté
function generateTimestampedFilename(prefix, suffix = ".png") {
	const now = new Date();
	const timestamp = now
		.toISOString()
		.replace(/:/g, "-")
		.replace(/\..+/, "")
		.replace("T", "_");
	return `${timestamp}_${prefix}${suffix}`;
}

// Ce script est destiné à être utilisé comme une action Pa11y.
// Il prend l'objet `page` de Puppeteer fourni par Pa11y.
export default async (page) => {
	console.log("<<<<< PA11Y AUTH SCRIPT (FUNCTION) STARTED >>>>>");

	const signInUrl = "http://localhost:3000/signIn";
	const userCredentials = {
		email: "tony@stark.com",
		password: "password123",
	};

	const emailSelector = "#email";
	const passwordSelector = "#password";
	const formSelector = 'form[aria-labelledby="signin-title"]'; // Sélecteur du formulaire
	// Le bouton a maintenant un type="submit"
	const submitButtonSelector =
		'form[aria-labelledby="signin-title"] button[type="submit"]';
	// Alternativement, en utilisant la classe spécifique si le type n'est pas fiable ou pour plus de robustesse:
	// const submitButtonSelector = '.signin-form__button'; // Assurez-vous que cette classe est unique et correcte

	try {
		console.log(`<<<<< PA11Y AUTH SCRIPT: Navigating to ${signInUrl} >>>>>`);
		await page.goto(signInUrl, { waitUntil: "networkidle0", timeout: 20000 }); // Augmenté
		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Navigation to /signIn complete >>>>>"
		);

		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Waiting for form to be visible >>>>>"
		);
		await page.waitForSelector(formSelector, {
			visible: true,
			timeout: 15000, // Augmenté
		});
		console.log("<<<<< PA11Y AUTH SCRIPT: Form is visible >>>>>");

		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Waiting for email field to be visible >>>>>"
		);
		await page.waitForSelector(emailSelector, {
			visible: true,
			timeout: 10000,
		});
		console.log("<<<<< PA11Y AUTH SCRIPT: Email field is visible >>>>>");

		console.log("<<<<< PA11Y AUTH SCRIPT: Typing credentials >>>>>");
		await page.type(emailSelector, userCredentials.email, { delay: 100 }); // Délai augmenté
		await page.type(passwordSelector, userCredentials.password, { delay: 100 }); // Délai augmenté
		console.log("<<<<< PA11Y AUTH SCRIPT: Credentials typed >>>>>");

		// Capture d'écran avant de chercher le bouton
		const screenshotBeforeButtonSearchPath = path.join(
			__dirname,
			"screenshots/debug",
			generateTimestampedFilename("debug_before_button_search")
		);
		console.log(
			`<<<<< PA11Y AUTH SCRIPT: Taking screenshot: ${screenshotBeforeButtonSearchPath} >>>>>`
		);
		await page.screenshot({ path: screenshotBeforeButtonSearchPath });

		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Waiting for submit button to be visible and enabled >>>>>"
		);
		// Attendre que le bouton soit visible ET activé (non désactivé)
		await page.waitForSelector(submitButtonSelector, {
			visible: true,
			timeout: 20000, // Augmenté
		});
		await page.waitForFunction(
			(selector) => {
				const button = document.querySelector(selector);
				return button && !button.disabled;
			},
			{ timeout: 10000 }, // Attendre jusqu'à 10 secondes que le bouton devienne activé
			submitButtonSelector
		);
		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Submit button is visible and enabled >>>>>"
		);

		// Petite pause avant de cliquer pour s'assurer que tout est prêt
		await new Promise((resolve) => setTimeout(resolve, 1000)); // Pause augmentée

		const screenshotPath = path.join(
			__dirname,
			"screenshots/debug",
			generateTimestampedFilename("debug_before_submit_click")
		);
		console.log(
			`<<<<< PA11Y AUTH SCRIPT: Taking screenshot: ${screenshotPath} >>>>>`
		);
		await page.screenshot({ path: screenshotPath });

		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Clicking submit button and waiting for navigation >>>>>"
		);
		await Promise.all([
			page.click(submitButtonSelector),
			page.waitForNavigation({ waitUntil: "networkidle0", timeout: 30000 }), // Augmenté
		]);
		const currentUrl = page.url();
		console.log(
			`<<<<< PA11Y AUTH SCRIPT: Form submitted. Current URL after navigation: ${currentUrl} >>>>>`
		);

		if (!currentUrl.includes("/user") && !currentUrl.includes("/User")) {
			console.error(
				`<<<<< PA11Y AUTH SCRIPT: ERROR - Expected to be on /user or /User page, but on ${currentUrl} >>>>>`
			);
			const errorScreenshotPath = path.join(
				__dirname,
				"screenshots/errors",
				generateTimestampedFilename("error_after_login_wrong_page")
			);
			await page.screenshot({ path: errorScreenshotPath });
			console.log(
				`<<<<< PA11Y AUTH SCRIPT: Screenshot taken: ${errorScreenshotPath} >>>>>`
			);
			throw new Error(
				`Authentication failed. Expected to navigate to /user or /User, but landed on ${currentUrl}`
			);
		}

		// Nouvelle vérification : Attendre un élément clé de la page /user pour confirmer
		try {
			console.log(
				'<<<<< PA11Y AUTH SCRIPT: Waiting for user page content (h2[class*="user__title"]) to confirm successful login and rendering... >>>>>'
			);
			await page.waitForSelector('h2[class*="user__title"]', {
				visible: true,
				timeout: 15000,
			}); // Timeout de 15s pour cette vérification

			// Ajout d'un délai supplémentaire pour la stabilisation
			console.log(
				'<<<<< PA11Y AUTH SCRIPT: User page content (h2[class*="user__title"]) found. Adding small delay for page to settle... >>>>>'
			);
			await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause de 2 secondes
			console.log(
				"<<<<< PA11Y AUTH SCRIPT: Small delay complete. Navigation to /user and content rendering confirmed. >>>>>"
			);
		} catch (e) {
			console.error(
				`<<<<< PA11Y AUTH SCRIPT: ERROR - URL is ${currentUrl}, but key element 'h2[class*="user__title"]' not found. Page might not be the expected /user page, content might be missing, or a redirect occurred. >>>>>`
			);
			const verificationErrorScreenshotPath = path.join(
				__dirname,
				"screenshots/errors",
				generateTimestampedFilename(
					"error_auth_user_page_content_verification_failed"
				)
			);
			try {
				await page.screenshot({ path: verificationErrorScreenshotPath });
				console.log(
					`<<<<< PA11Y AUTH SCRIPT: Screenshot taken on content verification failure: ${verificationErrorScreenshotPath} >>>>>`
				);
			} catch (ssError) {
				console.error(
					`<<<<< PA11Y AUTH SCRIPT: Failed to take screenshot on content verification failure: ${ssError} >>>>>`
				);
			}
			throw new Error(
				`Post-authentication content check failed: URL is ${currentUrl}, but 'h2[class*="user__title"]' not found.`
			);
		}

		// Suppression de l'attente pour main.bg-dark ici.
		// La vérification du contenu de la page utilisateur sera gérée par les actions post-authentification dans run-pa11y-tests.js
		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Successfully navigated to /user. Authentication script finished. >>>>>"
		);
		// Les lignes ci-dessous étaient incorrectes et ont été supprimées :
		// timeout: 25000, // Augmenté
		// });
		console.log(
			"<<<<< PA11Y AUTH SCRIPT: Authentication script flow complete. Further checks on /user page are handled by postAuthActions. >>>>>"
		);
	} catch (error) {
		console.error("<<<<< PA11Y AUTH SCRIPT: ERROR >>>>>", error);
		const errorScreenshotPath = path.join(
			__dirname,
			"screenshots/errors",
			generateTimestampedFilename("error_in_auth_script")
		);
		try {
			const currentUrlOnError = page.url();
			console.error(
				`<<<<< PA11Y AUTH SCRIPT: Current URL on error: ${currentUrlOnError} >>>>>`
			);
			await page.screenshot({ path: errorScreenshotPath });
			console.log(
				`<<<<< PA11Y AUTH SCRIPT: Error screenshot taken: ${errorScreenshotPath} >>>>>`
			);
		} catch (screenshotError) {
			console.error(
				`<<<<< PA11Y AUTH SCRIPT: Failed to take error screenshot: ${screenshotError} >>>>>`
			);
		}
		throw error; // Rethrow l'erreur pour que Pa11y la capture
	}
};
