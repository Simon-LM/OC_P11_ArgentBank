/** @format */

// Import de l'interface User commune
import type { User } from "../../support/types";

describe("Gestion de Profil Utilisateur", () => {
  let validUser: User | undefined;

  before(function () {
    cy.fixture<User[]>("users.json").then((usersData) => {
      this.usersData = usersData;
      validUser = usersData.find((user) => user.type === "valid");
      if (
        !validUser ||
        !validUser.email ||
        !validUser.password ||
        !validUser.userName
      ) {
        throw new Error(
          "Fixture users.json: utilisateur valide incomplet ou manquant",
        );
      }
    });
  });

  beforeEach(function () {
    cy.intercept("POST", "/api/user/login").as("loginRequest");
    cy.intercept("GET", "/api/user/profile").as("profileRequest");
    cy.intercept("GET", "/api/accounts").as("accountsRequest");
    cy.intercept("GET", "/api/transactions/search*").as(
      "searchTransactionsRequest",
    );
    cy.wait(2000);
    cy.session("validUserSession", () => {
      cy.visitWithBypass("/signin");
      cy.url().should("include", "/signin");
      cy.get("input#email")
        .should("be.visible")
        .type(validUser!.email as string);
      cy.get("input#password").type(validUser!.password as string);
      cy.get("form").contains("button", "Connect").click();
      cy.wait("@loginRequest").then((interception) => {
        const status = interception.response?.statusCode;
        if (status !== 200) {
          throw new Error(`[LOGIN ERROR] Login API returned status ${status}`);
        }
        const token =
          interception.response?.body?.body?.token ||
          interception.response?.body?.token;
        if (
          !token ||
          typeof token !== "string" ||
          !/^([\w-]+\.){2}[\w-]+$/.test(token)
        ) {
          throw new Error(
            `[LOGIN ERROR] Token JWT manquant ou malformé: ${token}`,
          );
        }
      });
      cy.url({ timeout: 20000 }).should("include", "/user");
      cy.get(".header__nav-item")
        .contains(validUser!.userName as string)
        .should("be.visible");
      cy.window().then((win) => {
        const authToken = win.sessionStorage.getItem("authToken");
        // Correction : expression attendue
        void expect(authToken, "authToken in sessionStorage").to.be.a("string")
          .and.not.be.empty;
        const isJwt = /^([\w-]+\.){2}[\w-]+$/.test(authToken || "");
        assert.isTrue(
          isJwt,
          `[LOGIN ERROR] authToken in sessionStorage is not un JWT: ${authToken}`,
        );
      });
    });
    cy.visit("/user");
    cy.url().should("include", "/user");
    cy.get(".header__nav-item")
      .contains(validUser!.userName as string)
      .should("be.visible");
  });

  it("devrait afficher correctement les informations de l'utilisateur sur la page de profil", function () {
    cy.injectAxe();
    cy.checkA11y();
    const user = validUser!;
    // La page /User est celle où le profil est affiché ou modifiable
    cy.contains("h2", "Welcome back").should("be.visible");
    cy.contains("button", "Edit User").should("be.visible");
    cy.contains("button", "Edit User").click();
    cy.checkA11y();
    if (user.userName) {
      cy.get("input#userName").should("have.value", user.userName);
    } else {
      cy.get("input#userName").should("have.value", "");
    }
    if (user.firstName) {
      cy.get("input#firstName")
        .should("have.value", user.firstName)
        .and("have.attr", "readonly");
    } else {
      cy.get("input#firstName")
        .should("have.value", "")
        .and("have.attr", "readonly");
    }
    if (user.lastName) {
      cy.get("input#lastName")
        .should("have.value", user.lastName)
        .and("have.attr", "readonly");
    } else {
      cy.get("input#lastName")
        .should("have.value", "")
        .and("have.attr", "readonly");
    }
  });

  it("devrait permettre à un utilisateur de modifier son nom d'utilisateur avec succès", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de modification.",
      );
    }
    const originalUserName = user.userName;
    const newUserName = "IronMan76";
    if (originalUserName === newUserName) {
      throw new Error(
        "Le nouveau nom d'utilisateur doit être différent de l'original pour ce test.",
      );
    }
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(newUserName);
    cy.contains("button", "Save").click();
    cy.contains("button", "Edit User").should("be.visible");
    cy.get(".header__nav-item span").should("contain.text", newUserName);
    cy.log("Réinitialisation du nom d'utilisateur à sa valeur d'origine.");
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(originalUserName);
    cy.contains("button", "Save").click();
    cy.contains("button", "Edit User").should("be.visible");
    cy.get(".header__nav-item span").should("contain.text", originalUserName);
    cy.log("Nom d'utilisateur réinitialisé.");
  });

  it("devrait annuler la modification du nom d'utilisateur", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test d'annulation.",
      );
    }
    const originalUserName = user.userName;
    const tempUserName = "TempUserName123";
    if (originalUserName === tempUserName) {
      throw new Error(
        "Le nom d'utilisateur temporaire doit être différent de l'original pour ce test.",
      );
    }
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(tempUserName);
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible");
    cy.contains("button", "Save").should("not.exist");
    cy.contains("button", "Cancel").should("not.exist");
    cy.get(".header__nav-item span").should("contain.text", originalUserName);
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").should("have.value", originalUserName);
    cy.contains("button", "Cancel").click();
  });

  it("devrait afficher une erreur si le nom d'utilisateur est soumis vide", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear();
    cy.contains("button", "Save").click();
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and("contain.text", "User name is required");
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get(".header__nav-item span").should("contain.text", user.userName);
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible");
  });

  it("devrait afficher une erreur si le nom d'utilisateur dépasse 10 caractères", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }
    const longUserName = "ThisIsTooLong";
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(longUserName);
    cy.contains("button", "Save").click();
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and("contain.text", "User name cannot exceed 10 characters");
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", longUserName);
    cy.get(".header__nav-item span").should("contain.text", user.userName);
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible");
  });

  it("devrait afficher une erreur si le nom d'utilisateur contient des caractères non autorisés", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }
    const invalidCharUserName = "User!Name";
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(invalidCharUserName);
    cy.contains("button", "Save").click();
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and(
        "contain.text",
        "Only letters, numbers, underscore and hyphen are allowed",
      );
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", invalidCharUserName);
    cy.get(".header__nav-item span").should("contain.text", user.userName);
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible");
  });

  it("devrait afficher une erreur si le nom d'utilisateur est sur liste noire", function () {
    const user = validUser!;
    if (!user.userName) {
      throw new Error(
        "Utilisateur valide ou nom d'utilisateur original non trouvé pour le test de validation.",
      );
    }
    const blacklistedUserName = "admin";
    cy.contains("button", "Edit User").click();
    cy.get("input#userName").clear().type(blacklistedUserName);
    cy.contains("button", "Save").click();
    cy.get("input#userName")
      .siblings("p[role='alert']")
      .should("be.visible")
      .and("contain.text", "Username contains inappropriate words or terms");
    cy.contains("button", "Save").should("be.visible");
    cy.get("input#userName").should("be.visible");
    cy.get("input#userName").should("have.value", blacklistedUserName);
    cy.get(".header__nav-item span").should("contain.text", user.userName);
    cy.contains("button", "Cancel").click();
    cy.contains("button", "Edit User").should("be.visible");
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
