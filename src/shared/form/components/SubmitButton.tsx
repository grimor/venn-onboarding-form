import type { PropsWithChildren, ReactNode } from "react";
import { useSelector } from "@tanstack/react-form";
import { Button, type ButtonProps } from "../../ui/Button";
import { useFormContext } from "../formContext";

/** Properties of the submit button. Also accepts all `Button` properties, but not `type`. */
type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  /** The label that shows while the form submits. */
  pendingLabel?: ReactNode;
  /** If set, the button uses this value and not the submit state of the form. */
  isSubmitting?: boolean;
} & PropsWithChildren;

/**
 * A button that submits the form. While the form submits, the button is
 * disabled and shows `pendingLabel`. Use it in `form.AppForm`.
 */
export function SubmitButton({
  children = "Submit",
  pendingLabel = "Submitting…",
  disabled,
  isSubmitting: isSubmittingOverride,
  ...props
}: SubmitButtonProps) {
  const form = useFormContext();
  const isFormSubmitting = useSelector(
    form.store,
    (state) => state.isSubmitting,
  );
  const isSubmitting = isSubmittingOverride ?? isFormSubmitting;

  return (
    <Button
      {...props}
      type="submit"
      disabled={disabled ?? isSubmitting}
      focusableWhenDisabled
      aria-busy={isSubmitting || undefined}
    >
      {isSubmitting ? pendingLabel : children}
    </Button>
  );
}
