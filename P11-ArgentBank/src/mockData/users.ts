/** @format */

import { User } from "../store/slices/usersSlice";

// Supprimer le mock ici, il doit être dans setupTests.ts uniquement

export const usersMockData: User[] = [
  {
    id: "1",
    firstName: "Tony",
    lastName: "Stark",
    userName: "Iron",
    email: "tony@stark.com",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
    accounts: [
      {
        accountName: "Argent Bank Checking",
        accountNumber: "x8349",
        balance: "$2,082.79",
        balanceType: "Available Balance",
      },
    ],
  },
  {
    id: "2",
    firstName: "Steve",
    lastName: "Rogers",
    userName: "Captain",
    email: "steve@rogers.com",
    createdAt: "2023-01-02T00:00:00Z",
    updatedAt: "2023-01-02T00:00:00Z",
    accounts: [],
  },
];
