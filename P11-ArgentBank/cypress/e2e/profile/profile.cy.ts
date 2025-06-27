/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Gestion de Profil Utilisateur", () => {
  beforeEach(() => {
    // Charger les fixtures utilisateur
    cy.fixture("users.json").as("usersData");

    // Utiliser cy.session pour éviter les connexions multiples et le rate limiting
    cy.get<User[]>("@usersData").then((usersData) => {
      const validUser = usersData.find((user) => user.type === "valid");

      if (!validUser || !validUser.email || !validUser.password) {
        throw new Error(
          "Utilisateur valide non trouvé ou informations manquantes (email, password) dans les fixtures pour le beforeEach de profil.",
        );
      }

      // Utiliser cy.session pour réutiliser la session entre les tests
      cy.session(
        [validUser.email, validUser.password],
        () => {
          // Se connecter seulement UNE FOIS pour tous les tests
          cy.visit("/signin");
          cy.get("input#email").type(validUser.email);
          cy.get("input#password").type(validUser.password);
          cy.get("form").contains("button", "Connect").click();
          cy.url().should("include", "/user");
        },
        {
          validate() {
            // Vérifier que la session est toujours valide
            cy.visit("/user");
            cy.url().should("include", "/user");
          },
        },
      );

      // Visiter la page utilisateur après la session
      cy.visit("/user");

      // Vérifier que le nom d'utilisateur est affiché dans l'en-tête
      if (!validUser.userName) {
        throw new Error(
          "Le nom d'utilisateur (userName) est manquant dans les données de fixture de l'utilisateur valide.",
        );
      }
      cy.get(".header__nav-item")
        .contains(validUser.userName)
        .should("be.visible");
    });
  });

  it("devrait afficher correctement les informations de l'utilisateur sur la page de profil", function () {
    // Injecter axe-core et tester l'accessibilité de la page de profil (ignorer les violations de contraste connues)
    cy.injectAxe();
    cy.checkA11y();

    // this.usersData est disponible grâce à l'alias dans beforeEach et l'utilisation de function()
    // Typage explicite de this.usersData
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser) {
      throw new Error(
        "Utilisateur valide non trouvé dans les fixtures pour le test.",
      );
    }

    // La page /User est celle où le profil est affiché ou modifiable
    // Vérifier que le titre "Welcome back" est présent
    cy.contains("h2", "Welcome back").should("be.visible"); // Titre de la page User

    // Vérifier la présence du bouton "Edit User"
    cy.contains("button", "Edit User").should("be.visible");

    // Cliquer sur "Edit User" pour faire apparaître les champs du formulaire
    cy.contains("button", "Edit User").click();

    // Test d'accessibilité du formulaire d'édition ouvert (ignorer les violations de contraste connues)
    cy.checkA11y();

    // Vérifier que les champs userName, firstName et lastName sont corrects
    // Assurer que userName, firstName et lastName ne sont pas undefined avant de les utiliser
    if (validUser.userName) {
      cy.get("input#userName").should("have.value", validUser.userName);
    } else {
      // Si userName peut être optionnel et que le champ doit être vide, ajustez ici
      cy.get("input#userName").should("have.value", "");
    }
    if (validUser.firstName) {
      cy.get("input#firstName")
        .should("have.value", validUser.firstName)
        .and("have.attr", "readonly"); // Changé de .and("be.disabled")
    } else {
      cy.get("input#firstName")
        .should("have.value", "")
        .and("have.attr", "readonly"); // Changé de .and("be.disabled")
    }
    if (validUser.lastName) {
      cy.get("input#lastName")
        .should("have.value", validUser.lastName)
        .and("have.attr", "readonly"); // Changé de .and("be.disabled")
    } else {
      cy.get("input#lastName")
        .should("have.value", "")
        .and("have.attr", "readonly"); // Changé de .and("be.disabled")
    }

    // Optionnel: vérifier d'autres informations si elles sont présentes
  });

  it("devrait permettre à un utilisateur de modifier son nom d'utilisateur avec succès", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      // Ajout d'une vérification pour validUser.userName
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de modification.",
      );
    }

    const originalUserName = validUser.userName;
    const newUserName = "IronMan76"; // Nouveau nom d'utilisateur pour le test

    // S'assurer que newUserName est différent de originalUserName pour que le test soit significatif
    if (originalUserName === newUserName) {
      throw new Error(
        "Le nouveau nom d'utilisateur doit être différent de l'original pour ce test.",
      );
    }

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Modifier le nom d'utilisateur
    cy.get("input#userName").clear().type(newUserName);

    // 3. Cliquer sur "Save"
    cy.contains("button", "Save").click();

    // 4. Vérifier que le formulaire est fermé (le bouton "Edit User" est de nouveau visible)
    cy.contains("button", "Edit User").should("be.visible");

    // 5. Vérifier que le nom d'utilisateur dans l'en-tête est mis à jour avec le nouveau nom
    cy.get(".header__nav-item span").should("contain.text", newUserName);

    // --- Remettre le nom d'utilisateur à son état original ---
    cy.log("Réinitialisation du nom d'utilisateur à sa valeur d'origine.");
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(originalUserName);
    cy.contains("button", "Save").click();
    cy.contains("button", "Edit User").should("be.visible"); // Confirmer la fermeture du formulaire
    // Vérifier que le nom dans l'en-tête est revenu à l'original
    cy.get(".header__nav-item span").should("contain.text", originalUserName);
    cy.log("Nom d'utilisateur réinitialisé.");
  });

  it("devrait annuler la modification du nom d'utilisateur", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test d'annulation.",
      );
    }

    const originalUserName = validUser.userName;
    const tempUserName = "TempUserName123";

    // S'assurer que tempUserName est différent de originalUserName
    if (originalUserName === tempUserName) {
      throw new Error(
        "Le nom d'utilisateur temporaire doit être différent de l'original pour ce test.",
      );
    }

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Modifier le nom d'utilisateur (temporairement)
    cy.get("input#userName").clear().type(tempUserName);

    // 3. Cliquer sur "Cancel"
    cy.contains("button", "Cancel").click();

    // 4. Vérifier que le formulaire est fermé
    cy.contains("button", "Edit User").should("be.visible");
    cy.contains("button", "Save").should("not.exist");
    cy.contains("button", "Cancel").should("not.exist");

    // 5. Vérifier que le nom d'utilisateur dans l'en-tête n'a pas changé
    cy.get(".header__nav-item span").should("contain.text", originalUserName);

    // 6. Rouvrir le formulaire et vérifier que le champ userName contient toujours l'originalUserName
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").should("have.value", originalUserName);
    // Optionnel: refermer le formulaire proprement
    cy.contains("button", "Cancel").click();
  });

  // Test pour la validation du formulaire (par exemple, nom d'utilisateur vide)
  it("devrait afficher une erreur si le nom d'utilisateur est soumis vide", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Vider le champ du nom d'utilisateur
    cy.get("input#userName").clear();

    // 3. Cliquer sur "Save"
    cy.contains("button", "Save").click();

    // 4. Vérifier qu'un message d'erreur est affiché
    cy.get("input#userName")
      .siblings("p[role='alert']") // Sélecteur corrigé
      .should("be.visible")
      .and("contain.text", "User name is required"); // Message d'erreur corrigé

    // 5. Vérifier que le formulaire est toujours en mode édition
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");

    // 6. Vérifier que le nom d'utilisateur dans l'en-tête n'a pas changé
    if (validUser && validUser.userName) {
      cy.get(".header__nav-item span").should(
        "contain.text",
        validUser.userName,
      );
    }

    // 7. Nettoyage : Annuler pour fermer le formulaire et s'assurer que l'état est propre
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible"); // Confirmer la fermeture du formulaire
  });

  it("devrait afficher une erreur si le nom d'utilisateur dépasse 10 caractères", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }

    const longUserName = "ThisIsTooLong"; // 13 caractères

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Entrer un nom d'utilisateur trop long
    cy.get("input#userName").clear().type(longUserName);

    // 3. Cliquer sur "Save"
    cy.contains("button", "Save").click();

    // 4. Vérifier qu'un message d'erreur est affiché
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and("contain.text", "User name cannot exceed 10 characters");

    // 5. Vérifier que le formulaire est toujours en mode édition
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", longUserName); // Le champ garde la valeur erronée

    // 6. Vérifier que le nom d'utilisateur dans l'en-tête n'a pas changé
    cy.get(".header__nav-item span").should("contain.text", validUser.userName);

    // 7. Nettoyage : Annuler pour fermer le formulaire
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible"); // Confirmer la fermeture
  });

  it("devrait afficher une erreur si le nom d'utilisateur contient des caractères non autorisés", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }

    const invalidCharUserName = "User!Name"; // Modifié pour être < 10 caractères et invalide

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Entrer un nom d'utilisateur avec des caractères non autorisés
    cy.get("input#userName").clear().type(invalidCharUserName);

    // 3. Cliquer sur "Save"
    cy.contains("button", "Save").click();

    // 4. Vérifier qu'un message d'erreur est affiché
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and(
        "contain.text",
        "Only letters, numbers, underscore and hyphen are allowed",
      );

    // 5. Vérifier que le formulaire est toujours en mode édition
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", invalidCharUserName);

    // 6. Vérifier que le nom d'utilisateur dans l'en-tête n'a pas changé
    cy.get(".header__nav-item span").should("contain.text", validUser.userName);

    // 7. Nettoyage : Annuler pour fermer le formulaire
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible"); // Confirmer la fermeture
  });

  it("devrait afficher une erreur si le nom d'utilisateur est sur liste noire", function () {
    const usersData = this.usersData as User[];
    const validUser = usersData.find((user) => user.type === "valid");

    if (!validUser || !validUser.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }

    const blacklistedUserName = "admin";

    // 1. Cliquer sur "Edit User" pour ouvrir le formulaire
    cy.contains("button", "Edit User").click();

    // 2. Entrer un nom d'utilisateur sur liste noire
    cy.get("input#userName").clear().type(blacklistedUserName);

    // 3. Cliquer sur "Save"
    cy.contains("button", "Save").click();

    // 4. Vérifier qu'un message d'erreur est affiché
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and("contain.text", "Username contains inappropriate words or terms");

    // 5. Vérifier que le formulaire est toujours en mode édition
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", blacklistedUserName);

    // 6. Vérifier que le nom d'utilisateur dans l'en-tête n'a pas changé
    cy.get(".header__nav-item span").should("contain.text", validUser.userName);

    // 7. Nettoyage : Annuler pour fermer le formulaire
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible"); // Confirmer la fermeture
  });

  it("devrait être accessible sur la page de profil utilisateur", function () {
    // Injecter axe-core et tester l'accessibilité dédié pour la page de profil (ignorer les violations de contraste connues)
    cy.injectAxe();
    cy.checkA11y();

    // Tester l'accessibilité du bouton Edit User
    cy.contains("button", "Edit User").focus();
    cy.checkA11y();

    // Ouvrir le formulaire d'édition et tester son accessibilité
    cy.contains("button", "Edit User").click();
    cy.checkA11y();

    // Tester l'accessibilité des champs de saisie
    cy.get("input#userName").focus();
    cy.checkA11y();

    // Tester l'accessibilité des boutons Save/Cancel
    cy.contains("button", "Save").focus();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    cy.contains("button", "Cancel").focus();
    cy.checkA11y(undefined, {
      rules: {
        "color-contrast": { enabled: false },
      },
    });

    // Fermer le formulaire
    cy.contains("button", "Cancel").click();
  });
});
