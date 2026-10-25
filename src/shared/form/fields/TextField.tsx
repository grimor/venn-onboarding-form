import type { ReactNode } from "react";
import { Field } from "@base-ui/react";

import { Input, type InputProps } from "../../ui/Input";
import { Text } from "../../ui/Text";
import { FormError } from "../components";
import { useFieldContext } from "../formContext";
import { getErrorMessages } from "../utils/getErrorMessages";

import styles from "./TextField.module.css";

/** Properties of the text field. Also accepts all `Input` properties, but not `name` and the value properties. */
type TextFieldProps = Omit<
  InputProps,
  "name" | "value" | "defaultValue" | "onValueChange"
> & {
  /** The label of the field. */
  label: ReactNode;
  /** Help text that shows below the field. */
  description?: ReactNode;
  /** The text that shows while the field checks its value. */
  validatingLabel?: ReactNode;
  /**
   * Changes the input value before the field keeps it. For example, use it
   * to remove characters that are not permitted.
   */
  parseValue?: (value: string) => string;
};

/**
 * A text field of the form. It shows a label, error messages, and a status
 * while it checks the value. Use it in `form.AppField`.
 */
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
