// components/forms/SchoolPicker/SchoolPicker.types.ts
import { School } from '../../../constants/data/schools';

export interface SchoolPickerProps {
  /** The currently selected school object. */
  value: School | null;
  /** Callback function that is called when a school is selected. */
  onSelect: (school: School | null) => void;
  /** An optional label for the picker input. */
  label?: string;
  /** An optional placeholder for the picker input. */
  placeholder?: string;
  /** An optional error message to display. */
  error?: string;
}
