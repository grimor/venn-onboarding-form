// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormError } from "./FormError";

afterEach(() => {
  cleanup();
});

describe("FormError", () => {
  it("announces the message as an alert", () => {
    render(<FormError>Something went wrong</FormError>);

    expect(screen.getByRole("alert").textContent).toBe("Something went wrong");
  });

  it("renders nothing without a message", () => {
    const { container } = render(<FormError>{undefined}</FormError>);

    expect(container.innerHTML).toBe("");
  });
});
