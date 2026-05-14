#!/usr/bin/env node
/**
 * Script utilitaire pour mettre à jour automatiquement le port dans les scripts Pa11y
 * Usage: node Pa11y/update-port.js [PORT]
 * Si aucun port n'est fourni, détecte automatiquement le port utilisé par le processus en cours
 *
 * @format
 */

import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_SCRIPT_FILE = path.join(__dirname, "run-pa11y-tests.js");
const AUTH_FILE = path.join(__dirname, "pa11y-auth.js");

/**
 * Détecte le port utilisé par le serveur local
 */
function detectPort() {
  return new Promise((resolve) => {
    // Recherche les processus qui écoutent sur les ports 3000-3010
    exec(
      "netstat -tlnp 2>/dev/null | grep ':300[0-9]' | head -1 | awk '{print $4}' | cut -d':' -f2",
      (error, stdout) => {
        if (error || !stdout.trim()) {
          console.log("⚠️  Aucun serveur détecté sur les ports 3000-3010");
          console.log('💡 Assurez-vous que "vercel dev" est démarré');
          resolve(3000); // Port par défaut
        } else {
          const port = parseInt(stdout.trim());
          console.log(`✅ Serveur détecté sur le port ${port}`);
          resolve(port);
        }
      },
    );
  });
}

/**
 * Met à jour le script de test principal avec le nouveau port
 */
function updateTestScript(port) {
  try {
    let testContent = fs.readFileSync(TEST_SCRIPT_FILE, "utf8");
    const oldContent = testContent;

    // Remplacer les références au port dans les URLs du script de test
    testContent = testContent.replace(/localhost:\d+/g, `localhost:${port}`);

    if (testContent !== oldContent) {
      fs.writeFileSync(TEST_SCRIPT_FILE, testContent);
      console.log(
        `✅ Script de test principal mis à jour pour le port ${port}`,
      );
    } else {
      console.log(`ℹ️  Script de test déjà configuré pour le port ${port}`);
    }

    // Extraire et afficher les URLs configurées
    const urlMatches = testContent.match(/https?:\/\/localhost:\d+[^\s\'"]+/g);
    if (urlMatches) {
      console.log("\n📋 URLs configurées dans le script de test :");
      [...new Set(urlMatches)].forEach((url) => {
        console.log(`   - ${url}`);
      });
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de la mise à jour du script de test:",
      error.message,
    );
    process.exit(1);
  }
}

/**
 * Met à jour le script d'authentification si nécessaire
 */
function updateAuthScript(port) {
  try {
    let authContent = fs.readFileSync(AUTH_FILE, "utf8");
    const oldContent = authContent;

    // Remplacer les références au port dans le script
    authContent = authContent.replace(/localhost:\d+/g, `localhost:${port}`);

    if (authContent !== oldContent) {
      fs.writeFileSync(AUTH_FILE, authContent);
      console.log(
        `✅ Script d'authentification mis à jour pour le port ${port}`,
      );
    }
  } catch (error) {
    console.error(
      "⚠️  Erreur lors de la mise à jour du script d'authentification:",
      error.message,
    );
  }
}

/**
 * Fonction principale
 */
async function main() {
  const args = process.argv.slice(2);
  let port;

  if (args.length > 0) {
    port = parseInt(args[0]);
    if (isNaN(port) || port < 1000 || port > 65535) {
      console.error("❌ Port invalide. Utilisez un port entre 1000 et 65535");
      process.exit(1);
    }
    console.log(`🔧 Utilisation du port spécifié: ${port}`);
  } else {
    console.log("🔍 Détection automatique du port...");
    port = await detectPort();
  }

  console.log(`\n🚀 Mise à jour des scripts Pa11y pour le port ${port}`);

  updateTestScript(port);
  updateAuthScript(port);

  console.log("\n✨ Scripts mis à jour avec succès !");
  console.log("\n💡 Pour tester la configuration :");
  console.log("   pnpm run test:a11y");
  console.log("   ou");
  console.log("   node Pa11y/run-pa11y-tests.js");
}

main().catch((error) => {
  console.error("❌ Erreur:", error.message);
  process.exit(1);
});
