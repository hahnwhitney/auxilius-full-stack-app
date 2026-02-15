import { toHaveNoViolations } from "jest-axe";
import "@testing-library/jest-dom";
// import fetchMock from 'jest-fetch-mock';

// In the future, we may want to mock libraries like analytics or event reporters,
// third-party tools like BugSnag, etc.

// We can also mock things like the browser window's scroll and scrollTo methods,
// Fetch API, or use libraries like react-intersection-observer (a React implementation
// of the Intersection Observer API) to test when an element enters or leaves the viewport.

// fetchMock.enableMocks();

// Ensure every test contains at least one expect()
beforeEach(() => {
  expect.hasAssertions();
});

// Add the custom toHaveNoViolations matcher from jest-axe using Jest's expect.extend syntax;
// we do this here so that we don't need to extend Jest in each individual accessibilty test file.
// See https://jestjs.io/docs/expect#expectextendmatchers
expect.extend(toHaveNoViolations);
