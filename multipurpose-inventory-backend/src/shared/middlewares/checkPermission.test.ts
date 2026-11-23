import { describe, expect, it } from "vitest";
import { getRequiredAction } from "./checkPermission.js";

describe("getRequiredAction", () => {
  it.each([
    ["GET", "/products", "READ"],
    ["POST", "/products", "CREATE"],
    ["PATCH", "/products/123", "UPDATE"],
    ["DELETE", "/products/123", "DELETE"],
    ["POST", "/products/123/stock-in", "STOCK_IN"],
    ["POST", "/prepared-products/123/produce", "STOCK_IN"],
    ["POST", "/products/123/adjust", "STOCK_OUT"],
    ["POST", "/sales/123/pay-due", "UPDATE"],
    ["POST", "/trash/restore/123", "RESTORE"],
    ["PATCH", "/purchases/123/restore", "RESTORE"],
  ] as const)("maps %s %s to %s", (method, path, action) => {
    expect(getRequiredAction({ method, path })).toBe(action);
  });

  it("rejects unrecognized HTTP methods", () => {
    expect(getRequiredAction({ method: "OPTIONS", path: "/products" })).toBeUndefined();
  });
});
