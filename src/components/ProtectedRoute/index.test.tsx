import { render } from "@testing-library/react";
import ProtectedRoute from "./index";
import Header from "../Header";
import { MemoryRouter } from "react-router";
import useAuth from "../../providers/auth/use-auth";

jest.mock("../Header", () => jest.fn(() => <div data-testid="header" />));
jest.mock("../../providers/auth/use-auth", () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

const useAuthMock = useAuth as jest.Mock;
const HeaderMock = Header as jest.Mock;

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /login if not authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      setIsAuthenticated: jest.fn(),
      currentUsername: "",
      setCurrentUsername: jest.fn(),
    });
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );
    // Should render Navigate component (no appContainer)
    expect(container.querySelector(".appContainer")).toBeNull();
  });

  it("renders Header and children when authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      setIsAuthenticated: jest.fn(),
      currentUsername: "testuser",
      setCurrentUsername: jest.fn(),
    });
    const { getByTestId, container } = render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );
    expect(getByTestId("header")).toBeInTheDocument();
    expect(container.querySelector(".appContainer")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();
    expect(container.textContent).toContain("Auxilius Take-Home Exercise");
    expect(container.textContent).toContain("Whitney Hahn");
  });

  it("calls logOut and updates state", () => {
    const setIsAuthenticated = jest.fn();
    const setCurrentUsername = jest.fn();
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      setIsAuthenticated,
      currentUsername: "testuser",
      setCurrentUsername,
    });
    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>
    );
    // Simulate logOut via Header prop
    const headerInstance = HeaderMock.mock.calls[0][0];
    headerInstance.logOutFn();
    expect(setCurrentUsername).toHaveBeenCalledWith("");
    expect(setIsAuthenticated).toHaveBeenCalledWith(false);
  });
});
