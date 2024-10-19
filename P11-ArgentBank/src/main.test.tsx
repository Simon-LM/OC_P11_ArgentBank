/** @format */

import { describe, test, expect } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { StrictMode } from "react";

import { createRoot } from "react-dom/client";
import App from "./App";
import store from "./store/Store";

// import React from "react";
describe("Root rendering", () => {
	test("renders App component without crashing", () => {
		const { getByText } = render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		expect(
			getByText(/Open a savings account with Argent Bank today!/i)
		).toBeInTheDocument();
	});

	test("renders App inside StrictMode", () => {
		const { getByText } = render(
			<StrictMode>
				<Provider store={store}>
					<App />
				</Provider>
			</StrictMode>
		);

		// Vérifiez si certains éléments spécifiques de l'App sont rendus
		expect(getByText(/No fees./i)).toBeInTheDocument();
	});
});

describe("DOM rendering", () => {
	test("renders App in the root element", async () => {
		const rootElement = document.createElement("div");
		rootElement.id = "root";
		document.body.appendChild(rootElement);

		const root = createRoot(rootElement);
		root.render(
			<Provider store={store}>
				<App />
			</Provider>
		);

		await waitFor(() => {
			expect(rootElement.querySelector("main")).toBeInTheDocument();
		});

		document.body.removeChild(rootElement);
	});
});
