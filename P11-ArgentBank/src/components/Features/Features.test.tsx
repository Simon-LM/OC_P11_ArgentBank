/** @format */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Features from "./Features";

describe("Features Component", () => {
	test("rend le composant Features avec tous ses éléments", () => {
		render(<Features />);

		// Vérifie la présence du titre sr-only
		expect(screen.getByText("Features")).toHaveClass("sr-only");

		// Vérifie la présence des 3 features
		expect(screen.getByText("You are our #1 priority")).toBeInTheDocument();
		expect(
			screen.getByText("More savings means higher rates")
		).toBeInTheDocument();
		expect(screen.getByText("Security you can trust")).toBeInTheDocument();
	});

	test("affiche les icônes avec les bons labels", () => {
		render(<Features />);

		expect(screen.getByLabelText("Chat icon")).toBeInTheDocument();
		expect(screen.getByLabelText("Money icon")).toBeInTheDocument();
		expect(screen.getByLabelText("Security icon")).toBeInTheDocument();
	});

	test("rend la structure correcte du composant", () => {
		const { container } = render(<Features />);

		expect(container.querySelector("section.features")).toBeInTheDocument();
		expect(container.getElementsByClassName("feature-item")).toHaveLength(3);
	});

	test("affiche les descriptions des features", () => {
		render(<Features />);

		expect(
			screen.getByText(/Need to talk to a representative/)
		).toBeInTheDocument();
		expect(screen.getByText(/The more you save with us/)).toBeInTheDocument();
		expect(
			screen.getByText(/We use top of the line encryption/)
		).toBeInTheDocument();
	});
});
