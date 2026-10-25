import type { ComponentProps, PropsWithChildren } from "react";
import clsx from "clsx";

import styles from "./Card.module.css";

/** Properties of the card. Accepts all `div` properties. */
export type CardProps = ComponentProps<"div">;

/** The container of a card. Put `Card.Header` and `Card.Content` in it. */
export function CardRoot({
  className,
  children,
  ...props
}: PropsWithChildren<CardProps>) {
  return (
    <div className={clsx(styles.Card, className)} {...props}>
      {children}
    </div>
  );
}
