import type { ReactNode } from "react";

import { Text } from "../../ui/Text";

type FormErrorProps = {
  /** The error message. If it is empty, nothing shows. */
  children?: ReactNode;
};

/** Shows an error message of the form in the error color. */
export function FormError({ children }: FormErrorProps) {
  if (!children) return null;

  return (
    <Text role="alert" color="error" size="sm">
      {children}
    </Text>
  );
}
