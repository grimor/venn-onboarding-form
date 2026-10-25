import type { SubmitEvent } from "react";

import { FormError } from "../../../../shared/form/components";
import { withForm } from "../../../../shared/form/useAppForm";
import { useCorporationNumberValidator } from "../../hooks/useCorporationNumberValidator";
import { onboardingFormOptions } from "../../model/onboardingFormOptions";
import {
  onboardingStep1Schema,
  type OnboardingStep1Values,
} from "../../model/onboardingSchema";
import { sanitizeCorporationNumber } from "../../model/sanitizeCorporationNumber";
import { sanitizePhone } from "../../model/sanitizePhone";

import styles from "./OnboardingForm.module.css";

const { shape } = onboardingStep1Schema;

type Step1SubmitHandler = (
  value: OnboardingStep1Values,
) => Promise<void> | void;

const defaultSubmitHandler: Step1SubmitHandler = () => undefined;

export const OnboardingFormStep1 = withForm({
  ...onboardingFormOptions,
  props: {
    onSubmit: defaultSubmitHandler,
    submitError: undefined as string | undefined,
  },
  render: function Render({ form, onSubmit, submitError }) {
    const validateCorporationNumber = useCorporationNumberValidator();

    return (
      <form.FormGroup
        name="step1"
        onGroupSubmit={async ({ value }) => {
          await onSubmit(value);
        }}
      >
        {(group) => {
          const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
            event.preventDefault();
            event.stopPropagation();

            void group.handleSubmit();
          };

          return (
            <form className={styles.Form} onSubmit={handleSubmit} noValidate>
              <div className={styles.Row}>
                <form.AppField
                  name="step1.firstName"
                  validators={{ onBlur: shape.firstName }}
                >
                  {(field) => (
                    <field.TextField
                      label="First Name"
                      autoComplete="given-name"
                      required
                    />
                  )}
                </form.AppField>

                <form.AppField
                  name="step1.lastName"
                  validators={{ onBlur: shape.lastName }}
                >
                  {(field) => (
                    <field.TextField
                      label="Last Name"
                      autoComplete="family-name"
                      required
                    />
                  )}
                </form.AppField>
              </div>

              <form.AppField
                name="step1.phone"
                validators={{ onBlur: shape.phone }}
              >
                {(field) => (
                  <field.TextField
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    parseValue={sanitizePhone}
                    required
                  />
                )}
              </form.AppField>

              <form.AppField
                name="step1.corporationNumber"
                validators={{
                  onBlur: shape.corporationNumber,
                  onBlurAsync: ({ value, signal, fieldApi }) => {
                    // TODO: Workaround for this issue https://github.com/TanStack/form/issues/2372
                    fieldApi.timeoutIds.validations.blur = null;

                    return validateCorporationNumber({
                      value,
                      signal,
                      getCurrentValue: () => fieldApi.state.value,
                    });
                  },
                }}
              >
                {(field) => (
                  <field.TextField
                    label="Corporation Number"
                    inputMode="numeric"
                    validatingLabel="Checking corporation number…"
                    parseValue={sanitizeCorporationNumber}
                    required
                  />
                )}
              </form.AppField>

              <FormError>{submitError}</FormError>

              <form.AppForm>
                <form.SubmitButton isSubmitting={group.state.meta.isSubmitting}>
                  Submit <span aria-hidden="true">→</span>
                </form.SubmitButton>
              </form.AppForm>
            </form>
          );
        }}
      </form.FormGroup>
    );
  },
});
