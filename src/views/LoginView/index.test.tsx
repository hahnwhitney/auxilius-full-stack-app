// Remove import for reactRouter, use top-level mock
import { render, screen, fireEvent, act } from "@testing-library/react";
import LoginScreen from "./index";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
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
    ...props
  }: {
    label: string;
    validationErrorMsg?: string;
    value?: string;
    onChange?: (v: string) => void;
  } & React.InputHTMLAttributes<HTMLInputElement>) => {
    return (
      <div>
        <label htmlFor={props.id}>{label}</label>
        <input
          id={props.id}
          value={value || ""}
          onChange={(e) => {
            if (onChange) onChange(e.target.value);
          }}
          {...props}
        />
        {validationErrorMsg && <span>{validationErrorMsg}</span>}
      </div>
    );
  },
}));

const setIsAuthenticated = jest.fn();
const setCurrentUsername = jest.fn();
jest.mock("../../providers/auth/use-auth", () => () => ({
  setIsAuthenticated,
  setCurrentUsername,
}));

describe("LoginScreen", () => {
  beforeEach(() => {
    setIsAuthenticated.mockClear();
    setCurrentUsername.mockClear();
  });

  it("renders login form and input", () => {
    render(<LoginScreen />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows error if username is empty and does not authenticate", () => {
    render(<LoginScreen />);
    const loginBtn = screen.getByRole("button", { name: /log in/i });
    act(() => {
      fireEvent.click(loginBtn);
    });
    expect(screen.queryByText("Username is required")).not.toBeNull();
    expect(setIsAuthenticated).not.toHaveBeenCalled();
    expect(setCurrentUsername).not.toHaveBeenCalled();
  });

  it("authenticates and redirects on valid username", () => {
    const navigateMock = jest.fn();
    jest
      .mocked(jest.requireMock("react-router").useNavigate)
      .mockReturnValue(navigateMock);
    render(<LoginScreen />);
    const input = screen.getByLabelText("Username");
    act(() => {
      fireEvent.change(input, { target: { value: "whitney" } });
      const loginBtn = screen.getByRole("button", { name: /log in/i });
      fireEvent.click(loginBtn);
    });
    expect(setCurrentUsername).toHaveBeenCalledWith("whitney");
    expect(setIsAuthenticated).toHaveBeenCalledWith(true);
    expect(navigateMock).toHaveBeenCalledWith("/taskboard");
  });

  it("clears username input after login", () => {
    render(<LoginScreen />);
    const input = screen.getByLabelText("Username");
    act(() => {
      fireEvent.change(input, { target: { value: "whitney" } });
      const loginBtn = screen.getByRole("button", { name: /log in/i });
      fireEvent.click(loginBtn);
    });
    expect(input).toHaveValue("");
  });
});
