/** @format */

import React from "react";
import { render, screen } from "@testing-library/react";
import Footer from "./Footer";
import { test, expect } from "vitest";

test("should render the footer component correctly with the correct class and text", () => {
	render(<Footer />);
	const footerElement = screen.getByTestId("footer");
	expect(footerElement).toBeInTheDocument();
	expect(footerElement).toHaveClass("footer");
	expect(screen.getByText("Copyright 2020 Argent Bank")).toBeInTheDocument();
});
