/** @format */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../../store/Store";
import { usersMockData } from "../../mockData/users";

interface Account {
	accountName: string;
	accountNumber: string;
	balance: string;
	balanceType: string;
}

interface User {
	id: string;
	firstName: string;
	lastName: string;
	userName: string;
	email: string;
	createdAt: string;
	updatedAt: string;
	accounts: Account[];
}

interface UsersState {
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

const usersSlice = createSlice({
	name: "users",
	initialState,
	reducers: {
		addUser: (state, action: PayloadAction<User>) => {
			state.users.push(action.payload);
		},

		setAuthentication: (state, action: PayloadAction<boolean>) => {
			state.isAuthenticated = action.payload;
		},

		loginUserSuccess: (state, action: PayloadAction<UserLoginPayload>) => {
			// Recherche l'utilisateur par email
			const user = state.users.find(
				(user) => user.email === action.payload.email
			);
			if (user) {
				state.currentUser = user;
				state.isAuthenticated = true;
				localStorage.setItem("authToken", action.payload.token);
			}
		},

		// Reducer pour la déconnexion de l'utilisateur
		logoutUser: (state) => {
			state.currentUser = null;
			state.isAuthenticated = false;
			localStorage.removeItem("authToken");
		},

		resetUsers: (state) => {
			state.users = initialState.users;
			state.isAuthenticated = false;
			localStorage.removeItem("authToken");
		},
	},
});

export const {
	addUser,
	resetUsers,
	setAuthentication,
	loginUserSuccess,
	logoutUser,
} = usersSlice.actions;

export const loginUser =
	(email: string, token: string) => async (dispatch: AppDispatch) => {
		try {
			const userResponse = await fetch("/user/profile", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const userData = await userResponse.json();

			if (userData) {
				// Dispatcher l'email ici, au lieu d'utiliser directement les données de la réponse
				dispatch(loginUserSuccess({ email, token }));
			}
		} catch (error) {
			console.error("Failed to login user:", error);
		}
	};

export default usersSlice.reducer;
