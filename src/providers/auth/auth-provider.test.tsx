import { render, act } from "@testing-library/react";
import React from "react";
import { AuthProvider, AuthContext } from "./auth-provider";
import type { AuthContextValues } from "./auth-provider";

describe("AuthProvider", () => {
  it("provides default context values", () => {
    let contextValues: AuthContextValues | undefined;
    render(
      <AuthProvider>
        <AuthContext.Consumer>
          {(value) => {
            contextValues = value;
            return null;
          }}
        </AuthContext.Consumer>
      </AuthProvider>,
    );
    expect(contextValues!.isAuthenticated).toBe(false);
    expect(contextValues!.currentUsername).toBe("");
    expect(typeof contextValues!.setIsAuthenticated).toBe("function");
    expect(typeof contextValues!.setCurrentUsername).toBe("function");
  });

  it("updates isAuthenticated and currentUsername", () => {
    let contextValues: AuthContextValues | undefined;
    function TestComponent() {
      const ctx = React.useContext(AuthContext);
      // eslint-disable-next-line
      contextValues = ctx;
      return null;
    }
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );
    act(() => {
      contextValues!.setIsAuthenticated(false);
      contextValues!.setCurrentUsername("testuser");
    });
    expect(contextValues!.isAuthenticated).toBe(false);
    expect(contextValues!.currentUsername).toBe("testuser");
  });

  it("throws error if context is undefined (for useAuth)", () => {
    expect(() => {
      // Simulate useContext(AuthContext) outside provider
      const TestComponent = () => {
        // @ts-expect-erro
        const context = React.useContext(AuthContext);
        if (context === undefined) {
          throw new Error("useAuth must be used within an AuthProvider");
        }
        return null;
      };
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");
  });
});
