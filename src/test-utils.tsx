import type React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// The authors of React Testing Library recommend using a setup function when
// rendering a component, and discourage rendering or using any userEvent functions
// outside of the test itself.
// See https://testing-library.com/docs/user-event/intro/#writing-tests-with-userevent
// and https://kentcdodds.com/blog/avoid-nesting-when-youre-testing for more information.

export const setup = (jsx: React.ReactElement) => {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
};

export {
  act,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "@testing-library/react";
export { axe, toHaveNoViolations } from "jest-axe";
