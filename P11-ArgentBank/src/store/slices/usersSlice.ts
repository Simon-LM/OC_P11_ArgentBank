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

export interface UIAccount {
  accountName?: string;
  accountNumber: string;
  balance: string | number;
  balanceType?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  accounts?: UIAccount[];
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
}

export interface SearchTransactionsParams {
  accountId?: string;
  searchTerm?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: "CREDIT" | "DEBIT";
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
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

  searchResults: Transaction[];
  searchStatus: "idle" | "loading" | "succeeded" | "failed";
  searchError: string | null;
  pagination: Pagination | null;

  currentSortBy?: string;
  currentSortOrder?: "asc" | "desc";
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

  searchResults: [],
  searchStatus: "idle",
  searchError: null,
  pagination: null,

  currentSortBy: "date",
  currentSortOrder: "desc",
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
        errorData.message || `Failed to fetch accounts: ${response.status}`,
      );
    }
    const data = await response.json();
    if (!data.body || !Array.isArray(data.body)) {
      return rejectWithValue(
        "Invalid response format from server for accounts",
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
        errorData.message || `Failed to fetch transactions: ${response.status}`,
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
      "An unknown error occurred while fetching transactions",
    );
  }
});

export const searchTransactions = createAsyncThunk<
  { transactions: Transaction[]; pagination: Pagination },
  SearchTransactionsParams,
  { rejectValue: string }
>("users/searchTransactions", async (params, { rejectWithValue }) => {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    return rejectWithValue("No authentication token found");
  }

  try {
    // Construire l'URL avec les paramètres de recherche
    const queryParams = new URLSearchParams();
    if (params.accountId) queryParams.set("accountId", params.accountId);
    if (params.searchTerm) queryParams.set("searchTerm", params.searchTerm);
    if (params.category) queryParams.set("category", params.category);
    if (params.fromDate) queryParams.set("fromDate", params.fromDate);
    if (params.toDate) queryParams.set("toDate", params.toDate);
    if (params.minAmount)
      queryParams.set("minAmount", params.minAmount.toString());
    if (params.maxAmount)
      queryParams.set("maxAmount", params.maxAmount.toString());
    if (params.type) queryParams.set("type", params.type);
    queryParams.set("page", params.page?.toString() || "1");
    queryParams.set("limit", params.limit?.toString() || "10");
    queryParams.set("sortBy", params.sortBy || "date");
    queryParams.set("sortOrder", params.sortOrder || "desc");

    const response = await fetch(`/api/transactions/search?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return rejectWithValue(
        errorData.message ||
          `Failed to search transactions: ${response.status}`,
      );
    }

    const data = await response.json();

    if (
      !data.body ||
      !data.body.transactions ||
      !Array.isArray(data.body.transactions)
    ) {
      return rejectWithValue("Invalid response format from server");
    }

    const transactions = data.body.transactions.map((tx: ApiTransaction) => ({
      ...tx,
      amount: parseFloat(String(tx.amount)),
    }));

    return {
      transactions: transactions as Transaction[],
      pagination: data.body.pagination,
    };
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue(
      "An unknown error occurred while searching transactions",
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

    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchStatus = "idle";
      state.searchError = null;
      state.pagination = null;
    },

    setSearchSortOrder: (
      state,
      action: PayloadAction<{
        sortBy: string;
        sortOrder: "asc" | "desc";
      }>,
    ) => {
      const { sortBy, sortOrder } = action.payload;

      state.currentSortBy = sortBy;
      state.currentSortOrder = sortOrder;

      if (state.pagination) {
        state.pagination.page = 1;
      } else {
        state.pagination = {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      }
    },

    setSearchFilters: (
      state,
      action: PayloadAction<Partial<SearchTransactionsParams>>,
    ) => {
      const filters = action.payload;

      if (filters.category) {
        // Vous pourriez ajouter une propriété à UsersState comme activeCategory
        // state.activeCategory = filters.category;
      }

      if (filters.fromDate || filters.toDate) {
        // Vous pourriez ajouter une propriété comme activeDateRange
        // state.activeDateRange = {
        //   from: filters.fromDate,
        //   to: filters.toDate
        // };
      }

      // Réinitialiser la page
      if (state.pagination) {
        state.pagination.page = 1;
      } else {
        state.pagination = {
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
        };
      }
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
        },
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
        },
      )
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsStatus = "failed";
        state.transactionsError =
          action.payload ?? "Failed to fetch transactions";
      })
      .addCase(searchTransactions.pending, (state) => {
        state.searchStatus = "loading";
        state.searchError = null;
      })
      .addCase(searchTransactions.fulfilled, (state, action) => {
        state.searchStatus = "succeeded";
        console.log("API response:", action.payload);
        state.searchResults = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchTransactions.rejected, (state, action) => {
        state.searchStatus = "failed";
        state.searchError = action.payload as string;
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
  clearSearchResults,
  setSearchSortOrder,
  setSearchFilters,
} = usersSlice.actions;

export default usersSlice.reducer;
