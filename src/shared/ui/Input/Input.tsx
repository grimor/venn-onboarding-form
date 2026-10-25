import { Input as BaseInput } from "@base-ui/react/input";
import clsx from "clsx";
import styles from "./Input.module.css";

export type InputProps = BaseInput.Props;

export function Input({ className, ...props }: InputProps) {
  return <BaseInput className={clsx(styles.Input, className)} {...props} />;
}
