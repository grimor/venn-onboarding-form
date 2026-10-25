import type { SubmitEvent } from "react";

import { withForm } from "../../../../shared/form/useAppForm";
import { onboardingFormOptions } from "../../model/onboardingFormOptions";
import {
  onboardingStep1Schema,
  type OnboardingStep1Values,
} from "../../model/onboardingSchema";

import styles from "./OnboardingForm.module.css";

const { shape } = onboardingStep1Schema;

type Step1SubmitHandler = (
  value: OnboardingStep1Values,
) => void | Promise<void>;

const defaultSubmitHandler: Step1SubmitHandler = () => {};

export const OnboardingFormStep1 = withForm({
  ...onboardingFormOptions,
  props: {
    onSubmit: defaultSubmitHandler,
  },
  render: function Render({ form, onSubmit }) {
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
                    placeholder="+1"
                  />
                )}
              </form.AppField>

              <form.AppField
                name="step1.corporationNumber"
                validators={{ onBlur: shape.corporationNumber }}
              >
                {(field) => (
                  <field.TextField
                    label="Corporation Number"
                    inputMode="numeric"
                    maxLength={9}
                  />
                )}
              </form.AppField>

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
