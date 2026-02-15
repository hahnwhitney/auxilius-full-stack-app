import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./providers/auth/auth-provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));
jest.mock("./components/ProtectedRoute", () => {
  const { Outlet } = jest.requireActual("react-router");
  return {
    __esModule: true,
    default: () => <div data-testid="protected-route"><Outlet /></div>,
  };
});
jest.mock("./views/HomeView", () => ({
  __esModule: true,
  default: () => <div data-testid="home-view">Home</div>,
}));
jest.mock("./views/LoginView", () => ({
  __esModule: true,
  default: () => <div data-testid="login-view">Login</div>,
}));
jest.mock("./views/TaskBoardView", () => ({
  __esModule: true,
  default: () => <div data-testid="taskboard-view">TaskBoard</div>,
}));

import { MemoryRouter } from "react-router";

describe("App", () => {
  it("renders HomeView at root route", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("home-view")).toBeInTheDocument();
    expect(screen.queryByTestId("login-view")).toBeNull();
    expect(screen.queryByTestId("taskboard-view")).toBeNull();
  });

  it("renders LoginView at /login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("login-view")).toBeInTheDocument();
    expect(screen.queryByTestId("home-view")).toBeNull();
    expect(screen.queryByTestId("taskboard-view")).toBeNull();
  });

  it("renders TaskBoardView inside ProtectedRoute at /taskboard route", () => {
    render(
      <MemoryRouter initialEntries={["/taskboard"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("protected-route")).toBeInTheDocument();
    expect(screen.getByTestId("taskboard-view")).toBeInTheDocument();
    expect(screen.queryByTestId("home-view")).toBeNull();
    expect(screen.queryByTestId("login-view")).toBeNull();
  });

  it("wraps all routes in AuthProvider", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
  });
});
