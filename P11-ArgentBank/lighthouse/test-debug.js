#!/usr/bin/env node
/** @format */

console.log("🔍 Test Debug Script");
console.log("==================");
console.log("import.meta.url:", import.meta.url);
console.log("process.argv[1]:", process.argv[1]);
console.log(
	"Condition:",
	import.meta.url.startsWith("file:") &&
		process.argv[1] &&
		import.meta.url.includes(process.argv[1])
);

// Importer et tester le script global
try {
	const globalScript = await import("./scripts/lighthouse-global-report.js");
	console.log("✅ Import réussi");

	if (globalScript.default) {
		console.log("🚀 Exécution du rapport global...");
		await globalScript.default();
	} else {
		console.log("❌ Fonction default non trouvée");
	}
} catch (error) {
	console.error("❌ Erreur:", error.message);
}
