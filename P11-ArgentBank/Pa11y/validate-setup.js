#!/usr/bin/env node
/**
 * Script de validation de la configuration Pa11y
 * Vérifie que tous les fichiers et dépendances sont en place
 * Usage: node Pa11y/validate-setup.js
 *
 * @format
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PA11Y_DIR = __dirname;
const ROOT_DIR = path.dirname(__dirname);

/**
 * Vérifie qu'un fichier existe
 */
function checkFile(filePath, description) {
	if (fs.existsSync(filePath)) {
		console.log(`✅ ${description}`);
		return true;
	} else {
		console.log(`❌ ${description} - MANQUANT: ${filePath}`);
		return false;
	}
}

/**
 * Vérifie qu'un package npm est installé
 */
function checkPackage(packageName) {
	return new Promise((resolve) => {
		const process = spawn("npx", [packageName, "--version"], {
			cwd: ROOT_DIR,
			stdio: "pipe",
		});

		let output = "";
		process.stdout.on("data", (data) => {
			output += data.toString();
		});

		process.on("close", (code) => {
			if (code === 0 && output.trim()) {
				console.log(`✅ ${packageName} v${output.trim()} installé`);
				resolve(true);
			} else {
				console.log(`❌ ${packageName} non installé ou non fonctionnel`);
				resolve(false);
			}
		});

		process.on("error", () => {
			console.log(`❌ ${packageName} non installé`);
			resolve(false);
		});
	});
}

/**
 * Vérifie la configuration
 */
function validateConfig() {
	// Nouvelle approche : pas de fichier JSON à valider
	// Le script personnalisé gère tout en JavaScript
	console.log(
		"✅ Configuration basée sur le script personnalisé run-pa11y-tests.js"
	);

	// Vérifier que le script principal existe et est valide
	const scriptPath = path.join(PA11Y_DIR, "run-pa11y-tests.js");
	if (fs.existsSync(scriptPath)) {
		console.log("✅ Script principal de test configuré");
		return true;
	} else {
		console.log("❌ Script principal de test manquant");
		return false;
	}
}

/**
 * Fonction principale de validation
 */
async function validateSetup() {
	console.log("🔍 Validation de la configuration Pa11y...\n");

	let allValid = true;

	// Vérification des fichiers essentiels
	console.log("📁 Fichiers de configuration:");
	allValid &= checkFile(
		path.join(PA11Y_DIR, "pa11y-auth.js"),
		"Script d'authentification"
	);
	allValid &= checkFile(
		path.join(PA11Y_DIR, "run-pa11y-tests.js"),
		"Script de test personnalisé"
	);
	allValid &= checkFile(
		path.join(PA11Y_DIR, "update-port.js"),
		"Script de mise à jour des ports"
	);
	allValid &= checkFile(path.join(PA11Y_DIR, "README.md"), "Documentation");

	// Vérification des dossiers
	console.log("\n📁 Structure des dossiers:");
	allValid &= checkFile(
		path.join(PA11Y_DIR, "screenshots"),
		"Dossier screenshots"
	);
	allValid &= checkFile(
		path.join(PA11Y_DIR, "screenshots", "debug"),
		"Dossier debug"
	);
	allValid &= checkFile(
		path.join(PA11Y_DIR, "screenshots", "errors"),
		"Dossier errors"
	);
	allValid &= checkFile(
		path.join(PA11Y_DIR, "screenshots", "success"),
		"Dossier success"
	);

	// Vérification des dépendances
	console.log("\n📦 Dépendances npm:");
	allValid &= await checkPackage("pa11y");
	allValid &= await checkPackage("puppeteer");
	allValid &= await checkPackage("vercel");

	// Validation de la configuration
	console.log("\n⚙️  Configuration:");
	allValid &= validateConfig();

	// Vérification du package.json
	console.log("\n📦 Scripts package.json:");
	const packageJsonPath = path.join(ROOT_DIR, "package.json");
	if (fs.existsSync(packageJsonPath)) {
		const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
		const scripts = packageJson.scripts || {};

		const requiredScripts = [
			"test:a11y",
			"test:a11y-custom",
			"test:a11y-update-port",
		];

		requiredScripts.forEach((script) => {
			if (scripts[script]) {
				console.log(`✅ Script "${script}" configuré`);
			} else {
				console.log(`❌ Script "${script}" manquant`);
				allValid = false;
			}
		});
	}

	// Résultat final
	console.log("\n" + "=".repeat(50));
	if (allValid) {
		console.log("🎉 Configuration Pa11y valide et prête à utiliser !");
		console.log("\n💡 Pour démarrer:");
		console.log("   1. vercel dev");
		console.log("   2. pnpm run test:a11y-update-port");
		console.log("   3. pnpm run test:a11y");
	} else {
		console.log("⚠️  Des problèmes ont été détectés dans la configuration.");
		console.log(
			"\n💡 Consultez le README.md pour les instructions d'installation."
		);
	}

	return allValid;
}

// Exécution du script
validateSetup().catch((error) => {
	console.error("❌ Erreur durant la validation:", error.message);
	process.exit(1);
});
