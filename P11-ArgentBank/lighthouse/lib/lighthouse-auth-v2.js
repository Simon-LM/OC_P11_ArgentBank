#!/usr/bin/env node
/** @format */

import puppeteer from "puppeteer";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 🔐 Module d'authentification automatisée pour Lighthouse (Version 2)
 * Permet de se connecter automatiquement et récupérer les cookies de session
 */

// Identifiants de test
const TEST_CREDENTIALS = {
  email: "tony@stark.com",
  password: "password123",
};

/**
 * Attendre que React soit complètement hydraté
 */
async function waitForReactHydration(page, timeout = 30000) {
  console.log("⏳ Attente du chargement complet de React...");

  try {
    // Attendre que la navigation soit terminée
    try {
      await page.waitForFunction(() => document.readyState === "complete", {
        timeout: 5000,
      });
    } catch (e) {
      // Fallback si waitForLoadState n'est pas disponible
      console.log("Navigation terminée (fallback)");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Attendre plus longtemps pour React
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Vérifier différents sélecteurs dans l'ordre de priorité
    const selectors = [
      "#email",
      'input[type="email"]',
      'input[name="email"]',
      'form input[type="email"]',
      '.sign-in-content input[type="email"]',
      'button[type="submit"]',
    ];

    for (const selector of selectors) {
      try {
        console.log(`🔍 Vérification du sélecteur: ${selector}`);
        await page.waitForSelector(selector, { timeout: 5000, visible: true });
        console.log(`✅ Sélecteur trouvé: ${selector}`);
        return true;
      } catch (err) {
        console.log(`⚠️  Sélecteur non trouvé: ${selector}`);
        continue;
      }
    }

    throw new Error("Aucun formulaire de connexion trouvé");
  } catch (error) {
    // Debug: voir le contenu de la page
    console.log("🔍 Contenu de la page pour debug:");
    const content = await page.content();
    console.log(content.substring(0, 2000) + "...");
    throw error;
  }
}

/**
 * Se connecte automatiquement et récupère les cookies de session
 * @param {string} baseUrl - URL de base de l'application
 * @returns {Promise<Array>} - Tableau des cookies de session
 */
async function getAuthenticatedCookies(baseUrl = "http://localhost:3000") {
  console.log("🔑 Démarrage de l'authentification automatique...");

  let browser;
  try {
    // Lancer un navigateur headless avec config CI/CD synchronisée
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // ✅ CI important
        "--disable-gpu", // ✅ CI important
        "--disable-extensions", // ✅ CI important
        "--disable-web-security", // Garde pour dev local
      ],
    });

    const page = await browser.newPage();

    // Définir un user agent
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    console.log("🌐 Navigation vers la page de connexion...");
    await page.goto(`${baseUrl}/signin`, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    // Attendre que React soit complètement chargé
    await waitForReactHydration(page);

    console.log("📝 Remplissage du formulaire...");

    // Essayer différentes approches pour trouver et remplir les champs
    const fieldMethods = [
      async () => {
        await page.focus("#email");
        await page.keyboard.down("Control");
        await page.keyboard.press("KeyA");
        await page.keyboard.up("Control");
        await page.type("#email", TEST_CREDENTIALS.email);

        await page.focus("#password");
        await page.keyboard.down("Control");
        await page.keyboard.press("KeyA");
        await page.keyboard.up("Control");
        await page.type("#password", TEST_CREDENTIALS.password);
      },
      async () => {
        await page.evaluate(
          (email, password) => {
            const emailField =
              document.querySelector("#email") ||
              document.querySelector('input[type="email"]');
            const passwordField =
              document.querySelector("#password") ||
              document.querySelector('input[type="password"]');

            if (emailField) emailField.value = email;
            if (passwordField) passwordField.value = password;

            // Déclencher les événements React
            if (emailField) {
              emailField.dispatchEvent(new Event("input", { bubbles: true }));
              emailField.dispatchEvent(new Event("change", { bubbles: true }));
            }
            if (passwordField) {
              passwordField.dispatchEvent(
                new Event("input", { bubbles: true }),
              );
              passwordField.dispatchEvent(
                new Event("change", { bubbles: true }),
              );
            }
          },
          TEST_CREDENTIALS.email,
          TEST_CREDENTIALS.password,
        );
      },
    ];

    let filled = false;
    for (const method of fieldMethods) {
      try {
        await method();
        filled = true;
        console.log("✅ Champs remplis avec succès");
        break;
      } catch (error) {
        console.log("⚠️ Méthode de remplissage échouée, essai suivant...");
        continue;
      }
    }

    if (!filled) {
      throw new Error("Impossible de remplir les champs du formulaire");
    }

    console.log("🚀 Soumission du formulaire...");

    // Essayer différentes méthodes de soumission
    const submitMethods = [
      async () => {
        const submitButton = await page.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          return true;
        }
        return false;
      },
      async () => {
        await page.keyboard.press("Enter");
        return true;
      },
      async () => {
        await page.evaluate(() => {
          const form = document.querySelector("form");
          if (form) form.submit();
        });
        return true;
      },
    ];

    let submitted = false;
    for (const method of submitMethods) {
      try {
        if (await method()) {
          submitted = true;
          console.log("✅ Formulaire soumis");
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!submitted) {
      throw new Error("Impossible de soumettre le formulaire");
    }

    // Attendre la redirection ou un changement d'URL
    console.log("⏳ Attente de la redirection...");

    try {
      await page.waitForFunction(() => window.location.pathname !== "/signin", {
        timeout: 15000,
      });
    } catch (error) {
      // Vérifier si on est déjà connecté d'une autre manière
      const currentUrl = page.url();
      if (!currentUrl.includes("/signin")) {
        console.log("✅ Redirection détectée via URL change");
      } else {
        throw new Error("Pas de redirection après soumission");
      }
    }

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
        cookie.domain.includes("localhost"),
    );

    console.log(
      `🍪 ${authCookies.length} cookies d'authentification récupérés`,
    );

    // Vérifier également le localStorage et sessionStorage pour les tokens
    const storageTokens = await page.evaluate(() => {
      const storage = {
        localStorage: {},
        sessionStorage: {},
      };

      // Récupérer les tokens du localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key.includes("token") ||
          key.includes("auth") ||
          key.includes("jwt") ||
          key.includes("user")
        ) {
          storage.localStorage[key] = localStorage.getItem(key);
        }
      }

      // Récupérer les tokens du sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key.includes("token") ||
          key.includes("auth") ||
          key.includes("jwt") ||
          key.includes("user")
        ) {
          storage.sessionStorage[key] = sessionStorage.getItem(key);
        }
      }

      return storage;
    });

    console.log("🔐 Tokens trouvés dans le stockage du navigateur:");
    console.log(JSON.stringify(storageTokens, null, 2));

    // Combiner les cookies et les tokens de stockage
    const authData = {
      cookies: authCookies,
      storage: storageTokens,
    };

    return authData;
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
  // URLs protégées dans l'application ArgentBank
  // Seule la page /user nécessite une authentification
  const protectedPaths = [
    "/user", // 🔐 Page utilisateur principale (seule route protégée)
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
 * Sauvegarde les cookies et tokens dans un fichier pour réutilisation
 * @param {Object} authData - Données d'authentification (cookies et storage)
 * @param {string} filePath - Chemin du fichier
 */
async function saveCookies(authData, filePath = null) {
  try {
    // Utiliser un chemin absolu par défaut
    const defaultPath =
      filePath || join(__dirname, "..", "auth", "auth-cookies.json");
    await fs.writeFile(defaultPath, JSON.stringify(authData, null, 2));
    console.log(
      `💾 Données d'authentification sauvegardées dans: ${defaultPath}`,
    );
  } catch (error) {
    console.error(
      "❌ Erreur lors de la sauvegarde des données d'authentification:",
      error.message,
    );
  }
}

/**
 * Charge les données d'authentification depuis un fichier
 * @param {string} filePath - Chemin du fichier
 * @returns {Promise<Object>} - Données d'authentification chargées
 */
async function loadCookies(filePath = null) {
  try {
    // Utiliser un chemin absolu par défaut
    const defaultPath =
      filePath || join(__dirname, "..", "auth", "auth-cookies.json");
    const data = await fs.readFile(defaultPath, "utf8");
    const authData = JSON.parse(data);
    console.log(
      `📂 Données d'authentification chargées depuis: ${defaultPath}`,
    );

    if (authData.cookies) {
      console.log(`   - ${authData.cookies.length} cookies chargés`);
    }

    if (authData.storage) {
      const lsCount = Object.keys(authData.storage.localStorage || {}).length;
      const ssCount = Object.keys(authData.storage.sessionStorage || {}).length;
      console.log(`   - ${lsCount} éléments du localStorage chargés`);
      console.log(`   - ${ssCount} éléments du sessionStorage chargés`);
    }

    return authData;
  } catch (error) {
    console.warn(
      `⚠️ Impossible de charger les données d'authentification: ${error.message}`,
    );
    return { cookies: [], storage: { localStorage: {}, sessionStorage: {} } };
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

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log("🔑 Test d'authentification standalone...");
  getAuthenticatedCookies()
    .then((cookies) => {
      console.log(`✅ Authentification réussie avec ${cookies.length} cookies`);
      return saveCookies(cookies);
    })
    .catch((error) => {
      console.error("❌ Échec du test d'authentification:", error.message);
      process.exit(1);
    });
}
