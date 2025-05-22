/** @format */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import { vi, describe, test, expect } from "vitest";

// Mock Intersection Observer for lazy loading
vi.mock("react-intersection-observer", () => ({
	useInView: () => ({ ref: () => {}, inView: true }),
}));

// Mock Features to avoid actual lazy loading in this test
vi.mock("../../components/Features/Features", () => ({
	__esModule: true,
	default: () => <div data-testid="features-component">Features Content</div>,
}));

describe("Home Component", () => {
	test("renders hero section with correct content and image description", () => {
		render(<Home />);
		expect(
			screen.getByText(
				/A young tree sprout growing in a glass jar filled with coins/
			)
		).toBeInTheDocument();
		expect(screen.getByText("No fees.")).toBeInTheDocument();
		expect(screen.getByText("No minimum deposit.")).toBeInTheDocument();
		expect(screen.getByText("High interest rates.")).toBeInTheDocument();
		expect(
			screen.getByText("Open a savings account with Argent Bank today!")
		).toBeInTheDocument();
	});

	test("renders Features when in view (lazy loaded)", async () => {
		render(<Home />);
		await waitFor(() => {
			expect(screen.getByTestId("features-component")).toBeInTheDocument();
		});
	});

	test("hero image uses modern image formats and correct fallback", () => {
		render(<Home />);
		const sources = document.querySelectorAll("source");
		expect(sources[0]).toHaveAttribute("type", "image/avif");
		expect(sources[1]).toHaveAttribute("type", "image/webp");
		const img = document.querySelector(".hero__image");
		expect(img).toHaveAttribute("src", "/img/bank-tree.jpg");
	});

	test("shows description if hero image fails to load", () => {
		render(<Home />);
		const img = document.querySelector(".hero__image");
		expect(img).not.toBeNull();
		if (img) {
			fireEvent.error(img);
		}
		const description = screen.getByText(
			/A young tree sprout growing in a glass jar filled with coins/
		);
		expect(description).toHaveStyle("opacity: 1");
		expect(description).toHaveStyle("z-index: 1");
	});
});
