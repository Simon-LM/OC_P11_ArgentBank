#!/usr/bin/env node
/** @format */

import lighthouse from "lighthouse";
import puppeteer from "puppeteer";

/**
 * 🔐 Mode d'authentification intégrée pour Lighthouse (comme CI/CD)
 * Cette approche reproduit exactement ce qui fonctionne en CI/CD
 */

// Identifiants de test
const TEST_CREDENTIALS = {
  email: "tony@stark.com",
  password: "password123",
};

/**
 * Script d'authentification intégré (reproduit le CI/CD)
 */
async function integratedAuthScript(page, options) {
  console.log("<<<<< INTEGRATED AUTH SCRIPT (LOCAL) STARTED >>>>>");

  try {
    const signInUrl = options.page.replace("/user", "/signin");
    console.log(`<<<<< AUTH SCRIPT: Navigating to ${signInUrl} >>>>>`);

    // Navigate to sign-in page
    await page.goto(signInUrl, { waitUntil: "networkidle0", timeout: 30000 });
    console.log("<<<<< AUTH SCRIPT: Navigation to /signin complete >>>>>");

    // Wait for form to be visible
    console.log("<<<<< AUTH SCRIPT: Waiting for form to be visible >>>>>");
    await page.waitForSelector("form", { visible: true, timeout: 10000 });
    console.log("<<<<< AUTH SCRIPT: Form is visible >>>>>");

    // Wait for email field and type credentials
    console.log(
      "<<<<< AUTH SCRIPT: Waiting for email field to be visible >>>>>",
    );
    await page.waitForSelector("#email", { visible: true, timeout: 10000 });
    console.log("<<<<< AUTH SCRIPT: Email field is visible >>>>>");

    console.log("<<<<< AUTH SCRIPT: Typing credentials >>>>>");
    await page.type("#email", TEST_CREDENTIALS.email);
    await page.type("#password", TEST_CREDENTIALS.password);
    console.log("<<<<< AUTH SCRIPT: Credentials typed >>>>>");

    // Wait for submit button and click
    console.log("<<<<< AUTH SCRIPT: Waiting for submit button >>>>>");
    await page.waitForSelector('button[type="submit"]', {
      visible: true,
      timeout: 10000,
    });
    console.log("<<<<< AUTH SCRIPT: Submit button found >>>>>");

    // Click submit and wait for navigation
    console.log(
      "<<<<< AUTH SCRIPT: Clicking submit button and waiting for navigation >>>>>",
    );
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle0", timeout: 15000 }),
      page.click('button[type="submit"]'),
    ]);

    const currentUrl = page.url();
    console.log(
      `<<<<< AUTH SCRIPT: Form submitted. Current URL: ${currentUrl} >>>>>`,
    );

    // Wait for user page content to confirm successful login
    console.log(
      "<<<<< AUTH SCRIPT: Waiting for user page content to confirm successful login... >>>>>",
    );
    await page.waitForSelector('h2[class*="user__title"]', {
      visible: true,
      timeout: 10000,
    });
    console.log(
      "<<<<< AUTH SCRIPT: User page content found. Authentication successful. >>>>>",
    );

    // Small delay for page to settle
    console.log(
      "<<<<< AUTH SCRIPT: Adding small delay for page to settle... >>>>>",
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(
      "<<<<< AUTH SCRIPT: Authentication script finished successfully. >>>>>",
    );
  } catch (error) {
    console.error(
      "<<<<< AUTH SCRIPT: Error during authentication >>>>>",
      error.message,
    );
    throw error;
  }
}

/**
 * Configuration Lighthouse alignée avec CI/CD
 */
function getDeviceConfig(device) {
  if (device === "mobile") {
    return {
      extends: "lighthouse:default",
      settings: {
        formFactor: "mobile",
        throttling: {
          rttMs: 70, // Synchronisé avec CI/CD
          throughputKbps: 3000, // Synchronisé avec CI/CD
          cpuSlowdownMultiplier: 2, // Synchronisé avec CI/CD
        },
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 2.625,
          disabled: false,
        },
        emulatedUserAgent:
          "Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36",
      },
    };
  } else {
    return {
      extends: "lighthouse:default",
      settings: {
        formFactor: "desktop",
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
      },
    };
  }
}

/**
 * Test Lighthouse avec authentification intégrée (approche CI/CD)
 */
