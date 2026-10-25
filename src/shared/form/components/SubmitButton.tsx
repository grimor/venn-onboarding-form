import type { PropsWithChildren, ReactNode } from "react";
import { useSelector } from "@tanstack/react-form";
import { Button, type ButtonProps } from "../../ui/Button";
import { useFormContext } from "../formContext";

type SubmitButtonProps = Omit<ButtonProps, "type"> & {
  pendingLabel?: ReactNode;
  isSubmitting?: boolean;
} & PropsWithChildren;

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
