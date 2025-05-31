/** @format */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";

// Mock externals
vi.mock("jsonwebtoken", () => {
  // Définir la classe d'erreur mockée directement à l'intérieur de la factory
  class MockJsonWebTokenErrorInternal extends Error {
    constructor(message) {
      super(message);
      this.name = "JsonWebTokenError";
    }
  }
  return {
    default: {
      verify: vi.fn(),
      JsonWebTokenError: MockJsonWebTokenErrorInternal, // Exposer la classe mockée
    },
  };
});

vi.mock("../../../api/lib/prisma.js", () => ({
  // MODIFIÉ: chemin vers api/lib/
  prisma: {
    account: {
      findMany: vi.fn(),
    },
  },
}));

// Import SUT (System Under Test) and mocked dependencies
import jwt from "jsonwebtoken"; // jwt sera la version mockée
import { prisma } from "../../../api/lib/prisma.js"; // MODIFIÉ: chemin vers api/lib/

describe("Accounts API Handler", () => {
  let req;
  let res;
  let consoleErrorSpy;
  let handlerInstance;

  const TEST_JWT_SECRET = "test_secret_for_accounts";

  beforeAll(async () => {
    vi.stubEnv("JWT_SECRET", TEST_JWT_SECRET);
    const module = await import("../../../api/accounts/index.js"); // Chemin vers le handler
    handlerInstance = module.default;
  });

  beforeEach(() => {
    vi.resetAllMocks();

    req = {
      method: "GET",
      headers: {
        authorization: "Bearer valid-token",
      },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn(),
      end: vi.fn(),
    };
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    jwt.verify.mockReturnValue({ id: "user-123" }); // CORRIGÉ: Accès direct à jwt.verify
    prisma.account.findMany.mockResolvedValue([
      {
        id: "acc1",
        accountNumber: "1234",
        balance: 1000,
        type: "Checking",
        userId: "user-123",
      },
    ]);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  it("should return 405 if method is not GET", async () => {
    req.method = "POST";
    await handlerInstance(req, res);
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ message: "Method Not Allowed" });
  });

  it("should return 401 if Authorization header is missing", async () => {
    delete req.headers.authorization;
    await handlerInstance(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authorization header missing or invalid",
    });
  });

  it("should return 401 if JWT verification fails", async () => {
    jwt.verify.mockImplementation(() => {
      // CORRIGÉ: Accès direct à jwt.verify
      throw new jwt.JsonWebTokenError("Invalid token"); // CORRIGÉ: Utiliser jwt.JsonWebTokenError
    });
    await handlerInstance(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
    });
  });

  it("should return accounts for a valid user", async () => {
    await handlerInstance(req, res);
    expect(jwt.verify).toHaveBeenCalledWith("valid-token", TEST_JWT_SECRET); // CORRIGÉ: Accès direct à jwt.verify
    expect(prisma.account.findMany).toHaveBeenCalledWith({
      where: { userId: "user-123" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      body: [
        {
          id: "acc1",
          accountNumber: "1234",
          balance: 1000,
          type: "Checking",
          userId: "user-123",
        },
      ],
    });
  });

  it("should return 500 if Prisma query fails", async () => {
    prisma.account.findMany.mockRejectedValue(new Error("DB error"));
    await handlerInstance(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Internal server error while fetching accounts",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching accounts:",
      expect.any(Error),
    );
  });
});
