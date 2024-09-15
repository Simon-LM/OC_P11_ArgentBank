/** @format */

import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSilice"; // Assurez-vous d'importer le bon reducer

const store = configureStore({
	reducer: {
		counter: counterReducer, // Ajoutez le reducer ici
	},
});

export type RootState = ReturnType<typeof store.getState>; // Type pour le state
export type AppDispatch = typeof store.dispatch; // Type pour le dispatch

export default store;
