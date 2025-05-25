#!/usr/bin/env node
/** @format */

import runLighthouse from "./lighthouse-runner.js";
import fs from "fs/promises";
import path from "path";

// Configuration des tests à effectuer
const testSuites = [
	{
		name: "Accueil - Mobile",
		url: "http://localhost:3000",
		mobile: true,
		outputPath: "./reports/home-mobile.html",
	},
	{
		name: "Accueil - Desktop",
		url: "http://localhost:3000",
		mobile: false,
		outputPath: "./reports/home-desktop.html",
	},
	{
		name: "Connexion - Mobile",
		url: "http://localhost:3000/sign-in",
		mobile: true,
		outputPath: "./reports/signin-mobile.html",
	},
	{
		name: "Connexion - Desktop",
		url: "http://localhost:3000/sign-in",
		mobile: false,
		outputPath: "./reports/signin-desktop.html",
	},
	{
		name: "Profil - Mobile",
		url: "http://localhost:3000/profile",
		mobile: true,
		outputPath: "./reports/profile-mobile.html",
	},
	{
		name: "Profil - Desktop",
		url: "http://localhost:3000/profile",
		mobile: false,
		outputPath: "./reports/profile-desktop.html",
	},
];

async function runTestSuite() {
	console.log("🧪 DÉMARRAGE DE LA SUITE DE TESTS LIGHTHOUSE");
	console.log("=============================================\n");

	// Créer le dossier reports s'il n'existe pas
	try {
		await fs.mkdir("./reports", { recursive: true });
	} catch (error) {
		// Le dossier existe déjà
	}

	const results = [];

	for (const test of testSuites) {
		console.log(`\n🔄 Test: ${test.name}`);
		console.log(`📱 Mode: ${test.mobile ? "Mobile" : "Desktop"}`);
		console.log(`🌐 URL: ${test.url}`);
		console.log("----------------------------------------");

		try {
			// Simuler les arguments de ligne de commande
			const originalArgv = process.argv;
			process.argv = [
				"node",
				"lighthouse-runner.js",
				"--url",
				test.url,
				"--output-path",
				test.outputPath,
				test.mobile ? "--mobile" : "--desktop",
			];

			const startTime = Date.now();
			await runLighthouse();
			const duration = Date.now() - startTime;

			results.push({
				...test,
				status: "success",
				duration: Math.round(duration / 1000),
			});

			// Restaurer les arguments
			process.argv = originalArgv;

			console.log(
				`✅ Test ${test.name} terminé en ${Math.round(duration / 1000)}s`
			);
		} catch (error) {
			console.error(`❌ Erreur lors du test ${test.name}:`, error.message);
			results.push({
				...test,
				status: "error",
				error: error.message,
			});
		}

		// Pause entre les tests pour éviter la surcharge
		if (testSuites.indexOf(test) < testSuites.length - 1) {
			console.log("⏳ Pause de 3 secondes...");
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	// Résumé final
	console.log("\n📊 RÉSUMÉ DE LA SUITE DE TESTS");
	console.log("===============================");

	const successful = results.filter((r) => r.status === "success");
	const failed = results.filter((r) => r.status === "error");

	console.log(`✅ Tests réussis: ${successful.length}/${results.length}`);
	console.log(`❌ Tests échoués: ${failed.length}/${results.length}`);

	if (successful.length > 0) {
		console.log("\n🟢 TESTS RÉUSSIS:");
		successful.forEach((test) => {
			console.log(`   • ${test.name} (${test.duration}s) → ${test.outputPath}`);
		});
	}

	if (failed.length > 0) {
		console.log("\n🔴 TESTS ÉCHOUÉS:");
		failed.forEach((test) => {
			console.log(`   • ${test.name}: ${test.error}`);
		});
	}

	console.log(
		`\n📁 Tous les rapports sont disponibles dans le dossier './reports/'`
	);

	// Créer un fichier index.html pour naviguer facilement entre les rapports
	await createReportsIndex(successful);
}

async function createReportsIndex(successfulTests) {
	const indexHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapports Lighthouse - ArgentBank</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            text-align: center;
        }
        .reports-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .report-card {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            transition: transform 0.2s ease;
        }
        .report-card:hover {
            transform: translateY(-2px);
        }
        .report-title {
            font-size: 1.2em;
            font-weight: 600;
            margin-bottom: 10px;
            color: #333;
        }
        .report-meta {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 15px;
        }
        .report-link {
            display: inline-block;
            background: #0066cc;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.2s ease;
        }
        .report-link:hover {
            background: #0052a3;
        }
        .mobile-badge {
            background: #ff6b35;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        .desktop-badge {
            background: #4a90e2;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Rapports Lighthouse - ArgentBank</h1>
        <p>Suite de tests de performance générée le ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}</p>
    </div>
    
    <div class="reports-grid">
        ${successfulTests
					.map(
						(test) => `
            <div class="report-card">
                <div class="report-title">
                    ${test.name}
                    <span class="${test.mobile ? "mobile" : "desktop"}-badge">
                        ${test.mobile ? "📱 Mobile" : "🖥️ Desktop"}
                    </span>
                </div>
                <div class="report-meta">
                    URL: ${test.url}<br>
                    Durée: ${test.duration}s<br>
                    Fichier: ${path.basename(test.outputPath)}
                </div>
                <a href="${path.basename(test.outputPath)}" class="report-link">
                    📄 Voir le rapport
                </a>
            </div>
        `
					)
					.join("")}
    </div>
    
    <div style="margin-top: 40px; text-align: center; color: #666;">
        <p>💡 <strong>Conseil:</strong> Pour des résultats optimaux, assurez-vous que votre serveur de développement fonctionne sur http://localhost:3000</p>
        <p>🔄 Pour relancer tous les tests: <code>pnpm lighthouse:suite</code></p>
    </div>
</body>
</html>
  `;

	await fs.writeFile("./reports/index.html", indexHtml.trim());
	console.log("📄 Index des rapports créé: ./reports/index.html");
}

// Exécuter la suite si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
	runTestSuite().catch((error) => {
		console.error("❌ Erreur lors de l'exécution de la suite:", error);
		process.exit(1);
	});
}

export default runTestSuite;
