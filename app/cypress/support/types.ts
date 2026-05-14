/** @format */

// Types partagés pour les tests Cypress
// Centralisation des interfaces pour éviter les conflits de types

/**
 * Interface utilisateur pour les fixtures de test
 * Utilisée dans tous les tests d'authentification et de profil
 */
export interface User {
  type: "valid" | "invalid";
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
}

/**
 * Interface pour les données de compte bancaire
 * Utilisée dans les tests de comptes et transactions
 */
export interface Account {
  id: string;
  title: string;
  balance: string;
  description: string;
  accountNumber: string;
}

/**
 * Interface pour les transactions
 * Utilisée dans les tests de transactions
 */
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  balance: number;
  category?: string;
  notes?: string;
}
