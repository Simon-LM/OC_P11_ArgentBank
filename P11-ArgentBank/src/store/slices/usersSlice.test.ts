/** @format */

import { describe, test, expect, beforeEach } from "vitest";
import reducer, {
	loginUserSuccess,
	logoutUser,
	updateCurrentUser,
	setAuthState,
	UsersState,
	User,
	clearTransactionsError,
	selectAccount,
} from "./usersSlice";

describe("usersSlice", () => {
	const initialState: UsersState = {
		isAuthenticated: false,
		currentUser: null,
		accounts: [],
		accountsStatus: "idle",
		accountsError: null,
		selectedAccountId: null,
		transactions: [],
		transactionsStatus: "idle",
		transactionsError: null,
		searchResults: [],
		searchStatus: "idle",
		searchError: null,
		pagination: null,
		currentSortBy: "date",
		currentSortOrder: "desc",
	};

	const mockUser: User = {
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
		const result = reducer(undefined, { type: "@@INIT" });
		expect(result.isAuthenticated).toEqual(initialState.isAuthenticated);
		expect(result.currentUser).toEqual(initialState.currentUser);
		expect(result.accounts).toEqual(initialState.accounts);
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
		const loggedInState: UsersState = {
			...initialState,
			isAuthenticated: true,
			currentUser: mockUser,
			accounts: [
				{
					id: "123",
					accountNumber: "8349",
					balance: 2082.79,
					type: "checking",
					userId: "1",
					createdAt: "2023-01-01",
					updatedAt: "2023-01-01",
				},
			],
			transactions: [
				{
					id: "t1",
					amount: 1000,
					description: "Test",
					date: "2023-01-01",
					category: "Food",
					notes: null,
					type: "DEBIT",
					createdAt: "2023-01-01",
					updatedAt: "2023-01-01",
					accountId: "123",
				},
			],
		};

		const nextState = reducer(loggedInState, logoutUser());
		expect(nextState.isAuthenticated).toBe(false);
		expect(nextState.currentUser).toBeNull();
		expect(nextState.accounts).toEqual([]);
		expect(nextState.transactions).toEqual([]);
		expect(sessionStorage.getItem("authToken")).toBeNull();
	});

	test("devrait gérer updateCurrentUser avec un utilisateur existant", () => {
		const currentState: UsersState = {
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

	test("devrait gérer setAuthState", () => {
		const nextState = reducer(initialState, setAuthState(mockUser));
		expect(nextState.isAuthenticated).toBe(true);
		expect(nextState.currentUser).toEqual(mockUser);
	});

	test("devrait gérer clearTransactionsError", () => {
		const stateWithError: UsersState = {
			...initialState,
			transactionsError: "Une erreur est survenue",
		};

		const nextState = reducer(stateWithError, clearTransactionsError());
		expect(nextState.transactionsError).toBeNull();
	});

	test("devrait gérer selectAccount", () => {
		const accountId = "account123";
		const nextState = reducer(initialState, selectAccount(accountId));
		expect(nextState.selectedAccountId).toBe(accountId);

		const afterState = reducer(nextState, selectAccount(null));
		expect(afterState.selectedAccountId).toBeNull();
	});
});
