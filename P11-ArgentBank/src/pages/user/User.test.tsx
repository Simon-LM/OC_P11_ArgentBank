/** @format */

import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer from "../../pages/user/usersSlice";
import { describe, test, expect } from "vitest";

// Mock Redux store avec currentUser null
const initialState = {
	users: {
		currentUser: null,
		users: [],
		isAuthenticated: false,
	},
};

const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	preloadedState: initialState,
});

const userMock = {
	id: "1",
	firstName: "Tony",
	lastName: "Stark",
	userName: "ironman",
	email: "tony@stark.com",
	createdAt: "2024-01-01",
	updatedAt: "2024-01-01",
	accounts: [
		{
			accountName: "Checking Account",
			accountNumber: "12345678",
			balance: "$1000",
			balanceType: "Current Balance",
		},
	],
};

// Mock Redux state avec un utilisateur authentifié
const authenticatedState = {
	users: {
		currentUser: userMock,
		users: [],
		isAuthenticated: true, // si nécessaire
	},
};

// Création du store avec configureStore et l'état mocké
const storeWithUser = configureStore({
	reducer: {
		users: usersReducer,
	},
	preloadedState: authenticatedState, // Utilisation de l'état mocké
});

describe("User Component", () => {
	test("should display loading message when currentUser is null", () => {
		const { getByText } = render(
			<Provider store={store}>
				<User />
			</Provider>
		);

		expect(getByText("Loading user data...")).toBeInTheDocument();
	});
});

describe("User Component", () => {
	test("should display the user name when currentUser is present", () => {
		const { getByText } = render(
			<Provider store={storeWithUser}>
				<User />
			</Provider>
		);

		const userName = getByText(/Tony Stark/i);
		expect(userName).toBeInTheDocument();
	});
});
