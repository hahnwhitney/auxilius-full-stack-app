import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateUserView from "./index";

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

describe("CreateUserView", () => {
  beforeEach(() => {
    setIsAuthenticated.mockClear();
    setCurrentUsername.mockClear();
    (globalThis.fetch as jest.Mock) = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders heading, all three inputs, submit button, and login link", () => {
    render(<CreateUserView />);
    expect(screen.getByText("Create an account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("shows error if username is empty", async () => {
    render(<CreateUserView />);
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText("Username is required")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error if password is too short", async () => {
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "short" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "short" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(
        screen.getByText("Password must be at least 8 characters"),
      ).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error if passwords do not match", async () => {
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "different123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error when username is already taken (409)", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 409 });
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText("Username already taken")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error when fetch throws", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error("network error"));
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(screen.getByText("Unable to create user")).toBeInTheDocument();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("POSTs username and password to /api/users", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "whitney", password: "password123" }),
      });
    });
  });

  it("authenticates and redirects after successful sign-up", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const navigateMock = jest.fn();
    jest
      .mocked(jest.requireMock("react-router").useNavigate)
      .mockReturnValue(navigateMock);
    render(<CreateUserView />);
    fireEvent.change(screen.getByLabelText("Username"), {
      target: { value: "whitney" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(setCurrentUsername).toHaveBeenCalledWith("whitney");
      expect(setIsAuthenticated).toHaveBeenCalledWith(true);
      expect(navigateMock).toHaveBeenCalledWith("/taskboard");
    });
  });

  it("clears inputs after successful sign-up", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<CreateUserView />);
    const usernameInput = screen.getByLabelText("Username");
    const passwordInput = screen.getByLabelText("Password");
    const confirmInput = screen.getByLabelText("Confirm Password");
    fireEvent.change(usernameInput, { target: { value: "whitney" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmInput, { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => {
      expect(usernameInput).toHaveValue("");
      expect(passwordInput).toHaveValue("");
      expect(confirmInput).toHaveValue("");
    });
  });
});
