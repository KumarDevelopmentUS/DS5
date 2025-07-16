import styled from 'styled-components/native';
import { useTheme } from '../../../hooks/ui/useTheme';

type AppTheme = ReturnType<typeof useTheme>;

interface ProgressBarProps {
  percentage: number;
}

interface BarProps {
  color?: string;
  theme: AppTheme;
}

export const ProgressBarContainer = styled.View`
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
`;

export const Bar = styled.View<ProgressBarProps & BarProps>`
  height: 100%;
  width: ${({ percentage }: ProgressBarProps) => percentage}%;
  background-color: ${({ color, theme }: BarProps) =>
    color || theme.colors.primary};
`;

export const ComparisonContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: 8px;
`;

export const ComparisonBarContainer = styled.View`
  flex: 1;
  flex-direction: row;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

interface ComparisonBarProps {
  percentage: number;
  color?: string;
  theme: AppTheme;
}

export const ComparisonBar = styled.View<ComparisonBarProps>`
  width: ${({ percentage }: ComparisonBarProps) => percentage}%;
  height: 100%;
  background-color: ${({ color, theme }: ComparisonBarProps) =>
    color || theme.colors.primary};
`;
