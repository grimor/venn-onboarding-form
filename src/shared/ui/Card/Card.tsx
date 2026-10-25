import type { ComponentProps, PropsWithChildren } from "react";
import clsx from "clsx";

import styles from "./Card.module.css";

export type CardProps = ComponentProps<"div">;

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
