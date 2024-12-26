/** @format */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { usersMockData } from "../../mockData/users";
export interface Account {
	accountName: string;
	accountNumber: string;
	balance: string;
	balanceType: string;
}

export interface User {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	accounts?: Account[];
}

export interface UsersState {
	users: User[];
	isAuthenticated: boolean;
	currentUser: User | null;
}

interface UserLoginPayload {
	email: string;
	token: string;
}

const initialState: UsersState = {
	users: usersMockData,
	isAuthenticated: false,
	currentUser: null,
};

// Création du slice
const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (state, action: PayloadAction<User>) => {
			state.users.push(action.payload);
		},

		loginUserSuccess: (state, action: PayloadAction<UserLoginPayload>) => {
			state.isAuthenticated = true;
			sessionStorage.setItem("authToken", action.payload.token);
			// }
		},

		logoutUser: (state) => {
			state.currentUser = null;
			state.isAuthenticated = false;
			sessionStorage.removeItem("authToken");
		},
		updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
			if (state.currentUser) {
				state.currentUser = {
					...state.currentUser,
					...action.payload,
				};
			} else {
				state.currentUser = action.payload as User;
			}
		},
		setAuthState: (state, action: PayloadAction<User>) => {
			state.isAuthenticated = true;
			state.currentUser = action.payload;
		},
	},
});

export const {
	addUser,
	loginUserSuccess,
	logoutUser,
	updateCurrentUser,
	setAuthState,
} = usersSlice.actions;

export default usersSlice.reducer;
