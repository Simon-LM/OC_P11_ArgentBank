#!/usr/bin/env node
/**
 * Debug script to capture and analyze the actual page content
 * that Lighthouse is testing, to verify we're not getting
 * redirected to a login page or Vercel auth page.
 *
 * @format
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const URLS_TO_DEBUG = [
  "https://argentbank-simonlm.vercel.app/",
  "https://argentbank-simonlm.vercel.app/signin",
  "https://argentbank-simonlm.vercel.app/user",
];

const DEVICES = [
  {
    name: "desktop",
    viewport: { width: 1366, height: 768 },
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  },
  {
    name: "mobile",
    viewport: { width: 375, height: 667 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
  },
];

async function capturePageContent(url, device) {
  console.log(`\n🔍 ===== DEBUGGING ${url} (${device.name}) =====`);

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

    // Set device-specific viewport and user agent
    await page.setViewport(device.viewport);
    await page.setUserAgent(device.userAgent);

    console.log(
      `📱 Viewport: ${device.viewport.width}x${device.viewport.height}`,
    );
    console.log(`👤 User Agent: ${device.userAgent.substring(0, 80)}...`);

    // Navigate to page
    console.log(`🌐 Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Basic page info
    const currentUrl = page.url();
    const pageTitle = await page.title();
    const pageContent = await page.content();

    console.log(`📍 Final URL: ${currentUrl}`);
    console.log(`📝 Page Title: "${pageTitle}"`);
    console.log(`📏 Content Length: ${pageContent.length} characters`);

    // Check for redirects
    if (currentUrl !== url) {
      console.log(`⚠️ REDIRECT DETECTED: ${url} → ${currentUrl}`);
    }

    // Check for signs of wrong pages
    const warnings = [];
    if (
      pageTitle.toLowerCase().includes("sign") ||
      pageTitle.toLowerCase().includes("login")
    ) {
      warnings.push("Page title suggests login/signin page");
    }
    if (pageContent.toLowerCase().includes("vercel")) {
      warnings.push(
        "Page content contains 'vercel' - possible Vercel auth page",
      );
    }
    if (pageContent.includes("This page could not be found")) {
      warnings.push("404 error page detected");
    }
    if (
      pageContent.includes("500") ||
      pageContent.includes("Internal Server Error")
    ) {
      warnings.push("500 error page detected");
    }

    if (warnings.length > 0) {
      console.log(`⚠️ WARNINGS:`);
      warnings.forEach((warning) => console.log(`   - ${warning}`));
    }

    // Extract key page elements
    const pageAnalysis = await page.evaluate(() => {
      const result = {
        h1Text: "NO H1 FOUND",
        navLinks: [],
        bodyClasses: document.body.className,
        hasMainElement: !!document.querySelector("main"),
        hasReactRoot: !!document.querySelector("#root"),
        scriptsCount: document.querySelectorAll("script").length,
        stylesheetsCount: document.querySelectorAll('link[rel="stylesheet"]')
          .length,
        imagesCount: document.querySelectorAll("img").length,
        formsCount: document.querySelectorAll("form").length,
      };

      // H1 text
      const h1 = document.querySelector("h1");
      if (h1) result.h1Text = h1.textContent.trim();

      // Navigation links
      const navLinks = document.querySelectorAll("nav a, header a");
      navLinks.forEach((link) => {
        if (link.href && link.textContent.trim()) {
          result.navLinks.push({
            text: link.textContent.trim(),
            href: link.href,
          });
        }
      });

      return result;
    });

    console.log(`📄 Page Analysis:`);
    console.log(`   - H1 Text: "${pageAnalysis.h1Text}"`);
    console.log(`   - Body Classes: "${pageAnalysis.bodyClasses}"`);
    console.log(`   - Has Main Element: ${pageAnalysis.hasMainElement}`);
    console.log(`   - Has React Root: ${pageAnalysis.hasReactRoot}`);
    console.log(`   - Scripts: ${pageAnalysis.scriptsCount}`);
    console.log(`   - Stylesheets: ${pageAnalysis.stylesheetsCount}`);
    console.log(`   - Images: ${pageAnalysis.imagesCount}`);
    console.log(`   - Forms: ${pageAnalysis.formsCount}`);

    if (pageAnalysis.navLinks.length > 0) {
      console.log(`   - Nav Links (${pageAnalysis.navLinks.length}):`);
      pageAnalysis.navLinks.slice(0, 5).forEach((link) => {
        console.log(`     → "${link.text}" → ${link.href}`);
      });
      if (pageAnalysis.navLinks.length > 5) {
        console.log(`     ... and ${pageAnalysis.navLinks.length - 5} more`);
      }
    }

    // Save page content for manual inspection
    const debugDir = path.join(process.cwd(), "lighthouse", "debug");
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    const urlSafe = url.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${urlSafe}_${device.name}.html`;
    const filepath = path.join(debugDir, filename);

    fs.writeFileSync(filepath, pageContent);
    console.log(`💾 Page content saved to: ${filepath}`);

    // Take screenshot
    const screenshotPath = path.join(debugDir, `${urlSafe}_${device.name}.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    return {
      url,
      device: device.name,
      finalUrl: currentUrl,
      title: pageTitle,
      contentLength: pageContent.length,
      warnings,
      analysis: pageAnalysis,
      files: {
        html: filepath,
        screenshot: screenshotPath,
      },
    };
  } catch (error) {
    console.error(`💥 Error debugging ${url} (${device.name}):`, error);
    return null;
  } finally {
    await browser.close();
  }
}

async function authenticateAndCapture(url, device) {
  console.log(`\n🔐 ===== DEBUGGING ${url} (${device.name}) WITH AUTH =====`);

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

    // Set device-specific viewport and user agent
    await page.setViewport(device.viewport);
    await page.setUserAgent(device.userAgent);

    // Navigate to signin first
    console.log(`🔐 Step 1: Navigate to signin`);
    await page.goto("https://argentbank-simonlm.vercel.app/signin", {
      waitUntil: "networkidle2",
    });

    // Fill and submit login form
    console.log(`🔐 Step 2: Fill login form`);
    await page.waitForSelector('input[type="email"], input[name="username"]', {
      timeout: 10000,
    });

    const emailInput =
      (await page.$('input[type="email"]')) ||
      (await page.$('input[name="username"]'));
    const passwordInput = await page.$('input[type="password"]');

    if (emailInput && passwordInput) {
      await emailInput.type("tony@stark.com");
      await passwordInput.type("password123");

      const submitButton =
        (await page.$('button[type="submit"]')) ||
        (await page.$(".sign-in-button"));
      if (submitButton) {
        console.log(`🔐 Step 3: Submit login`);
        await submitButton.click();
        await page.waitForNavigation({ waitUntil: "networkidle2" });
      }
    }

    // Now navigate to the target URL
    console.log(`🔐 Step 4: Navigate to target URL: ${url}`);
    await page.goto(url, { waitUntil: "networkidle2" });

    // Same analysis as before
    const currentUrl = page.url();
    const pageTitle = await page.title();
    const pageContent = await page.content();

    console.log(`📍 Final URL: ${currentUrl}`);
    console.log(`📝 Page Title: "${pageTitle}"`);
    console.log(`📏 Content Length: ${pageContent.length} characters`);

    // Save authenticated page content
    const debugDir = path.join(process.cwd(), "lighthouse", "debug");
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    const urlSafe = url.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${urlSafe}_${device.name}_AUTHENTICATED.html`;
    const filepath = path.join(debugDir, filename);

    fs.writeFileSync(filepath, pageContent);
    console.log(`💾 Authenticated page content saved to: ${filepath}`);

    // Take screenshot
    const screenshotPath = path.join(
      debugDir,
      `${urlSafe}_${device.name}_AUTHENTICATED.png`,
    );
    await page.screenshot({
      path: screenshotPath,
      fullPage: true,
    });
    console.log(`📸 Authenticated screenshot saved to: ${screenshotPath}`);

    return {
      url,
      device: device.name,
      finalUrl: currentUrl,
      title: pageTitle,
      contentLength: pageContent.length,
      authenticated: true,
    };
  } catch (error) {
    console.error(
      `💥 Error debugging authenticated ${url} (${device.name}):`,
      error,
    );
    return null;
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log("🚀 Starting page content debugging...");

  const results = [];

  // Test all URLs without authentication
  for (const url of URLS_TO_DEBUG) {
    for (const device of DEVICES) {
      const result = await capturePageContent(url, device);
      if (result) results.push(result);
    }
  }

  // Test /user with authentication
  for (const device of DEVICES) {
    const result = await authenticateAndCapture(
      "https://argentbank-simonlm.vercel.app/user",
      device,
    );
    if (result) results.push(result);
  }

  // Generate summary report
  console.log("\n📋 ===== SUMMARY REPORT =====");

  const groupedResults = {};
  results.forEach((result) => {
    if (!result) return;

    const key = result.url;
    if (!groupedResults[key]) groupedResults[key] = [];
    groupedResults[key].push(result);
  });

  Object.entries(groupedResults).forEach(([url, urlResults]) => {
    console.log(`\n📄 ${url}:`);
    urlResults.forEach((result) => {
      const authStatus = result.authenticated ? "[AUTH]" : "[NO_AUTH]";
      console.log(
        `   ${result.device} ${authStatus}: "${result.title}" (${result.contentLength} chars)`,
      );
      if (result.finalUrl !== result.url) {
        console.log(`     ⚠️ Redirected to: ${result.finalUrl}`);
      }
      if (result.warnings && result.warnings.length > 0) {
        result.warnings.forEach((warning) => {
          console.log(`     ⚠️ ${warning}`);
        });
      }
    });
  });

  console.log("\n✅ Debug complete! Check lighthouse/debug/ for saved files.");
}

main().catch(console.error);
