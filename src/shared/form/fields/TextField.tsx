import type { ReactNode } from "react";
import { Field } from "@base-ui/react";

import { Input, type InputProps } from "../../ui/Input";
import { Text } from "../../ui/Text";
import { FormError } from "../components";
import { useFieldContext } from "../formContext";
import { getErrorMessages } from "../utils/getErrorMessages";

import styles from "./TextField.module.css";

type TextFieldProps = Omit<
  InputProps,
  "name" | "value" | "defaultValue" | "onValueChange"
> & {
  label: ReactNode;
  description?: ReactNode;
  validatingLabel?: ReactNode;
  /**
   * Transforms the raw input value before it is stored in the field,
   * e.g. to strip disallowed characters.
   */
  parseValue?: (value: string) => string;
};

export function TextField({
  label,
  description,
  validatingLabel = "Validating…",
  parseValue,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const { isValidating } = field.state.meta;

  // Hide errors from the previous run
  const errors = isValidating ? [] : getErrorMessages(field.state.meta.errors);

  return (
    <Field.Root className={styles.Field} invalid={errors.length > 0}>
      <Field.Label className={styles.Label}>
        <Text as="span" size="sm">
          {label}
        </Text>
      </Field.Label>
      <Input
        {...inputProps}
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(parseValue ? parseValue(value) : value);
        }}
        onBlur={(event) => {
          field.handleBlur();
          onBlur?.(event);
        }}
        aria-busy={isValidating || undefined}
      />

      <div className={styles.Status} role="status" aria-live="polite">
        {isValidating && (
          <Text size="xs" color="muted" className={styles.Validating}>
            <span className={styles.Spinner} aria-hidden="true" />
            {validatingLabel}
          </Text>
        )}
      </div>

      <Field.Error className={styles.Error} match={errors.length > 0}>
        {errors.map((message) => (
          <FormError key={message}>{message}</FormError>
        ))}
      </Field.Error>

      {description && <Field.Description>{description}</Field.Description>}
    </Field.Root>
  );
}
