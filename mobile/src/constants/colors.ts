export const colors = {
  // Corporate Design System - Light Theme
  primary: {
    DEFAULT: '#007AFF',      // Standard iOS blue
    light: '#4DA3FF',        // Light blue for hover/active
    dark: '#0056CC',         // Dark blue for pressed states
    foreground: '#FFFFFF',   // Text on primary
  },
  primaryLight: '#E8F0FE',   // Light blue for backgrounds
  secondary: {
    DEFAULT: '#6B7280',      // Gray-500
    light: '#9CA3AF',        // Gray-400
    dark: '#4B5563',         // Gray-600
    foreground: '#FFFFFF',   // Text on secondary
  },
  success: {
    DEFAULT: '#22C55E',      // Green-500
    light: '#4ADE80',        // Green-400
    dark: '#16A34A',         // Green-600
    foreground: '#FFFFFF',
    bg: '#F0FDF4',           // Green-50 - light background
    bgMedium: '#DCFCE7',     // Green-100 - medium background
    border: '#86EFAC',       // Green-300 - border
  },
  warning: {
    DEFAULT: '#F59E0B',      // Amber-500
    light: '#FBBF24',        // Amber-400
    dark: '#D97706',         // Amber-600
    foreground: '#000000',
    bg: '#FFFBEB',           // Amber-50 - light background
    bgMedium: '#FEF3C7',     // Amber-100 - medium background
    border: '#FDE68A',       // Amber-300 - border
  },
  error: {
    DEFAULT: '#EF4444',      // Red-500
    light: '#F87171',        // Red-400
    dark: '#DC2626',         // Red-600
    foreground: '#FFFFFF',
    bg: '#FEF2F2',           // Red-50 - light background
    bgMedium: '#FEE2E2',     // Red-100 - medium background
    border: '#FCA5A5',       // Red-300 - border
  },
  info: {
    DEFAULT: '#3B82F6',      // Blue-500
    light: '#60A5FA',        // Blue-400
    dark: '#2563EB',         // Blue-600
    foreground: '#FFFFFF',
    bg: '#EFF6FF',           // Blue-50 - light background
    bgMedium: '#DBEAFE',     // Blue-100 - medium background
    border: '#93C5FD',       // Blue-300 - border
  },
  // Light color aliases for backward compatibility
  successLight: '#4ADE80',    // Green-400
  infoLight: '#60A5FA',       // Blue-400
  warningLight: '#FBBF24',    // Amber-400
  errorLight: '#F87171',      // Red-400
  text: {
    primary: '#111827',      // Gray-900 - primary text
    secondary: '#4B5563',    // Gray-600 - secondary text
    tertiary: '#9CA3AF',     // Gray-400 - tertiary/muted text
    muted: '#9CA3AF',        // Gray-400 - muted text (alias)
    disabled: '#D1D5DB',     // Gray-300 - disabled text
    inverse: '#FFFFFF',      // Text on dark backgrounds
    link: '#007AFF',         // Link color
    onPrimary: '#FFFFFF',    // Text on primary (alias for primary.foreground)
  },
  background: {
    primary: '#FFFFFF',      // White - main background
    secondary: '#F9FAFB',    // Gray-50 - secondary background
    tertiary: '#F3F4F6',     // Gray-100 - tertiary background
    inverse: '#111827',      // Gray-900 - dark background
  },
  border: {
    subtle: '#E5E7EB',       // Gray-200 - subtle borders
    default: '#D1D5DB',      // Gray-300 - default borders
    strong: '#9CA3AF',       // Gray-400 - strong borders
    focus: '#007AFF',        // Primary blue - focus rings
  },
  surface: {
    DEFAULT: '#FFFFFF',      // White - default surface
    elevated: '#FFFFFF',     // White - elevated surface
    sunken: '#F3F4F6',       // Gray-100 - sunken surface
    overlay: 'rgba(17, 24, 39, 0.5)', // Modal overlay
    overlayDark: 'rgba(0, 0, 0, 0.6)', // Dark overlay for camera/scanner
  },
  surfaceVariant: '#F3F4F6', // Gray-100 - variant surface
  diet: {
    veg: '#22C55E',          // Green-500
    nonveg: '#EF4444',       // Red-500
    vegan: '#3B82F6',        // Blue-500
    gf: '#F59E0B',           // Amber-500
  },
  status: {
    pending: '#F59E0B',      // Amber-500
    confirmed: '#3B82F6',    // Blue-500
    preparing: '#8B5CF6',    // Violet-500
    ready: '#22C55E',        // Green-500
    completed: '#6B7280',    // Gray-500
    cancelled: '#EF4444',    // Red-500
  },
  role: {
    superadmin: {
      bg: 'rgba(168, 85, 247, 0.15)',
      border: '#A855F7',
      text: '#A855F7',
    },
  },
  // Gray scale (Tailwind-compatible)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  // Shadow tokens for React Native
  shadow: {
    color: '#000000',
    offset: { width: 0, height: 4 },
    opacity: 0.1,
    radius: 12,
    elevation: 4,
  },
} as const;

export type ColorKey = keyof typeof colors;

// Gradient definitions (corporate - subtle, no luxury)
export const gradients = {
  primary: 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)',
  subtle: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)',
  card: 'linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)',
  overlay: 'linear-gradient(135deg, rgba(17, 24, 39, 0.4) 0%, rgba(17, 24, 39, 0.1) 100%)',
};

// Shadow definitions for React Native (corporate - clean, standard elevation)
export const shadows = {
  xs: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 16,
  },
  inner: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  focus: {
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
};

// Border radius
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Typography - System fonts only (no custom font families)
export const typography = {
  // Font families - system defaults
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'SF Mono, Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',

  // Font families (aliases for backwards compatibility)
  sansRegular: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  sansMedium: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  sansSemiBold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  sansBold: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  serifBold: 'Georgia, "Times New Roman", serif',

  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',

  // Font sizes
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,

  // Line heights
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,

  // Letter spacing
  tightTracking: -0.02,
  normalTracking: 0,
  wideTracking: 0.02,
};