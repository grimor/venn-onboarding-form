import type { ComponentPropsWithRef, ElementType, ReactNode } from "react";
import { clsx } from "clsx";
import styles from "./Text.module.css";

interface TextOwnProps<E extends ElementType> {
  /** The HTML element or component that shows the text. */
  as?: E;
  /** The size of the text. */
  size?: TextSize;
  /** The font weight of the text. */
  weight?: TextWeight;
  /** The color of the text. Use `inherit` to get the color of the parent element. */
  color?: TextColor;
  /** If true, the text stays on one line. Text that does not fit ends with "...". */
  truncate?: boolean;
  /** More CSS classes for the element. */
  className?: string;
  /** The content to show. */
  children?: ReactNode;
}

/** Properties of the text. Also accepts all properties of the `as` element. */
export type TextProps<E extends ElementType = "p"> = TextOwnProps<E> &
  Omit<ComponentPropsWithRef<E>, keyof TextOwnProps<E>>;

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl";
export type TextWeight = "regular" | "medium";
export type TextColor = "default" | "muted" | "error" | "inherit";

const sizeClass: Record<TextSize, string | undefined> = {
  xs: styles.sizeXs,
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

const weightClass: Record<TextWeight, string | undefined> = {
  regular: styles.weightRegular,
  medium: styles.weightMedium,
};

const colorClass: Record<TextColor, string | undefined> = {
  default: styles.colorDefault,
  muted: styles.colorMuted,
  error: styles.colorError,
  inherit: styles.colorInherit,
};

/** Shows text with a standard style. Use `as` to change the HTML element. */
export function Text<E extends ElementType = "p">({
  as,
  size = "md",
  weight = "regular",
  color = "default",
  truncate = false,
  className,
  ...props
}: TextProps<E>) {
  const Component: ElementType = as ?? "p";

  return (
    <Component
      className={clsx(
        styles.text,
        sizeClass[size],
        weightClass[weight],
        colorClass[color],
        truncate && styles.truncate,
        className,
      )}
      {...props}
    />
  );
}
