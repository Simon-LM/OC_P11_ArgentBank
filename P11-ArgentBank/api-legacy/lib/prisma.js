/** @format */

// import { PrismaClient } from "../../src/generated/prisma/index.js";
// import { PrismaClient } from "@prisma/client";
// const { PrismaClient } = require("@prisma/client");

// export const prisma = new PrismaClient();

// // // // // // // // //

// const { PrismaClient } = require("@prisma/client");

// let prisma;
// if (process.env.NODE_ENV === "production") {
//  prisma = new PrismaClient();
// } else {
//  if (!global.prisma) {
//   global.prisma = new PrismaClient();
//  }
//  prisma = global.prisma;
// }

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

let prisma;

// Cette logique permet d'utiliser une seule instance de PrismaClient en développement
// pour éviter de créer trop de connexions à la base de données.
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global._prisma) {
    global._prisma = new PrismaClient();
  }
  prisma = global._prisma;
}

export { prisma };
