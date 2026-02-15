declare module "jest-axe" {
  import type { AxeResults } from "axe-core";

  export function axe(html: Element | string): Promise<AxeResults>;

  export const toHaveNoViolations: {
    toHaveNoViolations(results: AxeResults): { pass: boolean; message(): string };
  };
}

declare namespace jest {
  interface Matchers<R> {
    toHaveNoViolations(): R;
  }
}
