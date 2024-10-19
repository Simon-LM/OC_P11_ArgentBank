/** @format */

import { loginUserSuccess } from "../user/usersSlice";
import { test, expect, describe } from "vitest"; // Import describe from Vitest
import { configureStore } from "@reduxjs/toolkit"; // Import Redux toolkit
import userReducer from "../user/usersSlice"; // Import userReducer
// import usersReducer from "../user/usersSlice";

import { usersMockData } from "../../mockData/users"; // Import mock data
import { logoutUser } from "../user/usersSlice"; // Ajoute cet import

describe("usersSlice Tests with Mock Data", () => {
	// Test for importing loginUserSuccess from usersSlice
	test("should import loginUserSuccess from '../user/usersSlice'", () => {
		expect(loginUserSuccess).toBeDefined();
	});

	// Test for initial state of the user slice
	test("should have correct initial state", () => {
		const store = configureStore({
			reducer: {
				users: userReducer,
			},
		});

		const state = store.getState();
		expect(state.users.currentUser).toBeNull(); // Vérifie que l'état initial est bien null
		expect(state.users.isAuthenticated).toBe(false);
	});

	// Test for dispatching loginUserSuccess
	test("should dispatch loginUserSuccess and update the user state", () => {
		// Initializing a Redux store with the user reducer
		const store = configureStore({
			reducer: {
				users: userReducer,
			},
			preloadedState: {
				users: {
					users: usersMockData,
					isAuthenticated: false,
					currentUser: null,
				},
			},
		});

		// Sample user data
		const userData = {
			email: "steve@rogers.com",
			token: "dummyToken",
		};

		// Dispatching the loginUserSuccess action
		store.dispatch(loginUserSuccess(userData));

		// Checking if the state has been updated correctly
		const state = store.getState();
		const expectedUser = usersMockData.find(
			(user) => user.email === userData.email
		);

		expect(state.users.currentUser).toEqual(expectedUser);
		expect(state.users.isAuthenticated).toBe(true);
	});

	test("should not update state if user is not found", () => {
		const store = configureStore({
			reducer: {
				users: userReducer,
			},
			preloadedState: {
				users: {
					users: usersMockData,
					isAuthenticated: false,
					currentUser: null,
				},
			},
		});

		const userData = {
			email: "unknown@user.com",
			token: "dummyToken",
		};

		store.dispatch(loginUserSuccess(userData));

		const state = store.getState();

		expect(state.users.currentUser).toBeNull();
		expect(state.users.isAuthenticated).toBe(false);
	});

	test("should store token in localStorage on successful login", () => {
		const store = configureStore({
			reducer: {
				users: userReducer,
			},
			preloadedState: {
				users: {
					users: usersMockData,
					isAuthenticated: false,
					currentUser: null,
				},
			},
		});

		const userData = {
			email: "steve@rogers.com",
			token: "dummyToken",
		};

		store.dispatch(loginUserSuccess(userData));

		expect(localStorage.getItem("authToken")).toEqual(userData.token);
	});

	test("should logout user and clear state and localStorage", () => {
		const store = configureStore({
			reducer: {
				users: userReducer,
			},
			preloadedState: {
				users: {
					users: usersMockData,
					isAuthenticated: true,
					currentUser: usersMockData[0],
				},
			},
		});

		localStorage.setItem("authToken", "dummyToken");

		store.dispatch(logoutUser());

		const state = store.getState();

		expect(state.users.currentUser).toBeNull();
		expect(state.users.isAuthenticated).toBe(false);
		expect(localStorage.getItem("authToken")).toBeNull();
	});
});
