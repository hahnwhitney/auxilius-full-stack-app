import { renderHook } from "@testing-library/react";
import useAuth from "./use-auth";
import { AuthProvider } from "./auth-provider";

describe("useAuth", () => {
  it("throws error if used outside AuthProvider", () => {
    // Suppress error output for this test
    const originalError = console.error;
    console.error = jest.fn();
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );
    console.error = originalError;
  });

  it("returns context values when used inside AuthProvider", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });
    expect(result.current).toHaveProperty("isAuthenticated");
    expect(result.current).toHaveProperty("setIsAuthenticated");
    expect(result.current).toHaveProperty("currentUsername");
    expect(result.current).toHaveProperty("setCurrentUsername");
  });
});
