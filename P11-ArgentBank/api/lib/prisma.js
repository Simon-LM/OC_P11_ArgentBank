/** @format */

// import { PrismaClient } from "../../src/generated/prisma/index.js";
// import { PrismaClient } from "@prisma/client";
// const { PrismaClient } = require("@prisma/client");

// export const prisma = new PrismaClient();

// // // // // // // // //

// const { PrismaClient } = require("@prisma/client");

// let prisma;
// if (process.env.NODE_ENV === "production") {
// 	prisma = new PrismaClient();
// } else {
// 	if (!global.prisma) {
// 		global.prisma = new PrismaClient();
// 	}
// 	prisma = global.prisma;
// }

// module.exports = { prisma };

// // // // // // // // //

import { PrismaClient } from "@prisma/client";

let prisma;
if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient();
} else {
	if (!global.prisma) {
		global.prisma = new PrismaClient();
	}
	prisma = global.prisma;
}

export { prisma };