export async function runLighthouseWithIntegratedAuth(url, device = "desktop") {
  console.log(
    `🔐 Testing ${url} (${device}) WITH INTEGRATED authentication...`,
  );

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
    ],
  });

  try {
    const page = await browser.newPage();

    // Execute authentication (SAME as CI/CD)
    console.log("🔐 ▶️ Executing integrated authentication script...");
    await integratedAuthScript(page, { page: url });
    console.log("✅ ✅ Integrated authentication successful!");

    // VERIFICATION: Check current page state before Lighthouse
    const currentUrl = page.url();
    const pageTitle = await page.title();
    const pageContent = await page.content();

    console.log("🔍 ===== PAGE VERIFICATION BEFORE LIGHTHOUSE =====");
    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📝 Page Title: ${pageTitle}`);
    console.log(`📏 Page Content Length: ${pageContent.length} characters`);

    // Check if we're on the right page
    if (currentUrl.includes("/signin") || currentUrl.includes("/sign-in")) {
      console.log("⚠️ WARNING: Still on signin page!");
    }
    if (
      pageTitle.toLowerCase().includes("sign") ||
      pageTitle.toLowerCase().includes("login")
    ) {
      console.log("⚠️ WARNING: Page title suggests login/signin page!");
    }
    if (pageContent.includes("vercel")) {
      console.log(
        "⚠️ WARNING: Page content contains 'vercel' - possible Vercel auth page!",
      );
    }

    // Extract key page elements for verification
    const bodyClassList = await page.evaluate(() => {
      return document.body.className;
    });
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.textContent : "NO H1 FOUND";
    });
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? main.innerHTML.substring(0, 200) : "NO MAIN FOUND";
    });

    console.log(`🏷️ Body Classes: ${bodyClassList}`);
    console.log(`📰 H1 Text: ${h1Text}`);
    console.log(`📄 Main Content Preview: ${mainContent}...`);
    console.log("🔍 ================================================");

    // Run Lighthouse on authenticated page
    console.log("🚨 ▶️ Running Lighthouse on AUTHENTICATED page...");
    const config = getDeviceConfig(device);

    const result = await lighthouse(
      url,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: "json",
        logLevel: "info",
      },
      config,
    );

    if (result && result.lhr) {
      // Extract more detailed audit results
      const audits = result.lhr.audits;
      const performanceScore = Math.round(
        result.lhr.categories.performance.score * 100,
      );
      const accessibilityScore = Math.round(
        result.lhr.categories.accessibility.score * 100,
      );
      const bestPracticesScore = Math.round(
        result.lhr.categories["best-practices"].score * 100,
      );
      const seoScore = Math.round(result.lhr.categories.seo.score * 100);

      console.log("🔍 ===== DETAILED LIGHTHOUSE RESULTS =====");
      console.log(
        `📊 ${url} (${device}) [INTEGRATED AUTH]: Performance=${performanceScore}%, Accessibility=${accessibilityScore}%, Best-Practices=${bestPracticesScore}%, SEO=${seoScore}%`,
      );

      // Analyze what's causing low scores
      if (performanceScore < 90) {
        console.log("⚠️ LOW PERFORMANCE DETECTED - Key issues:");
        if (audits["first-contentful-paint"]) {
          console.log(
            `   - First Contentful Paint: ${audits["first-contentful-paint"].displayValue}`,
          );
        }
        if (audits["largest-contentful-paint"]) {
          console.log(
            `   - Largest Contentful Paint: ${audits["largest-contentful-paint"].displayValue}`,
          );
        }
        if (audits["cumulative-layout-shift"]) {
          console.log(
            `   - Cumulative Layout Shift: ${audits["cumulative-layout-shift"].displayValue}`,
          );
        }
      }

      if (bestPracticesScore < 100) {
        console.log("⚠️ BEST PRACTICES ISSUES DETECTED:");
        if (audits["is-on-https"]) {
          console.log(
            `   - HTTPS: ${audits["is-on-https"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
        if (audits["uses-http2"]) {
          console.log(
            `   - HTTP/2: ${audits["uses-http2"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
        if (audits["no-vulnerable-libraries"]) {
          console.log(
            `   - Vulnerable Libraries: ${audits["no-vulnerable-libraries"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
      }

      // Check if we got the final URL that was actually tested
      const finalUrl = result.lhr.finalUrl || result.lhr.requestedUrl;
      console.log(`🎯 Final URL tested by Lighthouse: ${finalUrl}`);

      if (finalUrl !== url) {
        console.log(
          `⚠️ WARNING: Lighthouse tested different URL than requested!`,
        );
        console.log(`   Requested: ${url}`);
        console.log(`   Actually tested: ${finalUrl}`);
      }

      console.log("🔍 =========================================");
    }

    return result.lhr;
  } catch (error) {
    console.error(
      `💥 Lighthouse integrated authentication failed for ${url} (${device}):`,
      error,
    );
    return null;
  } finally {
    await browser.close();
  }
}

/**
 * Test simple sans authentification
 */
export async function runLighthouseWithoutAuth(url, device = "desktop") {
  console.log(`🌐 Testing ${url} (${device}) WITHOUT authentication...`);

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
    ],
  });

  try {
    // PRE-LIGHTHOUSE PAGE VERIFICATION
    console.log("🔍 ===== PRE-LIGHTHOUSE PAGE VERIFICATION =====");
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const currentUrl = page.url();
    const pageTitle = await page.title();
    const pageContent = await page.content();

    console.log(`📍 Current URL: ${currentUrl}`);
    console.log(`📝 Page Title: ${pageTitle}`);
    console.log(`📏 Page Content Length: ${pageContent.length} characters`);

    // Check for redirects or wrong pages
    if (currentUrl !== url) {
      console.log(`⚠️ WARNING: Page redirected from ${url} to ${currentUrl}`);
    }
    if (
      pageTitle.toLowerCase().includes("sign") ||
      pageTitle.toLowerCase().includes("login")
    ) {
      console.log("⚠️ WARNING: Page title suggests login/signin page!");
    }
    if (pageContent.includes("vercel")) {
      console.log(
        "⚠️ WARNING: Page content contains 'vercel' - possible Vercel auth page!",
      );
    }

    // Extract key page elements
    const h1Text = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      return h1 ? h1.textContent : "NO H1 FOUND";
    });
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector("main");
      return main ? main.innerHTML.substring(0, 200) : "NO MAIN FOUND";
    });

    console.log(`📰 H1 Text: ${h1Text}`);
    console.log(`📄 Main Content Preview: ${mainContent}...`);
    console.log("🔍 ================================================");

    await page.close();

    const config = getDeviceConfig(device);

    const result = await lighthouse(
      url,
      {
        port: new URL(browser.wsEndpoint()).port,
        output: "json",
        logLevel: "info",
      },
      config,
    );

    if (result && result.lhr) {
      // Extract detailed audit results
      const audits = result.lhr.audits;
      const performanceScore = Math.round(
        result.lhr.categories.performance.score * 100,
      );
      const accessibilityScore = Math.round(
        result.lhr.categories.accessibility.score * 100,
      );
      const bestPracticesScore = Math.round(
        result.lhr.categories["best-practices"].score * 100,
      );
      const seoScore = Math.round(result.lhr.categories.seo.score * 100);

      console.log("🔍 ===== DETAILED LIGHTHOUSE RESULTS =====");
      console.log(
        `📊 ${url} (${device}) [NO AUTH]: Performance=${performanceScore}%, Accessibility=${accessibilityScore}%, Best-Practices=${bestPracticesScore}%, SEO=${seoScore}%`,
      );

      // Analyze what's causing low scores
      if (performanceScore < 90) {
        console.log("⚠️ LOW PERFORMANCE DETECTED - Key issues:");
        if (audits["first-contentful-paint"]) {
          console.log(
            `   - First Contentful Paint: ${audits["first-contentful-paint"].displayValue}`,
          );
        }
        if (audits["largest-contentful-paint"]) {
          console.log(
            `   - Largest Contentful Paint: ${audits["largest-contentful-paint"].displayValue}`,
          );
        }
        if (audits["cumulative-layout-shift"]) {
          console.log(
            `   - Cumulative Layout Shift: ${audits["cumulative-layout-shift"].displayValue}`,
          );
        }
        if (audits["speed-index"]) {
          console.log(
            `   - Speed Index: ${audits["speed-index"].displayValue}`,
          );
        }
      }

      if (bestPracticesScore < 100) {
        console.log("⚠️ BEST PRACTICES ISSUES DETECTED:");
        if (audits["is-on-https"]) {
          console.log(
            `   - HTTPS: ${audits["is-on-https"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
        if (audits["uses-http2"]) {
          console.log(
            `   - HTTP/2: ${audits["uses-http2"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
        if (audits["no-vulnerable-libraries"]) {
          console.log(
            `   - Vulnerable Libraries: ${audits["no-vulnerable-libraries"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
        if (audits["uses-responsive-images"]) {
          console.log(
            `   - Responsive Images: ${audits["uses-responsive-images"].score === 1 ? "PASS" : "FAIL"}`,
          );
        }
      }

      // Check final URL
      const finalUrl = result.lhr.finalUrl || result.lhr.requestedUrl;
      console.log(`🎯 Final URL tested by Lighthouse: ${finalUrl}`);

      if (finalUrl !== url) {
        console.log(
          `⚠️ WARNING: Lighthouse tested different URL than requested!`,
        );
        console.log(`   Requested: ${url}`);
        console.log(`   Actually tested: ${finalUrl}`);
      }

      console.log("🔍 =========================================");

      return result.lhr;
    }

    return null;
  } catch (error) {
    console.error(`💥 Lighthouse test failed for ${url} (${device}):`, error);
    return null;
  } finally {
    await browser.close();
  }
}

export default { runLighthouseWithIntegratedAuth, runLighthouseWithoutAuth };
