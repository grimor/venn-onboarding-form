import clsx from "clsx";
import { Button as BaseButton } from "@base-ui/react/button";

import styles from "./Button.module.css";

export type ButtonVariant = "primary";
/** Properties of the button. Also accepts all Base UI `Button` properties. */
export type ButtonProps = BaseButton.Props & {
  /** The visual type of the button. */
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string | undefined> = {
  primary: styles.variantPrimary,
};

/** A button. The user clicks it to start an action. */
export function Button({
  children,
  variant = "primary",
  ...rest
}: ButtonProps) {
  return (
    <BaseButton
      className={clsx(styles.Button, variantClass[variant])}
      {...rest}
    >
      {children}
    </BaseButton>
  );
}
