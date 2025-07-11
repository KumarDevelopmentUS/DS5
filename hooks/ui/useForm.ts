// hooks/ui/useForm.ts
import { useState, useCallback } from 'react';
import type { ValidationResult } from '../../utils/validation';

// ============================================
// TYPE DEFINITIONS
// ============================================

// A generic type for form values, allowing any string-keyed object.
type FormValues = Record<string, any>;

// A generic type for form errors, mapping field names to error messages.
type FormErrors = Record<string, string | undefined>;

// A map of field names to their corresponding validation functions.
type FormValidators<T> = Partial<
  Record<keyof T, (value: any) => ValidationResult>
>;

// The configuration object that will be passed to the useForm hook.
interface UseFormConfig<T extends FormValues> {
  initialValues: T;
  validators?: FormValidators<T>;
  onSubmit: (values: T) => Promise<void> | void;
}

// The object returned by the useForm hook, containing state and handlers.
export interface UseFormReturn<T extends FormValues> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: any) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setError: (field: keyof T, error: string | undefined) => void;
}

// ============================================
// HOOK IMPLEMENTATION
// ============================================

/**
 * Custom Hook: useForm
 *
 * Purpose:
 * A comprehensive, reusable hook to manage form state, including values,
 * validation, errors, and submission status. It is tightly integrated with
 * the project's own validation utility functions.
 *
 * @param config - Configuration object including initial values, a map of
 * validator functions, and an onSubmit callback.
 * @returns An object containing form state and handler functions.
 */
export const useForm = <T extends FormValues>({
  initialValues,
  validators,
  onSubmit,
}: UseFormConfig<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Runs all provided validators against the current form values.
   * @returns A FormErrors object and a boolean indicating overall validity.
   */
  const runValidation = useCallback((): {
    isValid: boolean;
    errors: FormErrors;
  } => {
    if (!validators) {
      return { isValid: true, errors: {} };
    }

    const validationErrors: FormErrors = {};
    for (const field in validators) {
      const validator = validators[field];
      if (validator) {
        const result = validator(values[field]);
        if (!result.isValid) {
          validationErrors[field] = result.error;
        }
      }
    }

    return {
      isValid: Object.keys(validationErrors).length === 0,
      errors: validationErrors,
    };
  }, [values, validators]);

  /**
   * Handles changes to form fields.
   */
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setValues((prevValues) => ({
        ...prevValues,
        [field]: value,
      }));
      // Optionally, clear the error for the field as the user types
      if (errors[field as string]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: undefined,
        }));
      }
    },
    [errors]
  );

  /**
   * Allows manually setting the value of a specific field.
   */
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));
  }, []);

  /**
   * Allows manually setting an error for a specific field.
   */
  const setError = useCallback((field: keyof T, error: string | undefined) => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));
  }, []);

  /**
   * Resets the form to its initial state.
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Handles the form submission process.
   */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    const { isValid, errors: validationErrors } = runValidation();

    if (isValid) {
      setErrors({});
      try {
        await onSubmit(values);
      } catch (error: any) {
        console.error('Submission error:', error);
        // Set a general form error if the submission fails
        setError(
          'submit' as keyof T,
          error.message || 'An unexpected error occurred.'
        );
      } finally {
        // Only set isSubmitting to false on failure, as a successful submission
        // will likely navigate away. This can be adjusted based on desired UX.
      }
    } else {
      setErrors(validationErrors);
    }
    // Always set submitting to false if validation fails or an error occurs
    setIsSubmitting(false);
  }, [values, runValidation, onSubmit, setError]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setError,
  };
};
