/** @format */

import React, { useEffect, useState } from "react";
// import "./styles/theme.scss";

const ThemeToggle: React.FC = () => {
	const [theme, setTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		// Vérifiez les préférences de l'utilisateur au chargement
		setTheme(mediaQuery.matches ? "dark" : "light");

		// Écoutez les changements de préférence
		const handleChange = (e: MediaQueryListEvent) => {
			setTheme(e.matches ? "dark" : "light");
		};

		mediaQuery.addEventListener("change", handleChange);

		// Nettoyage de l'écouteur d'événements
		return () => {
			mediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<div
			className={theme === "dark" ? "dark-theme" : "light-theme"}
			data-testid={theme === "dark" ? "dark-theme" : "light-theme"}>
			<h1>Bienvenue sur mon site !</h1>
			<p>Le thème actuel est {theme}.</p>
		</div>
	);
};

export default ThemeToggle;
