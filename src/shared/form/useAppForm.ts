import { createFormHook } from "@tanstack/react-form";
import { formContext, fieldContext } from "./formContext";

import { SubmitButton } from "./components";
import { TextField } from "./fields";

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField },
  formComponents: { SubmitButton },
});
