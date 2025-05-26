/** @format */

module.exports = {
	defaults: {
		screenCapture: "pa11y-report.png",
		timeout: 30000,
		chromeLaunchConfig: {
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		},
	},
	urls: [
		"http://localhost:3000/",
		{
			url: "http://localhost:3000/user",
			actions: "script Pa11y/pa11y-auth.js",
		},
	],
};
