/** @format */
// import { PrismaClient } from "./generated/prisma";
import { PrismaClient } from "./generated/prisma/index.js";
// import { PrismaClient } from "@generated/prisma/index.js";
// import { PrismaClient } from "@prisma/client";
// // eslint-disable-next-line @typescript-eslint/no-require-imports
// const { PrismaClient } = require("./generated/prisma/index.js");
const prisma = new PrismaClient();
async function main() {
  // Retrieve all users
  const users = await prisma.user.findMany();
  console.log("Tous les utilisateurs :", users);
  // Retrieve a specific user
  const tony = await prisma.user.findUnique({
    where: { email: "tony@stark.com" },
  });
  console.log("Tony :", tony);
}
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
