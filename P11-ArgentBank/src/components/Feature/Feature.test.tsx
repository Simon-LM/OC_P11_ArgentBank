/** @format */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Feature from "./Feature";

describe("Feature Component", () => {
	const mockProps = {
		iconClass: "feature-icon--chat",
		iconLabel: "Chat icon representing 24/7 customer service",
		title: "You are our #1 priority",
		description:
			"Need to talk to a representative? You can get in touch through our 24/7 chat or through a phone call in less than 5 minutes.",
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test("renders the component with correct props", () => {
		render(<Feature {...mockProps} />);
		expect(screen.getByText(mockProps.title)).toBeInTheDocument();
		expect(screen.getByText(mockProps.description)).toBeInTheDocument();
		expect(screen.getByText(mockProps.iconLabel)).toBeInTheDocument();
	});

	test("applies correct CSS classes", () => {
		render(<Feature {...mockProps} />);
		const iconDiv = document.querySelector(".feature-icon");
		expect(iconDiv).toHaveClass("feature-icon", mockProps.iconClass);
	});

	test("renders <picture> with AVIF, WebP, and PNG sources in correct order", () => {
		render(<Feature {...mockProps} />);
		const picture = document.querySelector("picture");
		expect(picture).not.toBeNull();
		if (picture) {
			const sources = picture.querySelectorAll("source");
			expect(sources[0]).toHaveAttribute("type", "image/avif");
			expect(sources[1]).toHaveAttribute("type", "image/webp");
			const img = picture.querySelector("img");
			expect(img).toHaveAttribute("src", "/img/icon-chat_light-mode.png");
		}
	});

	test("shows fallback text if image fails to load", () => {
		render(<Feature {...mockProps} />);
		const img = document.querySelector(".feature-icon__img");
		expect(img).not.toBeNull();
		if (img) {
			fireEvent.error(img);
		}
		expect(screen.getByText(mockProps.iconLabel)).toBeVisible();
	});

	test("meets accessibility requirements", () => {
		render(<Feature {...mockProps} />);
		const img = document.querySelector(".feature-icon__img");
		expect(img).toHaveAttribute("aria-hidden", "true");
		// The icon label text should be present in the DOM
		expect(screen.getByText(mockProps.iconLabel)).toBeInTheDocument();
	});

	test("renders expected HTML structure", () => {
		const { container } = render(<Feature {...mockProps} />);
		expect(container.querySelector(".feature-item")).toBeInTheDocument();
		expect(container.querySelector(".feature-item__icon")).toBeInTheDocument();
		expect(container.querySelector(".feature-item__title")).toBeInTheDocument();
	});
});
