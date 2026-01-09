// app/config/colors.js or lib/colors.js

export const colors = {
  // Primary Colors - Vibrant & Modern
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Main Primary
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary Colors - Complementary
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Main Secondary
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },

  // Accent Colors - Vibrant Highlights
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15', // Main Accent
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Neutral Colors - Backgrounds & Text
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Success, Warning, Error, Info
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    700: '#047857',
  },
  
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    700: '#b45309',
  },
  
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    700: '#1d4ed8',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)',
    secondary: 'linear-gradient(135deg, #d946ef 0%, #f0abfc 100%)',
    accent: 'linear-gradient(135deg, #facc15 0%, #fde047 100%)',
    premium: 'linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%)',
    dark: 'linear-gradient(135deg, #171717 0%, #404040 100%)',
  },

  // Special Effects
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(0, 0, 0, 0.1)',
  },

  // Shadows with color
  shadows: {
    sm: '0 1px 2px 0 rgba(14, 165, 233, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(14, 165, 233, 0.1), 0 1px 2px -1px rgba(14, 165, 233, 0.1)',
    md: '0 4px 6px -1px rgba(14, 165, 233, 0.1), 0 2px 4px -2px rgba(14, 165, 233, 0.1)',
    lg: '0 10px 15px -3px rgba(14, 165, 233, 0.1), 0 4px 6px -4px rgba(14, 165, 233, 0.1)',
    xl: '0 20px 25px -5px rgba(14, 165, 233, 0.1), 0 8px 10px -6px rgba(14, 165, 233, 0.1)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  },
};

// Theme configuration for consistent usage
export const theme = {
  colors: colors,
  
  // Predefined color combinations
  schemes: {
    primary: {
      bg: colors.primary[500],
      text: colors.neutral[50],
      hover: colors.primary[600],
      border: colors.primary[400],
    },
    secondary: {
      bg: colors.secondary[500],
      text: colors.neutral[50],
      hover: colors.secondary[600],
      border: colors.secondary[400],
    },
    accent: {
      bg: colors.accent[500],
      text: colors.neutral[900],
      hover: colors.accent[600],
      border: colors.accent[400],
    },
    neutral: {
      bg: colors.neutral[100],
      text: colors.neutral[800],
      hover: colors.neutral[200],
      border: colors.neutral[300],
    },
    dark: {
      bg: colors.neutral[900],
      text: colors.neutral[50],
      hover: colors.neutral[800],
      border: colors.neutral[700],
    },
  },
};

export default theme;