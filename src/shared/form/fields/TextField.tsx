import type { ReactNode } from "react";
import { Field } from "@base-ui/react";

import { Input, type InputProps } from "../../ui/Input";
import { Text } from "../../ui/Text";
import { useFieldContext } from "../formContext";
import { getErrorMessages } from "../utils/getErrorMessages";

import styles from "./TextField.module.css";

type TextFieldProps = Omit<
  InputProps,
  "name" | "value" | "defaultValue" | "onValueChange"
> & {
  label: ReactNode;
  description?: ReactNode;
};

export function TextField({
  label,
  description,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = getErrorMessages(field.state.meta.errors);

  return (
    <Field.Root className={styles.Field}>
      <Field.Label className={styles.Label}>{label}</Field.Label>
      <Input
        {...inputProps}
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value);
        }}
        onBlur={(event) => {
          field.handleBlur();
          onBlur?.(event);
        }}
        aria-busy={field.state.meta.isValidating || undefined}
      />

      <Field.Error className={styles.Error} match={errors.length > 0}>
        {errors.map((message) => (
          <Text key={message}>{message}</Text>
        ))}
      </Field.Error>

      {description && <Field.Description>{description}</Field.Description>}
    </Field.Root>
  );
}
