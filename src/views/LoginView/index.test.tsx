import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginView from "./index";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}));
jest.mock("../../components/Button", () => ({
  __esModule: true,
  default: ({
    text,
    ...props
  }: { text: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{text}</button>
  ),
}));
jest.mock("../../components/Input", () => ({
  __esModule: true,
  default: ({
    label,
    validationErrorMsg,
    value,
    onChange,
    id,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inputValid,
    ...props
  }: {
    label: string;
    validationErrorMsg?: string;
    value?: string;
    onChange?: (v: string) => void;
    id: string;
    inputValid?: boolean;
  } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value || ""}
        onChange={(e) => {
          if (onChange) onChange(e.target.value);
        }}
        {...props}
      />
      {validationErrorMsg && <span>{validationErrorMsg}</span>}
    </div>
  ),
}));

const setIsAuthenticated = jest.fn();
const setCurrentUsername = jest.fn();
jest.mock("../../providers/auth/use-auth", () => () => ({
  setIsAuthenticated,
  setCurrentUsername,
}));

describe("LoginView", () => {
  beforeEach(() => {
    setIsAuthenticated.mockClear();
    setCurrentUsername.mockClear();
    (globalThis.fetch as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders heading, username input, password input, and sign-up link", () => {
    render(<LoginView />);
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
  });

  it("shows error if username is empty", async () => {
    render(<LoginView />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setCurrentUsername).not.toHaveBeenCalled();
  });

  it("shows error if password is empty", async () => {
    render(<LoginView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText("Password is required")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error on invalid credentials", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 401 });
    render(<LoginView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText("Invalid username or password")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error when fetch throws", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error("network error"));
    render(<LoginView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(screen.getByText("Unable to log in")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("POSTs credentials to /api/users/login", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: "whitney", password: "password123" }),
      });
    });
  });

  it("authenticates and redirects on valid credentials", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const navigateMock = jest.fn();
    jest
      .mocked(jest.requireMock("react-router").useNavigate)
      .mockReturnValue(navigateMock);
    render(<LoginView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(setCurrentUsername).toHaveBeenCalledWith("whitney");
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(navigateMock).toHaveBeenCalledWith("/taskboard");
    });
  });

  it("clears inputs after successful login", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginView />);
    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    fireEvent.change(usernameInput, { target: { value: "whitney" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));
    await waitFor(() => {
      expect(usernameInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
    });
  });
});
