import type { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./CardHeader.module.css";

/** Properties of the card header. Accepts all `div` properties. */
export type CardHeaderProps = ComponentProps<"div">;

/** The top part of a card. Put the title of the card in it. */
export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx(styles.Header, className)} {...props}>
      {children}
    </div>
  );
}
