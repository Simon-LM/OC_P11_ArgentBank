/** @format */

import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import User from "./User";
import usersReducer, { UsersState } from "../../store/slices/usersSlice";
import { describe, test, expect, vi } from "vitest";

vi.mock("../../hooks/useMatomo/useMatomo", () => ({
	useMatomo: () => ({
		trackEvent: vi.fn(),
		trackPageView: vi.fn(),
	}),
	isMatomoLoaded: () => false,
}));

// Mock the async thunk actions to prevent them from modifying state during tests
vi.mock("../../store/slices/usersSlice", async () => {
	const actual = await vi.importActual("../../store/slices/usersSlice");
	return {
		...actual,
		searchTransactions: vi.fn(() => ({ type: "mock/searchTransactions" })),
		fetchAccounts: vi.fn(() => ({ type: "mock/fetchAccounts" })),
		fetchTransactions: vi.fn(() => ({ type: "mock/fetchTransactions" })),
	};
});

const mockUser = {
	id: "1",
	firstName: "Tony",
	lastName: "Stark",
	userName: "ironman",
	email: "tony@stark.com",
	createdAt: "2024-01-01",
	updatedAt: "2024-01-01",
	accounts: [
		{
			accountName: "Argent Bank Checking",
			accountNumber: "x8349",
			balance: "$2,082.79",
			balanceType: "Available Balance",
		},
	],
};

describe("User Component", () => {
	const renderUser = (customState: Partial<UsersState> = {}) => {
		// Set token in sessionStorage
		sessionStorage.setItem("authToken", "fake-token");

		// Create a complete initial state with all required properties
		const initialState: UsersState = {
			currentUser: mockUser,
			isAuthenticated: true,
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
			accountsStatus: "succeeded",
			accountsError: null,
			selectedAccountId: null,
			transactions: [],
			transactionsStatus: "succeeded",
			transactionsError: null,
			searchResults: [],
			searchStatus: "idle",
			searchError: null,
			pagination: {
				total: 0,
				page: 1,
				limit: 10,
				pages: 0,
			},
			currentSortBy: "date",
			currentSortOrder: "desc",
			...customState,
		};

		// Create a custom reducer that ignores mock actions
		const testReducer = (
			state: UsersState = initialState,
			action: { type: string }
		) => {
			if (action.type?.startsWith("mock/")) {
				return state; // Ignore mock actions
			}
			return usersReducer(state, action);
		};

		const store = configureStore({
			reducer: { users: testReducer },
			preloadedState: {
				users: initialState,
			},
		});

		return render(
			<Provider store={store}>
				<User />
			</Provider>
		);
	};

	test("displays loading message when currentUser is null", () => {
		renderUser({ currentUser: null });
		expect(screen.getByText(/loading user information/i)).toBeInTheDocument();
	});

	test("displays user information", () => {
		renderUser();
		expect(screen.getByText(/tony stark/i)).toBeInTheDocument();
	});

	test("displays message when no accounts are available", () => {
		renderUser({
			accounts: [],
			accountsStatus: "succeeded",
		});

		expect(screen.getByText(/you have no accounts/i)).toBeInTheDocument();
	});

	test("displays loading message when fetching accounts", () => {
		renderUser({ accountsStatus: "loading" });
		expect(screen.getByText(/loading accounts/i)).toBeInTheDocument();
	});

	test("displays error message when accounts fetch fails", () => {
		renderUser({
			accountsStatus: "failed",
			accountsError: "Network error",
		});
		expect(screen.getByText(/error loading accounts/i)).toBeInTheDocument();
	});

	test("displays search error message when transaction search fails", () => {
		renderUser({
			searchStatus: "failed",
			searchError: "Search failed",
		});
		expect(
			screen.getByText(/error searching transactions/i)
		).toBeInTheDocument();
		expect(screen.getByText(/search failed/i)).toBeInTheDocument();
	});

	test("displays loading message when searching transactions", () => {
		renderUser({ searchStatus: "loading" });
		expect(screen.getByText(/searching transactions/i)).toBeInTheDocument();
	});

	test("displays transactions when search results are available", () => {
		const mockTransactions = [
			{
				id: "tx1",
				accountId: "123",
				description: "Test Transaction",
				amount: 100.5,
				date: "2024-01-01",
				type: "CREDIT" as const,
				category: "Income",
				notes: "Test note",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z",
			},
			{
				id: "tx2",
				accountId: "123",
				description: "Another Transaction",
				amount: 50.25,
				date: "2024-01-02",
				type: "DEBIT" as const,
				category: null,
				notes: null,
				createdAt: "2024-01-02T00:00:00Z",
				updatedAt: "2024-01-02T00:00:00Z",
			},
		];

		renderUser({
			searchResults: mockTransactions,
			searchStatus: "succeeded",
		});

		expect(screen.getByText("Test Transaction")).toBeInTheDocument();
		expect(screen.getByText("Another Transaction")).toBeInTheDocument();
		expect(screen.getByText("+100.50 €")).toBeInTheDocument();
		expect(screen.getByText("-50.25 €")).toBeInTheDocument();
		expect(screen.getByText("Test note")).toBeInTheDocument();
	});

	test("displays no transactions message when no results found", () => {
		renderUser({
			searchResults: [],
			searchStatus: "succeeded",
			selectedAccountId: "123",
		});
		expect(
			screen.getByText(/no transactions found for this account/i)
		).toBeInTheDocument();
	});

	test("displays generic no transactions message when no account selected", () => {
		renderUser({
			searchResults: [],
			searchStatus: "succeeded",
			selectedAccountId: null,
		});
		expect(screen.getByText(/no transactions found\./i)).toBeInTheDocument();
	});

	test("renders account selection interface with multiple accounts", () => {
		const multipleAccounts = [
			{
				id: "123",
				accountNumber: "8349",
				balance: 2082.79,
				type: "checking",
				userId: "1",
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
			},
			{
				id: "456",
				accountNumber: "9876",
				balance: 5000.0,
				type: "savings",
				userId: "1",
				createdAt: "2023-01-01",
				updatedAt: "2023-01-01",
			},
		];

		renderUser({
			accounts: multipleAccounts,
			selectedAccountId: "123",
		});

		expect(screen.getByText(/your 2 accounts/i)).toBeInTheDocument();
		expect(screen.getByText(/checking \(x8349\)/i)).toBeInTheDocument();
		expect(screen.getByText(/savings \(x9876\)/i)).toBeInTheDocument();
		expect(screen.getByText("Selected")).toBeInTheDocument();
	});

	test("displays single account correctly", () => {
		renderUser({
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
		});

		expect(screen.getByText(/your 1 account/i)).toBeInTheDocument();
	});

	test("displays account transaction subtitle when account is selected", () => {
		const selectedAccount = {
			id: "123",
			accountNumber: "8349",
			balance: 2082.79,
			type: "checking",
			userId: "1",
			createdAt: "2023-01-01",
			updatedAt: "2023-01-01",
		};

		renderUser({
			accounts: [selectedAccount],
			selectedAccountId: "123",
		});

		expect(screen.getByText("Transaction History")).toBeInTheDocument();
		expect(screen.getByText("Account #8349")).toBeInTheDocument();
	});

	test("displays all transactions title when no account is selected", () => {
		renderUser({
			selectedAccountId: null,
		});

		expect(screen.getByText("All Transactions")).toBeInTheDocument();
	});
});
