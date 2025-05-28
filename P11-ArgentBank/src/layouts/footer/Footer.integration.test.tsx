/** @format */

/**
 * Tests d'intégration pour Footer
 *
 * Scope d'intégration :
 * - Interactions utilisateur (toggle privacy)
 * - Tests d'accessibilité avec axe-core
 * - Validation de la conformité WCAG
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import Footer from "./Footer";
import { describe, test, expect } from "vitest";
import "../../../Axe/utils/axe-setup.js";

describe("Footer - Integration Tests", () => {
	test("should toggle privacy information when button is clicked", () => {
		render(<Footer />);
		const privacyButton = screen.getByRole("button", {
			name: /Show Privacy Information/,
		});

		fireEvent.click(privacyButton);
		expect(privacyButton).toHaveTextContent(/Hide Privacy Information/);
		expect(privacyButton).toHaveAttribute("aria-expanded", "true");

		const privacyContent = screen.getByRole("region", { hidden: false });
		expect(privacyContent).not.toHaveAttribute("hidden");
		expect(privacyContent).toHaveClass("open");

		fireEvent.click(privacyButton);
		expect(privacyButton).toHaveTextContent(/Show Privacy Information/);
		expect(privacyButton).toHaveAttribute("aria-expanded", "false");
		expect(privacyContent).toHaveAttribute("hidden");
		expect(privacyContent).not.toHaveClass("open");
	});

	test("should display privacy information content when expanded", () => {
		render(<Footer />);
		const privacyButton = screen.getByRole("button", {
			name: /Show Privacy Information/,
		});
		fireEvent.click(privacyButton);

		expect(
			screen.getByText(/This site uses Matomo for traffic analysis/)
		).toBeInTheDocument();
		expect(screen.getByText(/No cookies are used/)).toBeInTheDocument();
		expect(screen.getByText(/IP addresses are anonymized/)).toBeInTheDocument();
		expect(
			screen.getByText(/No data is shared with third parties/)
		).toBeInTheDocument();
		expect(
			screen.getByText(/Analytics data is retained for 13 months/)
		).toBeInTheDocument();

		const optOutLink = screen.getByText(/Click here to opt out of tracking/);
		expect(optOutLink).toBeInTheDocument();
		expect(optOutLink.closest("a")).toHaveAttribute(
			"href",
			expect.stringContaining("optOut")
		);
	});

	// Tests d'accessibilité
	test("has no accessibility violations", async () => {
		const { container } = render(<Footer />);
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	test("privacy information has proper accessibility when expanded", async () => {
		const { container } = render(<Footer />);
		const privacyButton = screen.getByRole("button", {
			name: /Show Privacy Information/,
		});

		fireEvent.click(privacyButton);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
