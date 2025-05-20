/** @format */

// import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Footer from "./Footer";
import { describe, test, expect } from "vitest";

describe("Footer Component", () => {
	test("should render the footer component correctly with the correct class and text", () => {
		render(<Footer />);
		const footerElement = screen.getByTestId("footer");
		expect(footerElement).toBeInTheDocument();
		expect(footerElement).toHaveClass("footer");
		expect(screen.getByText(/ArgentBank - Demo Project/)).toBeInTheDocument();
		expect(screen.getByText(/Simon LM/)).toBeInTheDocument();
	});

	test("should have the privacy button with correct initial state", () => {
		render(<Footer />);
		const privacyButton = screen.getByRole("button", {
			name: /Show Privacy Information/,
		});
		expect(privacyButton).toBeInTheDocument();
		expect(privacyButton).toHaveAttribute("aria-expanded", "false");

		const privacyContent = screen.getByRole("region", { hidden: true });
		expect(privacyContent).toHaveAttribute("hidden");
		expect(privacyContent).not.toHaveClass("open");
	});

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
});
