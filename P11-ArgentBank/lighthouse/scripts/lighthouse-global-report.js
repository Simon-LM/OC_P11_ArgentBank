#!/usr/bin/env node
/** @format */

import runLighthouse from "./lighthouse-runner.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Configuration pour modules ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour générer un horodatage
function generateTimestamp() {
  const now = new Date();
  return now
    .toISOString()
    .replace(/T/, "_")
    .replace(/:/g, "-")
    .replace(/\..+/, "");
}

// Configuration des tests à effectuer
const testSuites = [
  {
    name: "Home",
    url: "http://localhost:3000",
    path: "/",
  },
  {
    name: "SignIn",
    url: "http://localhost:3000/sign-in",
    path: "/sign-in",
  },
  {
    name: "Profile",
    url: "http://localhost:3000/user",
    path: "/user",
    requiresAuth: true,
  },
];

const devices = [
  { name: "mobile", mobile: true },
  { name: "desktop", mobile: false },
];

async function runGlobalTestSuite() {
  console.log("🌍 GÉNÉRATION DU RAPPORT GLOBAL LIGHTHOUSE");
  console.log("===========================================\n");

  // Générer un horodatage pour cette session de tests
  const timestamp = generateTimestamp();
  console.log(`📅 Session de tests: ${timestamp}\n`);

  // Créer le dossier reports s'il n'existe pas
  const reportsDir = path.join(__dirname, "..", "reports");
  try {
    await fs.mkdir(reportsDir, { recursive: true });
  } catch (error) {
    // Le dossier existe déjà
  }

  const results = [];
  let totalTests = testSuites.length * devices.length;
  let currentTest = 0;

  for (const page of testSuites) {
    for (const device of devices) {
      currentTest++;
      const testName = `${page.name} - ${device.name}`;

      console.log(`\n🔄 Test ${currentTest}/${totalTests}: ${testName}`);
      console.log(`📱 Device: ${device.name}`);
      console.log(`🌐 URL: ${page.url}`);
      console.log("----------------------------------------");

      try {
        // Générer un nom de fichier JSON avec horodatage
        const filename = `${page.name.toLowerCase()}-${device.name}-${timestamp}.json`;
        const outputPath = path.join(reportsDir, filename);

        // Simuler les arguments de ligne de commande pour JSON
        const originalArgv = process.argv;
        process.argv = [
          "node",
          "lighthouse-runner.js",
          "--url",
          page.url,
          "--mobile",
          device.mobile.toString(),
          "--output",
          "json",
          "--output-path",
          outputPath,
        ];

        // Si la page nécessite une authentification, l'ajouter
        if (page.requiresAuth) {
          process.argv.push("--auth");
        }

        // Exécuter le test
        await runLighthouse();

        // Restaurer les arguments originaux
        process.argv = originalArgv;

        // Vérifier que le fichier a été créé
        try {
          await fs.access(outputPath);
          console.log(`✅ ${testName} - JSON généré: ${filename}`);

          results.push({
            name: testName,
            page: page.name,
            device: device.name,
            path: page.path,
            file: filename,
            success: true,
          });
        } catch (accessError) {
          throw new Error(`Fichier JSON non créé: ${filename}`);
        }
      } catch (error) {
        console.error(`❌ ${testName} - Erreur: ${error.message}`);
        results.push({
          name: testName,
          page: page.name,
          device: device.name,
          path: page.path,
          file: null,
          success: false,
          error: error.message,
        });
      }

      // Pause entre les tests pour éviter la surcharge
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Générer le résumé de la session
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n" + "=".repeat(50));
  console.log("📊 RÉSUMÉ DE LA SESSION DE TESTS");
  console.log("=".repeat(50));
  console.log(`🗓️  Date: ${new Date().toLocaleString("fr-FR")}`);
  console.log(`⏱️  Session: ${timestamp}`);
  console.log(`✅ Tests réussis: ${successful.length}/${results.length}`);
  console.log(`❌ Tests échoués: ${failed.length}/${results.length}`);

  if (successful.length > 0) {
    console.log("\n🎯 RAPPORTS JSON GÉNÉRÉS:");
    successful.forEach((result) => {
      console.log(`   📄 ${result.file} (${result.page} - ${result.device})`);
    });
  }

  if (failed.length > 0) {
    console.log("\n❌ TESTS ÉCHOUÉS:");
    failed.forEach((result) => {
      console.log(`   ⚠️  ${result.name}: ${result.error}`);
    });
  }

  // Si nous avons des rapports JSON, lancer l'analyse automatiquement
  if (successful.length > 0) {
    console.log("\n🔍 GÉNÉRATION DE L'ANALYSE GLOBALE...");

    try {
      // Changer vers le dossier lighthouse pour exécuter l'analyzer
      process.chdir(path.join(__dirname, ".."));

      // Importer et exécuter l'analyzer
      const analyzerModule = await import("../lib/lighthouse-analyzer.js");

      // L'analyzer analyse automatiquement tous les fichiers JSON dans reports/
      console.log("📊 Lancement de l'analyse des rapports JSON...");

      // Exécuter directement la fonction main de l'analyzer
      // Note: On doit simuler l'exécution directe du script
      const originalArgv = process.argv;
      process.argv = ["node", "lighthouse-analyzer.js"];

      // Importer et exécuter la fonction main
      await import("../lib/lighthouse-analyzer.js");

      process.argv = originalArgv;

      console.log("✅ Analyse globale terminée !");
      console.log(
        "📄 Consultez reports/analysis.html pour le rapport détaillé",
      );
      console.log("📝 Consultez reports/analysis.txt pour le résumé textuel");
    } catch (analyzerError) {
      console.error("❌ Erreur lors de l'analyse:", analyzerError.message);
      console.log(
        "💡 Vous pouvez lancer l'analyse manuellement avec: pnpm analyze",
      );
    }
  }

  console.log("\n🎉 RAPPORT GLOBAL TERMINÉ !");
  console.log("=".repeat(50));

  return {
    timestamp,
    total: results.length,
    successful: successful.length,
    failed: failed.length,
    results,
  };
}

// Exécuter si appelé directement
if (
  import.meta.url.startsWith("file:") &&
  process.argv[1] &&
  import.meta.url.includes(process.argv[1])
) {
  runGlobalTestSuite().catch(console.error);
}

export default runGlobalTestSuite;
