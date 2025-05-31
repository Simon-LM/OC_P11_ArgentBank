/** @format */

// import { PrismaClient } from "@prisma/client";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const saltRounds = 10;

async function hashPasswords() {
  console.log("Starting password hashing process...");
  try {
    const users = await prisma.user.findMany({
      // Optionnel: Sélectionner uniquement les utilisateurs dont le mot de passe
      // ne ressemble pas déjà à un hash bcrypt (commence par $2a$, $2b$, $2y$)
      // where: {
      //   NOT: {
      //     password: {
      //       startsWith: '$2',
      //     },
      //   },
      // },
    });

    if (users.length === 0) {
      console.log("No users found needing password hashing.");
      return;
    }

    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
      // Vérifie si le mot de passe ressemble déjà à un hash pour éviter de re-hacher
      if (user.password && !user.password.startsWith("$2")) {
        try {
          console.log(`Hashing password for user ${user.email}...`);
          const hashedPassword = await bcrypt.hash(user.password, saltRounds);
          await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          });
          console.log(`Successfully updated password for user ${user.email}.`);
        } catch (hashError) {
          console.error(
            `Failed to hash/update password for user ${user.email}:`,
            hashError,
          );
        }
      } else {
        console.log(
          `Skipping user ${user.email} (password might already be hashed or is empty).`,
        );
      }
    }

    console.log("Password hashing process completed.");
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

hashPasswords();
