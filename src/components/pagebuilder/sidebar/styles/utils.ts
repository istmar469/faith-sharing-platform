
import { UseFormReturn } from "react-hook-form";

// Generate a list of predefined gradients
export const predefinedGradients = [
  'linear-gradient(90deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(90deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(90deg, #d4fc79 0%, #96e6a1 100%)',
  'linear-gradient(90deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(90deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(90deg, #e0c3fc 0%, #8ec5fc 100%)'
];

// Handle field change and immediately submit the form
export const handleFieldChange = (form: UseFormReturn<any>, onSubmit: (values: any) => void) => {
  form.handleSubmit(onSubmit)();
};

export default {
  predefinedGradients,
  handleFieldChange
};
