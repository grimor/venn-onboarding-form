import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./Input.module.css";

/** Properties of the input. Accepts all Base UI `Input` properties. */
export type InputProps = BaseInput.Props;

/** A text field. The user types a value in it. */
export function Input({ className, ...props }: InputProps) {
  return <BaseInput className={clsx(styles.Input, className)} {...props} />;
}
