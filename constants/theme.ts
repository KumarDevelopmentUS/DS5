// constants/theme.ts

// Apple Human Interface Guidelines Color System
export const COLORS = {
  light: {
    // Primary System Colors
    primary: '#007AFF', // System Blue
    secondary: '#AF52DE', // System Purple
    success: '#34C759', // System Green
    error: '#FF3B30', // System Red
    warning: '#FF9500', // System Orange
    info: '#5856D6', // System Indigo

    // Additional System Colors
    systemYellow: '#FFCC00',
    systemTeal: '#30B0C7',

    // Text Colors (Labels)
    text: '#000000', // Label (Primary) - 100% opacity
    textSecondary: '#3C3C4399', // Secondary Label - 60% opacity
    textTertiary: '#3C3C434D', // Tertiary Label - 30% opacity
    textQuaternary: '#3C3C432E', // Quaternary Label - 18% opacity

    // Backgrounds
    background: '#FFFFFF', // System Background
    surface: '#F2F2F7', // Secondary System Background
    surfaceTertiary: '#FFFFFF', // Tertiary System Background

    // Grouped Backgrounds
    groupedBackground: '#F2F2F7', // System Grouped Background
    groupedBackgroundSecondary: '#FFFFFF', // Secondary Grouped Background
    groupedBackgroundTertiary: '#F2F2F7', // Tertiary Grouped Background

    // Separators and Borders
    border: '#3C3C434A', // Separator - 29% opacity
    borderOpaque: '#C6C6C8', // Opaque Separator

    // Fills
    fill: '#78788033', // System Fill - 20% opacity
    fillSecondary: '#78788029', // Secondary System Fill - 16% opacity
    fillTertiary: '#7678801F', // Tertiary System Fill - 12% opacity
    fillQuaternary: '#74748014', // Quaternary System Fill - 8% opacity

    // Interactive States
    activeOpacity: 0.7,
    disabledOpacity: 0.3,

    // Additional UI Colors
    link: '#007AFF',
    destructive: '#FF3B30',
    placeholder: '#3C3C432E',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  dark: {
    // Primary System Colors
    primary: '#0A84FF', // System Blue
    secondary: '#BF5AF2', // System Purple
    success: '#30D158', // System Green
    error: '#FF453A', // System Red
    warning: '#FF9F0A', // System Orange
    info: '#5E5CE6', // System Indigo

    // Additional System Colors
    systemYellow: '#FFD60A',
    systemTeal: '#40C8E0',

    // Text Colors (Labels)
    text: '#FFFFFF', // Label (Primary) - 100% opacity
    textSecondary: '#EBEBF599', // Secondary Label - 60% opacity
    textTertiary: '#EBEBF54D', // Tertiary Label - 30% opacity
    textQuaternary: '#EBEBF52E', // Quaternary Label - 18% opacity

    // Backgrounds
    background: '#000000', // System Background
    surface: '#1C1C1E', // Secondary System Background
    surfaceTertiary: '#2C2C2E', // Tertiary System Background

    // Grouped Backgrounds
    groupedBackground: '#000000', // System Grouped Background
    groupedBackgroundSecondary: '#1C1C1E', // Secondary Grouped Background
    groupedBackgroundTertiary: '#2C2C2E', // Tertiary Grouped Background

    // Separators and Borders
    border: '#54545899', // Separator - 60% opacity
    borderOpaque: '#38383A', // Opaque Separator

    // Fills
    fill: '#7878805C', // System Fill - 36% opacity
    fillSecondary: '#78788052', // Secondary System Fill - 32% opacity
    fillTertiary: '#7678803D', // Tertiary System Fill - 24% opacity
    fillQuaternary: '#7478802D', // Quaternary System Fill - 18% opacity

    // Interactive States
    activeOpacity: 0.7,
    disabledOpacity: 0.3,

    // Additional UI Colors
    link: '#0A84FF',
    destructive: '#FF453A',
    placeholder: '#EBEBF52E',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
};

// Spacing scale following 4px base unit
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography scale following Apple's SF Pro
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semibold: 'Inter-Medium', // Using Medium as fallback for semibold
    bold: 'Inter-Bold',
    black: 'Inter-Black',
  },
  sizes: {
    // Caption sizes
    caption2: 11,
    caption1: 12,

    // Body and label sizes
    footnote: 13,
    subheadline: 15,
    callout: 16,
    body: 17,
    headline: 17,

    // Title sizes
    title3: 20,
    title2: 22,
    title1: 28,

    // Large titles
    largeTitle: 34,

    // Custom sizes for special uses
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
    xxxl: 34,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
};

// Shadow definitions for depth
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// Animation durations
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,

  // Easing functions
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

// Border radius values
export const BORDERS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
  radius: 8, // Default radius value
};

// Z-index scale for layering
export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
};

// Breakpoints for responsive design
export const BREAKPOINTS = {
  xs: 0,
  sm: 375, // iPhone SE
  md: 414, // iPhone Plus/Max
  lg: 768, // iPad
  xl: 1024, // iPad Pro
  xxl: 1366, // iPad Pro 12.9"
};

// Safe area insets (will be overridden by device-specific values)
export const SAFE_AREA = {
  top: 44,
  bottom: 34,
  left: 0,
  right: 0,
};

// Component-specific constants
export const COMPONENT_SIZES = {
  button: {
    small: {
      height: 32,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.sizes.footnote,
    },
    medium: {
      height: 44,
      paddingHorizontal: SPACING.lg,
      fontSize: TYPOGRAPHY.sizes.body,
    },
    large: {
      height: 56,
      paddingHorizontal: SPACING.xl,
      fontSize: TYPOGRAPHY.sizes.title3,
    },
  },
  input: {
    small: {
      height: 36,
      paddingHorizontal: SPACING.sm,
      fontSize: TYPOGRAPHY.sizes.footnote,
    },
    medium: {
      height: 44,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.sizes.body,
    },
    large: {
      height: 52,
      paddingHorizontal: SPACING.md,
      fontSize: TYPOGRAPHY.sizes.title3,
    },
  },
  avatar: {
    small: 32,
    medium: 44,
    large: 64,
    xlarge: 96,
  },
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
};

// Export a helper to get current theme colors
export const getThemeColors = (isDark: boolean) =>
  isDark ? COLORS.dark : COLORS.light;

// Export common style mixins
export const MIXINS = {
  // Center content
  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  // Absolute fill
  absoluteFill: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Row with centered items
  rowCenter: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },

  // Shadow presets
  shadow: (level: keyof typeof SHADOWS) => SHADOWS[level],
};
