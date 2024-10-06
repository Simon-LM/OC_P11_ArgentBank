/** @format */

import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import counterReducer from "../features/counter/counterSilice";
import usersReducer from "../pages/user/usersSlice";

const store = configureStore({
	reducer: {
		counter: counterReducer,
		users: usersReducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
