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
		expect(screen.getByLabelText(mockProps.iconLabel)).toBeInTheDocument();
	});

	test("applique les classes CSS correctement", () => {
		render(<Feature {...mockProps} />);

		const icon = screen.getByLabelText(mockProps.iconLabel);
		expect(icon).toHaveClass("feature-icon", mockProps.iconClass);
	});

	test("respecte les critères d'accessibilité", () => {
		render(<Feature {...mockProps} />);

		const icon = screen.getByLabelText(mockProps.iconLabel);
		expect(icon).toHaveAttribute("aria-label", mockProps.iconLabel);
	});

	test("rend la structure HTML attendue", () => {
		const { container } = render(<Feature {...mockProps} />);

		expect(container.querySelector(".feature-item")).toBeInTheDocument();
		expect(container.querySelector(".feature-item__icon")).toBeInTheDocument(); // Corrigé: underscore double
		expect(container.querySelector(".feature-item__title")).toBeInTheDocument(); // Corrigé: underscore double
	});
});
