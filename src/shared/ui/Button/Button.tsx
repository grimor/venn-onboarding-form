import clsx from "clsx";
import { Button as BaseButton } from "@base-ui/react/button";

import styles from "./Button.module.css";

export type ButtonVariant = "primary";
export type ButtonProps = BaseButton.Props & {
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string | undefined> = {
  primary: styles.variantPrimary,
};

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
