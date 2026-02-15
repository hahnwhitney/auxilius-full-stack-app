import { axe, render, screen, setup } from "../../test-utils";
import Button from "./index";

const buttonText = "test button";
const onClick = jest.fn();

describe("Button", () => {
  it("is enabled by default", () => {
    render(<Button text={buttonText} onClick={onClick} />);
    expect(screen.getByRole("button", { name: buttonText })).toBeEnabled();
  });

  it("is disabled when the disabled prop is passed in", () => {
    render(<Button text={buttonText} onClick={onClick} disabled />);
    expect(screen.getByRole("button", { name: buttonText })).toBeDisabled();
  });

  it("fires the click handler when clicked", async () => {
    const { user } = setup(<Button text={buttonText} onClick={onClick} />);

    const btn = screen.getByRole("button", { name: buttonText });

    expect(btn).toBeVisible();

    await user.click(btn);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders the button text", () => {
    render(<Button text={buttonText} onClick={onClick} />);
    expect(screen.getByRole("button", { name: buttonText })).toBeVisible();
  });

  it("defaults to primary variant if no variant is provided", () => {
    render(<Button text={buttonText} onClick={onClick} />);
    expect(screen.getByRole("button", { name: buttonText })).toHaveClass(
      "primary",
    );
  });

  it("assigns the correct variant when provided", () => {
    render(<Button text={buttonText} onClick={onClick} appearance="primary" />);
    expect(screen.getByRole("button", { name: buttonText })).toHaveClass(
      "primary",
    );
  });

  it("assigns an optional classname when provided", () => {
    render(
      <Button text={buttonText} onClick={onClick} className="testclass" />,
    );

    expect(screen.getByRole("button", { name: buttonText })).toHaveClass(
      "testclass",
    );
  });

  it("does not assign a classname when provided an empty string", () => {
    render(<Button text={buttonText} onClick={onClick} className="" />);
    // "button' classname is always present and 'primary' classname is the default variant;
    // this test ensures that we do not accidentally assign a classname like "undefined"
    expect(
      screen.getByRole("button", { name: buttonText }).classList.length,
    ).toBe(2);
  });

  it("is accessible", async () => {
    const { container } = render(
      <Button text={buttonText} onClick={onClick} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
