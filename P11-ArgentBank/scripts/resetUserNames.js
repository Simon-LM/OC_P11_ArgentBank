/** @format */

import { prisma } from "../api/lib/prisma.js";
import { createToken } from "../api/lib/auth.js";
import fs from "fs";

async function resetInappropriateUserNames() {
  const blacklist = [
    // Anglais
    "profanity",
    "offensive",
    "explicit",
    "admin",
    "root",
    "system",
    "moderator",
    "staff",
    "fuck",
    "shit",
    "ass",
    "sex",
    "porn",
    "nazi",
    "dick",
    "pussy",
    "cock",
    "bitch",
    "bastard",

    // Français
    "putain",
    "merde",
    "connard",
    "bite",
    "cul",
    "salope",
    "pute",
    "enculé",
    "con",
    "foutre",
    "nique",

    // Others
    "password",
    "123456",
    "qwerty",
    "letmein",
    "backdoor",
    "hack",
    "virus",
    "trojan",
    "anonymous",
  ];

  const regex = new RegExp(blacklist.join("|"), "i");

  try {
    const users = await prisma.user.findMany({
      where: {
        userName: {
          contains: regex,
        },
      },
    });

    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          userName: `user_${user.id.substring(0, 6)}`,
        },
      });

      console.log(`Reset username for user ID: ${user.id}`);
    }

    console.log(`Reset complete. Checked ${users.length} usernames.`);
  } catch (error) {
    console.error("Error during username reset:", error);
  }
}

resetInappropriateUserNames()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
