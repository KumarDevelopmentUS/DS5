// hooks/ui/useMultiStepForm.ts
import { useState, useMemo, ReactElement } from 'react';

// Define the structure of the object returned by the hook
export interface UseMultiStepFormReturn {
  /** The total number of steps in the form. */
  totalSteps: number;
  /** The index of the currently active step (zero-based). */
  currentStepIndex: number;
  /** The currently active step component. */
  step: ReactElement;
  /** A boolean indicating if the current step is the first one. */
  isFirstStep: boolean;
  /** A boolean indicating if the current step is the last one. */
  isLastStep: boolean;
  /** A function to navigate to the next step. */
  next: () => void;
  /** A function to navigate to the previous step. */
  back: () => void;
  /** A function to navigate to a specific step by its index. */
  goTo: (index: number) => void;
}

/**
 * Custom Hook: useMultiStepForm
 *
 * Purpose:
 * Manages the state and navigation logic for a form that is broken down
 * into multiple sequential steps. It simplifies handling the active step,
 * navigation between steps, and provides helpful state variables.
 *
 * Why it's used:
 * - To improve user experience in complex forms like registration or wizards.
 * - To decouple the navigation logic from the individual form step components.
 * - To provide a clean and reusable API for controlling the flow of a multi-step process.
 *
 * @param steps - An array of React components, where each component represents one step of the form.
 * @returns An object with state and functions to control the multi-step form.
 */
export const useMultiStepForm = (
  steps: ReactElement[]
): UseMultiStepFormReturn => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  /**
   * Navigates to the next step if not on the last step.
   */
  const next = () => {
    setCurrentStepIndex((i) => {
      if (i >= steps.length - 1) return i;
      return i + 1;
    });
  };

  /**
   * Navigates to the previous step if not on the first step.
   */
  const back = () => {
    setCurrentStepIndex((i) => {
      if (i <= 0) return i;
      return i - 1;
    });
  };

  /**
   * Navigates to a specific step by its index.
   * @param index - The zero-based index of the step to navigate to.
   */
  const goTo = (index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  };

  // Memoize derived state to prevent unnecessary recalculations
  const returnValues = useMemo(
    () => ({
      currentStepIndex,
      step: steps[currentStepIndex],
      totalSteps: steps.length,
      isFirstStep: currentStepIndex === 0,
      isLastStep: currentStepIndex === steps.length - 1,
      goTo,
      next,
      back,
    }),
    [currentStepIndex, steps]
  );

  return returnValues;
};
