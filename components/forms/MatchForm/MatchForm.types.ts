// components/forms/MatchForm/MatchForm.types.ts

export interface MatchFormData {
  title: string;
  description: string;
  location: string;
  scoreLimit: number;
  winByTwo: boolean;
  sinkPoints: 3 | 5;
  isPublic: boolean;
  // Added player names
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
  // Added team names
  team1Name: string;
  team2Name: string;
}

export interface MatchFormProps {
  onSubmit: (data: MatchFormData) => Promise<void>;
  loading: boolean;
  serverError?: string | null;
  onCancel?: () => void;
}
