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
 * Custom Hook: useTheme
 *
 * Purpose:
 * Provides a centralized access point to the ThemeContext. This hook abstracts
 * the direct dependency on the context file, organizing all UI-related hooks
 * in a single directory.
 *
 * It returns the full theme context, including the current theme mode,
 * color palette, and functions to change the theme.
 *
 * @returns {ThemeContextState} The current theme state and control functions.
 */
export const useTheme = (): ThemeContextState => {
  return useThemeFromContext();
};

/**
 * Custom Hook: useColors
 *
 * Purpose:
 * A convenience hook for components that only need access to the current
 * color palette without needing the theme mode or control functions.
 *
 * @returns {ColorPalette} The application's current color palette.
 */
export const useColors = (): ColorPalette => {
  return useColorsFromContext();
};

/**
 * Custom Hook: useThemeMode
 *
 * Purpose:
 * A convenience hook for components that only need to know the current
 * theme mode ('light', 'dark', or 'system') and whether dark mode is active.
 *
 * @returns An object with the current `themeMode` and `isDark` boolean.
 */
export const useThemeMode = (): { themeMode: ThemeMode; isDark: boolean } => {
  return useThemeModeFromContext();
};

// Re-export types for convenience when using the hooks
export type { ThemeContextState, ColorPalette, ThemeMode };
