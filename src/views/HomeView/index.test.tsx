import { render, screen } from "@testing-library/react";
import HomeView from "./index";

jest.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
}));

describe("HomeView", () => {
  it("renders heading, login link, and sign up link", () => {
    render(<HomeView />);
    expect(screen.getByText("Hello, future coworkers!")).toBeInTheDocument();

    const loginLink = screen.getByTestId("link-/login");
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
    expect(loginLink.textContent).toBe("Login");

    const signUpLink = screen.getByTestId("link-/signup");
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute("href", "/signup");
    expect(signUpLink.textContent).toBe("Sign Up");
  });

  it("applies landingWrapper class to root div", () => {
    render(<HomeView />);
    const root = screen.getByText("Hello, future coworkers!").closest("div");
    // The class is applied via CSS module, so check for the substring
    expect(root?.className).toEqual(expect.stringContaining("landingWrapper"));
  });
});
