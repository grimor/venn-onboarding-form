import type { PropsWithChildren } from "react";

import { Text } from "../../ui/Text";

export function FormError({ children }: PropsWithChildren) {
  if (!children) return null;

  return (
    <Text role="alert" color="error">
      {children}
    </Text>
  );
}
