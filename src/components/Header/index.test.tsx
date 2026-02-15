import { axe, render, screen, setup } from "../../test-utils";
import Header from "./index";

const username = "take-home@customer.io";
const handleLogoutClick = jest.fn();

const mockHeader = (
  <Header currentUsername={username} logOutFn={handleLogoutClick} />
);

describe("Header", () => {
  it("renders the username of the currently logged in user", () => {
    render(mockHeader);
    expect(screen.getByText(username)).toBeVisible();
  });

  it("renders a log out button", () => {
    render(mockHeader);
    expect(screen.getByRole("button", { name: "Log Out" })).toBeVisible();
  });

  it("logs out the user when the log out button is clicked", async () => {
    const { user } = setup(mockHeader);
    const logOutBtn = screen.getByRole("button", { name: "Log Out" });
    expect(logOutBtn).toBeVisible();

    await user.click(logOutBtn);
    expect(handleLogoutClick).toHaveBeenCalledTimes(1);
  });

  it("is accessible", async () => {
    const { container } = render(mockHeader);
    expect(await axe(container)).toHaveNoViolations();
  });
});
