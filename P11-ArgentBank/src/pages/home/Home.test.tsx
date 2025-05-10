/** @format */

import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Home from "./Home";

describe("Home component", () => {
	test("should render the hero section with the correct content and image description", () => {
		render(<Home />);

		expect(
			screen.getByText(
				/A young tree sprout growing in a glass jar filled with coins/
			)
		).toBeInTheDocument();
		expect(screen.getByText("You are our #1 priority")).toBeInTheDocument();
		expect(
			screen.getByText("More savings means higher rates")
		).toBeInTheDocument();
		expect(screen.getByText("Security you can trust")).toBeInTheDocument();
		expect(screen.getByText("No fees.")).toBeInTheDocument();
		expect(screen.getByText("No minimum deposit.")).toBeInTheDocument();
		expect(screen.getByText("High interest rates.")).toBeInTheDocument();
		expect(
			screen.getByText("Open a savings account with Argent Bank today!")
		).toBeInTheDocument();
	});

	test("should render the hero section with correct aria-label", () => {
		render(<Home />);
		const hero = screen.getByTestId("hero");
		expect(hero).toBeInTheDocument();
		expect(hero.getAttribute("aria-label")).toBe(
			"Hero banner showing a tree sprout in a jar of coins, symbolizing growth and savings"
		);
	});
});
