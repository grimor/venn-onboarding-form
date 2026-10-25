import type { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./CardContent.module.css";

/** Properties of the card content. Accepts all `div` properties. */
export type CardContentProps = ComponentProps<"div">;

/** The main part of a card. Put the content of the card in it. */
export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={clsx(styles.Content, className)} {...props}>
      {children}
    </div>
  );
}
