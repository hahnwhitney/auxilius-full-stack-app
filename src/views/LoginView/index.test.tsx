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

  it("renders login form, heading, input, and sign-up link", () => {
    render(<LoginView />);
    expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByText("Create an Account")).toBeInTheDocument();
  });

  it("shows error if username is empty and does not authenticate", async () => {
    render(<LoginView />);
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginBtn);
    await waitFor(() => {
      expect(screen.queryByText("Username is required")).not.toBeNull();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setCurrentUsername).not.toHaveBeenCalled();
  });

  it("shows error if fetch fails", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValue(new Error("fail"));
    render(<LoginView />);
    const input = screen.getByLabelText("Username");
    fireEvent.change(input, { target: { value: "whitney" } });
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginBtn);
    await waitFor(() => {
      expect(screen.queryByText("Unable to verify username")).not.toBeNull();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("shows error when username not found", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    render(<LoginView />);
    const input = screen.getByLabelText("Username");
    fireEvent.change(input, { target: { value: "unknown" } });
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginBtn);
    await waitFor(() => {
      expect(screen.queryByText("Username not found")).not.toBeNull();
    });
    expect(setIsAuthenticated).not.toHaveBeenCalled();
  });

  it("authenticates and redirects on valid username", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    const navigateMock = jest.fn();
    jest
      .mocked(jest.requireMock("react-router").useNavigate)
      .mockReturnValue(navigateMock);
    render(<LoginView />);
    const input = screen.getByLabelText("Username");
    fireEvent.change(input, { target: { value: "whitney" } });
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginBtn);
    await waitFor(() => {
      expect(setCurrentUsername).toHaveBeenCalledWith("whitney");
    });
    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(navigateMock).toHaveBeenCalledWith("/taskboard");
  });

  it("clears username input after login", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValue({ ok: true });
    render(<LoginView />);
    const input = screen.getByLabelText("Username");
    fireEvent.change(input, { target: { value: "whitney" } });
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    fireEvent.click(loginBtn);
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
