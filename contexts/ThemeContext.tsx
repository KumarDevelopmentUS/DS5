// contexts/ThemeContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { COLORS, getThemeColors } from '../constants/theme';

/**
 * Theme Context
 *
 * This context manages the application's current theme and provides theme settings
 * and functions to change it to all components. It uses the existing theme constants
 * that follow Apple's Human Interface Guidelines (HIG) color palette.
 *
 * Features:
 * - Light/Dark/System theme modes
 * - Uses existing theme constants from constants/theme.ts
 * - Persistent theme storage
 * - System theme detection
 * - Real-time theme switching
 * - Type-safe color access
 */

// Theme mode options
export type ThemeMode = 'light' | 'dark' | 'system';

// Use the existing color palette type from constants/theme.ts
export type ColorPalette = typeof COLORS.light;

// Theme context state interface
export interface ThemeContextState {
  // Current theme state
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;

  // Theme control
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // System theme detection
  systemColorScheme: ColorSchemeName;

  // Loading state
  loading: boolean;
}

// Create the context
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 *
 * Provides theme state and controls to the entire app. Handles theme persistence,
 * system theme detection, and provides the current color palette.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );
  const [loading, setLoading] = useState(true);

  // Determine if dark mode should be active
  const isDark =
    themeMode === 'dark' ||
    (themeMode === 'system' && systemColorScheme === 'dark');

  // Get current color palette using existing theme helper
  const colors = getThemeColors(isDark);

  /**
   * Load saved theme preference on startup
   */
  useEffect(() => {
    loadSavedTheme();
  }, []);

  /**
   * Listen for system theme changes
   */
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  /**
   * Load theme preference from storage
   */
  const loadSavedTheme = async () => {
    try {
      const { getCachedData } = await import('../utils/storage');

      const savedTheme = await getCachedData<ThemeMode>('theme_preference');

      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
      // Default to system theme if loading fails
      setThemeMode('system');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save theme preference to storage
   */
  const saveTheme = async (mode: ThemeMode) => {
    try {
      const { cacheData } = await import('../utils/storage');

      await cacheData('theme_preference', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  /**
   * Set theme mode and persist it
   */
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveTheme(mode);
  };

  /**
   * Toggle between light and dark themes
   * If currently on system, switch to the opposite of current system theme
   */
  const toggleTheme = () => {
    if (themeMode === 'system') {
      // If on system mode, switch to the opposite of current system preference
      const newMode = systemColorScheme === 'dark' ? 'light' : 'dark';
      setTheme(newMode);
    } else {
      // If on explicit mode, toggle between light and dark
      const newMode = themeMode === 'light' ? 'dark' : 'light';
      setTheme(newMode);
    }
  };

  // Context value
  const contextValue: ThemeContextState = {
    // Current theme state
    themeMode,
    isDark,
    colors,

    // Theme control
    setTheme,
    toggleTheme,

    // System theme detection
    systemColorScheme,

    // Loading state
    loading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Custom hook to use the ThemeContext
 *
 * Provides convenient access to theme state and controls.
 * Ensures the hook is used within a ThemeProvider.
 *
 * @returns ThemeContextState - Current theme state and controls
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};

/**
 * Hook for accessing colors only
 *
 * Convenience hook when you only need the color palette.
 *
 * @returns ColorPalette - Current theme's color palette
 */
export const useColors = (): ColorPalette => {
  const { colors } = useTheme();
  return colors;
};

/**
 * Hook for accessing theme mode only
 *
 * Convenience hook when you only need the theme mode.
 *
 * @returns Object with current theme mode and dark state
 */
export const useThemeMode = (): { themeMode: ThemeMode; isDark: boolean } => {
  const { themeMode, isDark } = useTheme();
  return { themeMode, isDark };
};

// Export the context for advanced use cases
export { ThemeContext };

// Re-export theme constants for convenience
export {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  SHADOWS,
  ANIMATIONS,
  BORDERS,
  MIXINS,
} from '../constants/theme';

// Default export
export default ThemeProvider;
