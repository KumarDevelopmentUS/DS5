// components/forms/MatchForm/MatchForm.types.ts
import type {
  MatchCreationFormData,
  MatchCreationErrors,
} from '../../../hooks/match/useMatchCreation';

export interface MatchFormProps {
  formData: MatchCreationFormData;
  errors: MatchCreationErrors;
  isCreating: boolean;
  isFormValid: boolean;
  onUpdateField: <K extends keyof MatchCreationFormData>(
    field: K,
    value: MatchCreationFormData[K]
  ) => void;
  onUpdateFormData: (updates: Partial<MatchCreationFormData>) => void;
  onCreateMatch: () => Promise<void>;
  onClearError: (field: keyof MatchCreationErrors) => void;
}

export interface MatchFormFieldProps {
  label: string;
  value: string | number | boolean;
  onValueChange: (value: any) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  maxLength?: number;
  onClearError?: () => void;
}

export interface GameSettingsSectionProps {
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;
  isPublic: boolean;
  onScoreLimitChange: (value: number) => void;
  onWinByTwoChange: (value: boolean) => void;
  onSinkPointsChange: (value: 3 | 5) => void;
  onIsPublicChange: (value: boolean) => void;
  errors: Pick<MatchCreationErrors, 'scoreLimit' | 'sinkPoints'>;
}
