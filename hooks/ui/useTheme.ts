// hooks/ui/useTheme.ts
import {
  useTheme as useThemeFromContext,
  useColors as useColorsFromContext,
  useThemeMode as useThemeModeFromContext,
  type ThemeContextState,
  type ColorPalette,
  type ThemeMode,
} from '../../contexts/ThemeContext';

/**
 * Theme Hook
 * 
 * Provides centralized access to theme context including colors, theme mode, and controls.
 * Returns the full theme state and control functions.
 */
export const useTheme = (): ThemeContextState => {
  return useThemeFromContext();
};

/**
 * Colors Hook
 * 
 * Convenience hook for accessing only the current color palette.
 */
export const useColors = (): ColorPalette => {
  return useColorsFromContext();
};

/**
 * Theme Mode Hook
 * 
 * Convenience hook for accessing theme mode and dark mode status.
 */
export const useThemeMode = (): { themeMode: ThemeMode; isDark: boolean } => {
  return useThemeModeFromContext();
};

// Re-export types for convenience when using the hooks
export type { ThemeContextState, ColorPalette, ThemeMode };
