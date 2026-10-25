import type { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./CardContent.module.css";

export type CardContentProps = ComponentProps<"div">;

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
