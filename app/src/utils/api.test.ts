/** @format */

import { describe, expect, it } from "vitest";
import { buildApiUrl } from "./api";

describe("buildApiUrl", () => {
  it("normalizes paths without a leading slash", () => {
    expect(buildApiUrl("user/profile")).toBe("/api/user/profile");
  });

  it("keeps paths with an existing leading slash", () => {
    expect(buildApiUrl("/accounts")).toBe("/api/accounts");
  });
});
