/** @format */

import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export interface Account {
	id: string;
	accountNumber: string;
	balance: number;
	type: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	createdAt: string;
	updatedAt: string;
}

export interface Transaction {
	id: string;
	amount: number;
	description: string;
	date: string;
	category: string | null;
	notes: string | null;
	type: "CREDIT" | "DEBIT";
	createdAt: string;
	updatedAt: string;
	accountId: string;
	// Optionnel: Inclure des détails du compte si l'API les renvoie
	// account?: { accountNumber: string; type: string };
}

export interface UsersState {
	isAuthenticated: boolean;
	currentUser: User | null;
	accounts: Account[];
	accountsStatus: "idle" | "loading" | "succeeded" | "failed";
	accountsError: string | null;
	selectedAccountId: string | null;
	transactions: Transaction[];
	transactionsStatus: "idle" | "loading" | "succeeded" | "failed";
	transactionsError: string | null;
}

interface UserLoginPayload {
	email: string;
	token: string;
}

interface ApiAccount {
	id: string;
	accountNumber: string;
	balance: string | number;
	type: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

interface ApiTransaction {
	id: string;
	amount: string | number;
	description: string;
	date: string;
	category: string | null;
	notes: string | null;
	type: "CREDIT" | "DEBIT";
	createdAt: string;
	updatedAt: string;
	accountId: string;
}

const initialState: UsersState = {
	isAuthenticated: !!sessionStorage.getItem("authToken"),
	currentUser: null,
	accounts: [],
	accountsStatus: "idle",
	accountsError: null,
	selectedAccountId: null,
	transactions: [],
	transactionsStatus: "idle",
	transactionsError: null,
};

export const fetchAccounts = createAsyncThunk<
	Account[],
	void,
	{ rejectValue: string }
>("users/fetchAccounts", async (_, { rejectWithValue }) => {
	const token = sessionStorage.getItem("authToken");
	console.log("Token being sent:", token);
	if (!token) {
		return rejectWithValue("No authentication token found");
	}
	try {
		const response = await fetch("/api/accounts", {
			// Appeler la nouvelle route
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) {
			const errorData = await response.json();
			return rejectWithValue(
				errorData.message || `Failed to fetch accounts: ${response.status}`
			);
		}
		const data = await response.json();
		if (!data.body || !Array.isArray(data.body)) {
			return rejectWithValue(
				"Invalid response format from server for accounts"
			);
		}

		const accounts = (data.body as ApiAccount[]).map((acc) => ({
			...acc,
			balance: parseFloat(String(acc.balance)), // Conversion robuste en nombre
		}));
		return accounts as Account[];
	} catch (error) {
		if (error instanceof Error) {
			return rejectWithValue(error.message);
		}
		return rejectWithValue("An unknown error occurred while fetching accounts");
	}
});

export const fetchTransactions = createAsyncThunk<
	Transaction[],
	void,
	{ rejectValue: string }
>("users/fetchTransactions", async (_, { rejectWithValue }) => {
	const token = sessionStorage.getItem("authToken");
	if (!token) {
		return rejectWithValue("No authentication token found");
	}
	try {
		const response = await fetch("/api/transactions", {
			method: "GET",
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			const errorData = await response.json();
			return rejectWithValue(
				errorData.message || `Failed to fetch transactions: ${response.status}`
			);
		}
		const data = await response.json();
		if (!data.body || !Array.isArray(data.body)) {
			return rejectWithValue("Invalid response format from server");
		}
		const transactions = (data.body as ApiTransaction[]).map((tx) => ({
			...tx,
			amount: parseFloat(String(tx.amount)),
		}));
		return transactions as Transaction[];
	} catch (error) {
		if (error instanceof Error) {
			return rejectWithValue(error.message);
		}
		return rejectWithValue(
			"An unknown error occurred while fetching transactions"
		);
	}
});

// Création du slice
const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		loginUserSuccess: (state, action: PayloadAction<UserLoginPayload>) => {
			state.isAuthenticated = true;
			sessionStorage.setItem("authToken", action.payload.token);
			// }
		},

		logoutUser: (state) => {
			state.currentUser = null;
			state.isAuthenticated = false;
			state.transactions = [];
			state.transactionsStatus = "idle";
			state.transactionsError = null;
			state.accounts = [];
			state.accountsStatus = "idle";
			state.accountsError = null;
			state.selectedAccountId = null;
			sessionStorage.removeItem("authToken");
		},

		updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.currentUser) {
				state.currentUser = {
					...state.currentUser,
					...action.payload,
				};
			}
		},
		setAuthState: (state, action: PayloadAction<User>) => {
			state.isAuthenticated = true;
			state.currentUser = action.payload;
		},

		selectAccount: (state, action: PayloadAction<string | null>) => {
			state.selectedAccountId = action.payload;
		},

		clearTransactionsError: (state) => {
			state.transactionsError = null;
		},
	},

	extraReducers: (builder) => {
		builder

			.addCase(fetchAccounts.pending, (state) => {
				state.accountsStatus = "loading";
				state.accountsError = null;
			})
			.addCase(
				fetchAccounts.fulfilled,
				(state, action: PayloadAction<Account[]>) => {
					state.accountsStatus = "succeeded";
					state.accounts = action.payload;
					// Optionnel: sélectionner le premier compte par défaut ?
					// if (state.accounts.length > 0 && state.selectedAccountId === null) {
					//  state.selectedAccountId = state.accounts[0].id;
					// }
				}
			)
			.addCase(fetchAccounts.rejected, (state, action) => {
				state.accountsStatus = "failed";
				state.accountsError = action.payload ?? "Failed to fetch accounts";
			})

			.addCase(fetchTransactions.pending, (state) => {
				state.transactionsStatus = "loading";
				state.transactionsError = null;
			})
			.addCase(
				fetchTransactions.fulfilled,
				(state, action: PayloadAction<Transaction[]>) => {
					state.transactionsStatus = "succeeded";
					state.transactions = action.payload;
				}
			)
			.addCase(fetchTransactions.rejected, (state, action) => {
				state.transactionsStatus = "failed";
				state.transactionsError =
					action.payload ?? "Failed to fetch transactions";
			});
	},
});

export const {
	loginUserSuccess,
	logoutUser,
	updateCurrentUser,
	setAuthState,
	clearTransactionsError,
	selectAccount,
} = usersSlice.actions;

export default usersSlice.reducer;
