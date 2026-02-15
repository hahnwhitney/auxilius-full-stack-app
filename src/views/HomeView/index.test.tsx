import { render, screen } from "@testing-library/react";
import HomeView from "./index";

jest.mock("react-router", () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => <a href={to} data-testid="link">{children}</a>,
}));

describe("HomeView", () => {
  it("renders landing wrapper, heading, and login link", () => {
    render(<HomeView />);
    expect(screen.getByText("Hello, future coworkers!")).toBeInTheDocument();
    const link = screen.getByTestId("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
    expect(link.textContent).toBe("Login");
  });

  it("applies landingWrapper class to root div", () => {
    render(<HomeView />);
    const root = screen.getByText("Hello, future coworkers!").closest("div");
    expect(root).toHaveClass("landingWrapper");
  });
});
