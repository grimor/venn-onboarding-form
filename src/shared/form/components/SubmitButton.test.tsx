// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAppForm } from "../useAppForm";

afterEach(() => {
  cleanup();
});

function SubmitButtonForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit?: () => Promise<void>;
  isSubmitting?: boolean;
}) {
  const form = useAppForm({ defaultValues: {}, onSubmit });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.SubmitButton isSubmitting={isSubmitting}>Save</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

function renderSubmitButton(props?: Parameters<typeof SubmitButtonForm>[0]) {
  render(<SubmitButtonForm {...props} />);
  return userEvent.setup();
}

describe("SubmitButton", () => {
  it("shows a pending state while the form submits and blocks double submits", async () => {
    let finishSubmit: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishSubmit = resolve;
        }),
    );
    const user = renderSubmitButton({ onSubmit });

    await user.click(screen.getByRole("button", { name: "Save" }));

    const pendingButton = screen.getByRole("button", { name: "Submitting…" });
    expect(pendingButton.getAttribute("aria-busy")).toBe("true");
    expect(pendingButton.getAttribute("aria-disabled")).toBe("true");

    await user.click(pendingButton);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    finishSubmit?.();
    const idleButton = await screen.findByRole("button", { name: "Save" });
    expect(idleButton.getAttribute("aria-busy")).toBeNull();
  });

  it("uses the isSubmitting prop over the form state", () => {
    renderSubmitButton({ isSubmitting: true });

    expect(screen.getByRole("button", { name: "Submitting…" })).toBeTruthy();
  });
});
