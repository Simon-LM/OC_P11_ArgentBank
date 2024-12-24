/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import reducer, {
	addUser,
	loginUserSuccess,
	logoutUser,
	updateCurrentUser,
	setAuthState,
} from "./usersSlice";
import { usersMockData } from "../../mockData/users";

describe("usersSlice", () => {
	const initialState = {
		users: usersMockData,
		isAuthenticated: false,
		currentUser: null,
	};

	const mockUser = {
		id: "1",
		email: "test@example.com",
		firstName: "John",
		lastName: "Doe",
		userName: "johndoe",
		createdAt: "2024-03-14",
		updatedAt: "2024-03-14",
		accounts: [
			{
				accountName: "Checking",
				accountNumber: "123456",
				balance: "$1,000",
				balanceType: "Available Balance",
			},
		],
	};

	beforeEach(() => {
		sessionStorage.clear();
	});

	test("devrait retourner l'état initial", () => {
		expect(reducer(undefined, { type: undefined })).toEqual(initialState);
	});

	test("devrait gérer addUser", () => {
		const nextState = reducer(initialState, addUser(mockUser));
		expect(nextState.users).toContain(mockUser);
	});

	test("devrait gérer loginUserSuccess", () => {
		const loginPayload = {
			email: "test@example.com",
			token: "fake-token",
		};

		const nextState = reducer(initialState, loginUserSuccess(loginPayload));
		expect(nextState.isAuthenticated).toBe(true);
		expect(sessionStorage.getItem("authToken")).toBe("fake-token");
	});

	test("devrait gérer logoutUser", () => {
		const loggedInState = {
			...initialState,
			isAuthenticated: true,
			currentUser: mockUser,
		};

		const nextState = reducer(loggedInState, logoutUser());
		expect(nextState.isAuthenticated).toBe(false);
		expect(nextState.currentUser).toBeNull();
		expect(sessionStorage.getItem("authToken")).toBeNull();
	});

	test("devrait gérer updateCurrentUser avec un utilisateur existant", () => {
		const currentState = {
			...initialState,
			currentUser: mockUser,
		};

		const update = {
			userName: "newUsername",
		};

		const nextState = reducer(currentState, updateCurrentUser(update));
		expect(nextState.currentUser?.userName).toBe("newUsername");
		expect(nextState.currentUser?.firstName).toBe(mockUser.firstName);
	});

	test("devrait gérer updateCurrentUser sans utilisateur existant", () => {
		const update = {
			id: "2",
			userName: "newUser",
			firstName: "Jane",
			lastName: "Doe",
			email: "jane@example.com",
			createdAt: "2024-03-14",
			updatedAt: "2024-03-14",
		};

		const nextState = reducer(initialState, updateCurrentUser(update));
		expect(nextState.currentUser).toEqual(update);
	});

	test("devrait gérer setAuthState", () => {
		const nextState = reducer(initialState, setAuthState(mockUser));
		expect(nextState.isAuthenticated).toBe(true);
		expect(nextState.currentUser).toEqual(mockUser);
	});
});
