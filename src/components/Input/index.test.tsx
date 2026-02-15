import { axe, render, screen } from "../../test-utils";
import Input from "./index";

const labelText = "Email Address";

describe("Input", () => {
  it("renders an input field with the correct attributes", () => {
    render(
      <Input
        label={labelText}
        type="email"
        id="email-input"
        placeholderText={labelText}
      />,
    );

    const input = screen.getByLabelText(labelText);
    expect(screen.getByLabelText(labelText)).toBeVisible();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("id", "email-input");
    expect(input).toHaveAttribute("placeholder", labelText);
  });

  it("displays input errors when they exist", () => {
    const errorMsg = "This email is not valid";

    render(
      <Input
        label={labelText}
        type="email"
        id="email-input"
        placeholderText={labelText}
        value="big@bird"
        inputValid={false}
        validationErrorMsg={errorMsg}
      />,
    );
    expect(screen.getByText(errorMsg)).toBeVisible();
  });

  it("assigns an optional classname when provided", () => {
    const { container } = render(
      <Input
        label={labelText}
        type="email"
        id="email-input"
        placeholderText={labelText}
        className="testclass"
      />,
    );
    expect(container.firstChild).toHaveClass("testclass");
  });

  it("is accessible", async () => {
    const { container } = render(
      <Input
        label={labelText}
        type="email"
        id="email-input"
        placeholderText={labelText}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
