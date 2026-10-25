import type { ComponentProps } from "react";
import clsx from "clsx";

import styles from "./CardHeader.module.css";

export type CardHeaderProps = ComponentProps<"div">;

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={clsx(styles.Header, className)} {...props}>
      {children}
    </div>
  );
}
