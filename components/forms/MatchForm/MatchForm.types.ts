// components/forms/MatchForm/MatchForm.types.ts

export interface MatchFormData {
  title: string;
  description: string;
  location: string;
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;
  isPublic: boolean;
}

export interface MatchFormProps {
  onSubmit: (data: MatchFormData) => Promise<void>;
  loading: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}
