// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import z from "zod";

import { useAppForm } from "../useAppForm";

const asyncValidator = vi.fn<() => Promise<string | undefined>>();

beforeEach(() => {
  asyncValidator.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
});

function TextFieldForm({
  onBlur,
  description,
}: {
  onBlur?: () => void;
  description?: string;
}) {
  const form = useAppForm({ defaultValues: { name: "" } });

  return (
    <form.AppField
      name="name"
      validators={{
        onBlur: z.string().min(3, { error: "Too short" }),
        onBlurAsync: () => asyncValidator(),
      }}
    >
      {(field) => (
        <field.TextField
          label="Name"
          validatingLabel="Checking name…"
          description={description}
          onBlur={onBlur}
        />
      )}
    </form.AppField>
  );
}

function renderTextField(props?: Parameters<typeof TextFieldForm>[0]) {
  render(<TextFieldForm {...props} />);
  return userEvent.setup();
}

describe("TextField", () => {
  it("renders a labelled input bound to the field value", async () => {
    const user = renderTextField();

    await user.type(screen.getByLabelText("Name"), "Ada");

    expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe("Ada");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows validation errors on blur and clears them once fixed", async () => {
    const user = renderTextField();
    const input = screen.getByLabelText("Name");

    await user.type(input, "Ad");
    await user.tab();
    expect(screen.getByRole("alert").textContent).toBe("Too short");

    await user.type(input, "a");
    await user.tab();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("marks the input invalid and describes it by the error", async () => {
    const user = renderTextField();
    const input = screen.getByLabelText("Name");

    expect(input.getAttribute("aria-invalid")).toBeNull();

    await user.type(input, "Ad");
    await user.tab();

    const error = screen.getByRole("alert");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toContain(
      error.parentElement?.id,
    );

    await user.type(input, "a");
    await user.tab();
    expect(input.getAttribute("aria-invalid")).toBeNull();
  });

  it("describes the input by its description", () => {
    renderTextField({ description: "Your full name" });

    expect(
      screen.getByRole("textbox", { description: "Your full name" }),
    ).toBeTruthy();
  });

  it("shows the validating label while async validation runs", async () => {
    let finishValidation: ((error: string) => void) | undefined;
    asyncValidator.mockReturnValue(
      new Promise((resolve) => {
        finishValidation = resolve;
      }),
    );
    const user = renderTextField();

    await user.type(screen.getByLabelText("Name"), "Ada");
    await user.tab();

    expect(await screen.findByText("Checking name…")).toBeTruthy();
    expect(screen.getByLabelText("Name").getAttribute("aria-busy")).toBe(
      "true",
    );

    finishValidation?.("Name is taken");

    expect((await screen.findByRole("alert")).textContent).toBe(
      "Name is taken",
    );
    expect(screen.queryByText("Checking name…")).toBeNull();
  });

  it("calls the onBlur prop alongside the field's blur handling", async () => {
    const onBlur = vi.fn();
    const user = renderTextField({ onBlur });

    await user.click(screen.getByLabelText("Name"));
    await user.tab();

    expect(onBlur).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert").textContent).toBe("Too short");
  });
});
