/** @format */

import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Feature from "./Feature";
describe("Feature Component", () => {
	const mockProps = {
		iconClass: "feature-icon-1",
		iconLabel: "Chat icon",
		title: "Test Title",
		description: "Test Description",
	};

	test("rend le composant avec les props correctes", () => {
		render(<Feature {...mockProps} />);

		expect(screen.getByText(mockProps.title)).toBeInTheDocument();
		expect(screen.getByText(mockProps.description)).toBeInTheDocument();
		expect(screen.getByText(mockProps.iconLabel)).toBeInTheDocument();
	});

	test("applique les classes CSS correctement", () => {
		render(<Feature {...mockProps} />);

		const icon = screen.getByText(mockProps.iconLabel).closest("i");
		expect(icon).toHaveClass("feature-icon", mockProps.iconClass);
	});

	test("respecte les critères d'accessibilité", () => {
		render(<Feature {...mockProps} />);

		const icon = screen.getByText(mockProps.iconLabel).closest("i");
		expect(icon).toHaveAttribute("aria-hidden", "true");

		// Vérifie que le texte d'icône est visible dans le DOM
		expect(screen.getByText(mockProps.iconLabel)).toBeInTheDocument();
	});

	test("rend la structure HTML attendue", () => {
		const { container } = render(<Feature {...mockProps} />);

		expect(container.querySelector(".feature-item")).toBeInTheDocument();
		expect(container.querySelector(".feature-item__icon")).toBeInTheDocument();
		expect(container.querySelector(".feature-item__title")).toBeInTheDocument();
	});
});
