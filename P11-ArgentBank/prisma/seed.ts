/** @format */

import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed User 1 (Tony Stark) ---
  const tonyPassword = await bcrypt.hash("password123", saltRounds);
  const tony = await prisma.user.upsert({
    where: { email: "tony@stark.com" },
    update: { userName: "Iron" },
    create: {
      email: "tony@stark.com",
      password: tonyPassword,
      firstName: "Tony",
      lastName: "Stark",
      userName: "Iron",
    },
  });
  console.log(`Upserted user Tony Stark with id: ${tony.id}`);

  // Clean before seeding new data for this user
  await prisma.transaction.deleteMany({
    where: { account: { userId: tony.id } },
  });
  await prisma.account.deleteMany({ where: { userId: tony.id } });
  console.log(`Cleaned old accounts/transactions for Tony Stark.`);

  // Tony's Credit Card Account
  const tonyCredit = await prisma.account.create({
    data: {
      userId: tony.id,
      accountNumber: "5642",
      balance: -3785.45,
      type: "Argent Bank Credit Card",
      transactions: {
        create: [
          {
            date: new Date("2024-04-22T19:30:00Z"),
            amount: 1249.99,
            description: "Electronics Megastore",
            type: TransactionType.DEBIT,
            category: "Technology",
            notes: "New prototype components for lab",
          },
          {
            date: new Date("2024-04-20T14:20:00Z"),
            amount: 1500.0,
            description: "Payment Received - Thank You",
            type: TransactionType.CREDIT,
            category: "Payment",
            notes: "Partial payment from checking account",
          },
          {
            date: new Date("2024-04-18T21:15:00Z"),
            amount: 890.5,
            description: "Luxury Restaurant 'The Manhattan'",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Business dinner with potential investors",
          },
          {
            date: new Date("2024-04-15T16:45:00Z"),
            amount: 459.75,
            description: "Designer Clothing Store",
            type: TransactionType.DEBIT,
            category: "Shopping",
            notes: "New suit for charity gala",
          },
          {
            date: new Date("2024-04-12T10:30:00Z"),
            amount: 256.8,
            description: "Auto Parts Specialist",
            type: TransactionType.DEBIT,
            category: "Automotive",
            notes: "Custom parts for vehicle modification",
          },
          {
            date: new Date("2024-04-10T13:00:00Z"),
            amount: 1000.0,
            description: "Payment Received - Thank You",
            type: TransactionType.CREDIT,
            category: "Payment",
            notes: "Monthly card payment",
          },
          {
            date: new Date("2024-04-08T09:15:00Z"),
            amount: 199.99,
            description: "Premium Software Subscription",
            type: TransactionType.DEBIT,
            category: "Software",
            notes: "Annual subscription for design tools",
          },
          {
            date: new Date("2024-04-05T17:20:00Z"),
            amount: 345.0,
            description: "Upscale Wine Merchant",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Special occasion reserve bottles",
          },
          {
            date: new Date("2024-04-02T11:30:00Z"),
            amount: 125.45,
            description: "High-End Coffee Shop",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Team coffee meeting with R&D staff",
          },
          {
            date: new Date("2024-03-30T15:45:00Z"),
            amount: 850.0,
            description: "Exclusive Club Membership",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Annual membership renewal",
          },
        ],
      },
    },
  });

  // Tony's Checking Account
  const tonyChecking = await prisma.account.create({
    data: {
      userId: tony.id,
      accountNumber: "8949",
      balance: 5600.55,
      type: "Argent Bank Checking",
      transactions: {
        create: [
          // Add more transactions here (10+)
          {
            date: new Date("2024-04-22T09:15:00Z"),
            amount: 150.75,
            description: "Online Tech Store Purchase",
            type: TransactionType.DEBIT,
            category: "Shopping",
            notes: "Personal R&D project components",
          },
          {
            date: new Date("2024-04-21T14:00:00Z"),
            amount: 45.5,
            description: "Lunch Meeting",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Client lunch",
          },
          {
            date: new Date("2024-04-20T10:00:00Z"),
            amount: 250.0,
            description: "Restaurant 'Le Gourmet'",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-19T15:30:00Z"),
            amount: 5000.0,
            description: "Salary Deposit - Stark Industries",
            type: TransactionType.CREDIT,
            category: "Income",
            notes: "Monthly executive compensation",
          },
          {
            date: new Date("2024-04-18T08:15:00Z"),
            amount: 55.6,
            description: "Golden Sun Bakery",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Team breakfast",
          },
          {
            date: new Date("2024-04-17T11:00:00Z"),
            amount: 8.0,
            description: "Coffee Shop",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-16T18:00:00Z"),
            amount: 220.0,
            description: "Utility Bill Payment",
            type: TransactionType.DEBIT,
            category: "Utilities",
          },
          {
            date: new Date("2024-04-15T10:00:00Z"),
            amount: 75.0,
            description: "Bookstore Purchase",
            type: TransactionType.DEBIT,
            category: "Shopping",
          },
          {
            date: new Date("2024-04-14T12:30:00Z"),
            amount: 300.0,
            description: "ATM Withdrawal",
            type: TransactionType.DEBIT,
            category: "Withdrawal",
          },
          {
            date: new Date("2024-04-13T09:00:00Z"),
            amount: 12.99,
            description: "Streaming Service Subscription",
            type: TransactionType.DEBIT,
            category: "Subscriptions",
          },
          {
            date: new Date("2024-04-12T16:45:00Z"),
            amount: 85.2,
            description: "Gas Station",
            type: TransactionType.DEBIT,
            category: "Transport",
          },
          {
            date: new Date("2024-04-11T11:20:00Z"),
            amount: 500.0,
            description: "Transfer to Savings",
            type: TransactionType.DEBIT,
            category: "Transfer",
          },
          {
            date: new Date("2024-04-10T19:00:00Z"),
            amount: 65.0,
            description: "Dinner with Pepper",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-09T13:00:00Z"),
            amount: 199.99,
            description: "New Gadget",
            type: TransactionType.DEBIT,
            category: "Shopping",
          },
          {
            date: new Date("2024-04-08T07:00:00Z"),
            amount: 25.0,
            description: "Dry Cleaning",
            type: TransactionType.DEBIT,
            category: "Services",
          },
          {
            date: new Date("2024-04-07T10:30:00Z"),
            amount: 1250.0,
            description: "Consulting Fee - Resilient Technologies",
            type: TransactionType.CREDIT,
            category: "Income",
            notes: "Advanced defense systems consultation",
          },
        ],
      },
    },
  });

  // Tony's Savings Account
  const tonySavings = await prisma.account.create({
    data: {
      userId: tony.id,
      accountNumber: "2094",
      balance: 12450.22,
      type: "Argent Bank Savings",
      transactions: {
        create: [
          // Add more transactions here (10+)
          {
            date: new Date("2024-04-11T11:21:00Z"),
            amount: 500.0,
            description: "Transfer from Checking",
            type: TransactionType.CREDIT,
            category: "Transfer",
          },
          {
            date: new Date("2024-04-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-03-31T10:00:00Z"),
            amount: 10.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-03-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-02-29T10:00:00Z"),
            amount: 9.8,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-02-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-01-31T10:00:00Z"),
            amount: 9.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-01-15T14:00:00Z"),
            amount: 1000.0,
            description: "Bonus Deposit",
            type: TransactionType.CREDIT,
            category: "Income",
          },
          {
            date: new Date("2024-01-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2023-12-31T10:00:00Z"),
            amount: 8.9,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2023-12-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2023-11-30T10:00:00Z"),
            amount: 8.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-02-15T14:20:00Z"),
            amount: 2000.0,
            description: "Transfer to Checking Account",
            type: TransactionType.DEBIT,
            category: "Transfer",
            notes: "Fund allocation for lab equipment purchase",
          },
          {
            date: new Date("2024-01-10T09:45:00Z"),
            amount: 1500.0,
            description: "Emergency Fund Withdrawal",
            type: TransactionType.DEBIT,
            category: "Withdrawal",
            notes: "Urgent parts replacement for primary lab system",
          },
        ],
      },
    },
  });

  console.log(
    `Created accounts for Tony Stark: ${tonyChecking.id}, ${tonySavings.id} , ${tonyCredit.id}`,
  );

  // --- Seed User 2 (Steve Rogers) ---
  const stevePassword = await bcrypt.hash("Louvre123", saltRounds);
  const steve = await prisma.user.upsert({
    where: { email: "steve@rogers.com" },
    update: {
      userName: "Captain",
      password: stevePassword,
    },
    create: {
      email: "steve@rogers.com",
      password: stevePassword,
      firstName: "Steve",
      lastName: "Rogers",
      userName: "Captain",
    },
  });
  console.log(`Upserted user Steve Rogers with id: ${steve.id}`);

  // Clean before seeding new data for this user
  await prisma.transaction.deleteMany({
    where: { account: { userId: steve.id } },
  });
  await prisma.account.deleteMany({ where: { userId: steve.id } });
  console.log(`Cleaned old accounts/transactions for Steve Rogers.`);

  // Steve's Credit Card Account
  const steveCredit = await prisma.account.create({
    data: {
      userId: steve.id,
      accountNumber: "8849",
      balance: -3785.45,
      type: "Argent Bank Credit Card",
      transactions: {
        create: [
          {
            date: new Date("2024-04-22T19:30:00Z"),
            amount: 1249.99,
            description: "Electronics Megastore",
            type: TransactionType.DEBIT,
            category: "Technology",
            notes: "New prototype components for lab",
          },
          {
            date: new Date("2024-04-20T14:20:00Z"),
            amount: 1500.0,
            description: "Payment Received - Thank You",
            type: TransactionType.CREDIT,
            category: "Payment",
            notes: "Partial payment from checking account",
          },
          {
            date: new Date("2024-04-18T21:15:00Z"),
            amount: 890.5,
            description: "Luxury Restaurant 'The Manhattan'",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Business dinner with potential investors",
          },
          {
            date: new Date("2024-04-15T16:45:00Z"),
            amount: 459.75,
            description: "Designer Clothing Store",
            type: TransactionType.DEBIT,
            category: "Shopping",
            notes: "New suit for charity gala",
          },
          {
            date: new Date("2024-04-12T10:30:00Z"),
            amount: 256.8,
            description: "Auto Parts Specialist",
            type: TransactionType.DEBIT,
            category: "Automotive",
            notes: "Custom parts for vehicle modification",
          },
          {
            date: new Date("2024-04-10T13:00:00Z"),
            amount: 1000.0,
            description: "Payment Received - Thank You",
            type: TransactionType.CREDIT,
            category: "Payment",
            notes: "Monthly card payment",
          },
          {
            date: new Date("2024-04-08T09:15:00Z"),
            amount: 199.99,
            description: "Premium Software Subscription",
            type: TransactionType.DEBIT,
            category: "Software",
            notes: "Annual subscription for design tools",
          },
          {
            date: new Date("2024-04-05T17:20:00Z"),
            amount: 345.0,
            description: "Upscale Wine Merchant",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Special occasion reserve bottles",
          },
          {
            date: new Date("2024-04-02T11:30:00Z"),
            amount: 125.45,
            description: "High-End Coffee Shop",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Team coffee meeting with R&D staff",
          },
          {
            date: new Date("2024-03-30T15:45:00Z"),
            amount: 850.0,
            description: "Exclusive Club Membership",
            type: TransactionType.DEBIT,
            category: "Entertainment",
            notes: "Annual membership renewal",
          },
        ],
      },
    },
  });

  // Steve's Checking Account
  const steveChecking = await prisma.account.create({
    data: {
      userId: steve.id,
      accountNumber: "8349",
      balance: 5600.55,
      type: "Argent Bank Checking",
      transactions: {
        create: [
          // Add more transactions here (10+)
          {
            date: new Date("2024-04-22T09:15:00Z"),
            amount: 150.75,
            description: "Online Tech Store Purchase",
            type: TransactionType.DEBIT,
            category: "Shopping",
            notes: "Personal R&D project components",
          },
          {
            date: new Date("2024-04-21T14:00:00Z"),
            amount: 45.5,
            description: "Lunch Meeting",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Client lunch",
          },
          {
            date: new Date("2024-04-20T10:00:00Z"),
            amount: 250.0,
            description: "Restaurant 'Le Gourmet'",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-19T15:30:00Z"),
            amount: 5000.0,
            description: "Salary Deposit - Stark Industries",
            type: TransactionType.CREDIT,
            category: "Income",
            notes: "Monthly executive compensation",
          },
          {
            date: new Date("2024-04-18T08:15:00Z"),
            amount: 55.6,
            description: "Golden Sun Bakery",
            type: TransactionType.DEBIT,
            category: "Food",
            notes: "Team breakfast",
          },
          {
            date: new Date("2024-04-17T11:00:00Z"),
            amount: 8.0,
            description: "Coffee Shop",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-16T18:00:00Z"),
            amount: 220.0,
            description: "Utility Bill Payment",
            type: TransactionType.DEBIT,
            category: "Utilities",
          },
          {
            date: new Date("2024-04-15T10:00:00Z"),
            amount: 75.0,
            description: "Bookstore Purchase",
            type: TransactionType.DEBIT,
            category: "Shopping",
          },
          {
            date: new Date("2024-04-14T12:30:00Z"),
            amount: 300.0,
            description: "ATM Withdrawal",
            type: TransactionType.DEBIT,
            category: "Withdrawal",
          },
          {
            date: new Date("2024-04-13T09:00:00Z"),
            amount: 12.99,
            description: "Streaming Service Subscription",
            type: TransactionType.DEBIT,
            category: "Subscriptions",
          },
          {
            date: new Date("2024-04-12T16:45:00Z"),
            amount: 85.2,
            description: "Gas Station",
            type: TransactionType.DEBIT,
            category: "Transport",
          },
          {
            date: new Date("2024-04-11T11:20:00Z"),
            amount: 500.0,
            description: "Transfer to Savings",
            type: TransactionType.DEBIT,
            category: "Transfer",
          },
          {
            date: new Date("2024-04-10T19:00:00Z"),
            amount: 65.0,
            description: "Dinner with Pepper",
            type: TransactionType.DEBIT,
            category: "Food",
          },
          {
            date: new Date("2024-04-09T13:00:00Z"),
            amount: 199.99,
            description: "New Gadget",
            type: TransactionType.DEBIT,
            category: "Shopping",
          },
          {
            date: new Date("2024-04-08T07:00:00Z"),
            amount: 25.0,
            description: "Dry Cleaning",
            type: TransactionType.DEBIT,
            category: "Services",
          },
          {
            date: new Date("2024-04-07T10:30:00Z"),
            amount: 1250.0,
            description: "Consulting Fee - Resilient Technologies",
            type: TransactionType.CREDIT,
            category: "Income",
            notes: "Advanced defense systems consultation",
          },
        ],
      },
    },
  });

  // Steve's Savings Account
  const steveSavings = await prisma.account.create({
    data: {
      userId: steve.id,
      accountNumber: "6712",
      balance: 12450.22,
      type: "Argent Bank Savings",
      transactions: {
        create: [
          // Add more transactions here (10+)
          {
            date: new Date("2024-04-11T11:21:00Z"),
            amount: 500.0,
            description: "Transfer from Checking",
            type: TransactionType.CREDIT,
            category: "Transfer",
          },
          {
            date: new Date("2024-04-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-03-31T10:00:00Z"),
            amount: 10.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-03-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-02-29T10:00:00Z"),
            amount: 9.8,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-02-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2024-01-31T10:00:00Z"),
            amount: 9.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-01-15T14:00:00Z"),
            amount: 1000.0,
            description: "Bonus Deposit",
            type: TransactionType.CREDIT,
            category: "Income",
          },
          {
            date: new Date("2024-01-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2023-12-31T10:00:00Z"),
            amount: 8.9,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2023-12-01T09:00:00Z"),
            amount: 500.0,
            description: "Monthly Savings Transfer",
            type: TransactionType.CREDIT,
            category: "Savings",
          },
          {
            date: new Date("2023-11-30T10:00:00Z"),
            amount: 8.5,
            description: "Interest Earned",
            type: TransactionType.CREDIT,
            category: "Interest",
          },
          {
            date: new Date("2024-02-15T14:20:00Z"),
            amount: 2000.0,
            description: "Transfer to Checking Account",
            type: TransactionType.DEBIT,
            category: "Transfer",
            notes: "Fund allocation for lab equipment purchase",
          },
          {
            date: new Date("2024-01-10T09:45:00Z"),
            amount: 1500.0,
            description: "Emergency Fund Withdrawal",
            type: TransactionType.DEBIT,
            category: "Withdrawal",
            notes: "Urgent parts replacement for primary lab system",
          },
        ],
      },
    },
  });
  console.log(
    `Created accounts for Steve Rogers: ${steveChecking.id}, ${steveSavings.id}, ${steveCredit.id}`,
  );

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
