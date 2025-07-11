/**
 * Professional Theme Constants
 * Modern, minimal, and clean design system
 */

export const Colors = {
  // Primary Colors
  primary: '#22C55E',
  primaryLight: '#22C55E',
  primaryDark: '#22C55E',
  
  // CTA/Action Colors
  success: '#22C55E',
  successDark: '#22C55E',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8FDF9',
  backgroundTertiary: '#F1F5F9',
  
  // Text Colors
  textPrimary: '#04060D',
  textSecondary: '#5A636E',
  textMuted: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // Border Colors
  border: '#DBE2EA',
  borderLight: '#E2E8F0',
  borderDark: '#CBD5E1',
  
  // Status Colors
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  
  // Overlay Colors
  overlay: 'rgba(4, 6, 13, 0.5)',
  overlayLight: 'rgba(4, 6, 13, 0.1)',
  
  // Shadow Colors
  shadow: 'rgba(4, 6, 13, 0.08)',
  shadowDark: 'rgba(4, 6, 13, 0.16)',
};

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const Spacing = {
  // Base spacing unit (4px)
  unit: 4,
  
  // Spacing scale
  xs: 4,
  sm: 8,
  base: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: Colors.shadowDark,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
};

export const Layout = {
  // Container sizes
  container: {
    padding: Spacing.lg,
    maxWidth: 768,
  },
  
  // Header heights
  header: {
    height: 64,
    padding: Spacing.base,
  },
  
  // Card styles
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    ...Shadows.base,
  },
  
  // Button styles
  button: {
    height: 48,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Input styles
  input: {
    height: 48,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
};

export const Animations = {
  // Duration
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  // Easing
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

export const Gradients = {
  primary: [Colors.primary, Colors.primary] as const,
  success: [Colors.success, Colors.success] as const,
  background: [Colors.background, Colors.backgroundSecondary] as const,
  overlay: ['rgba(4, 6, 13, 0)', 'rgba(4, 6, 13, 0.3)'] as const,
};

// Helper functions for consistent styling
export const createTextStyle = (
  size: keyof typeof Typography.fontSize,
  weight: keyof typeof Typography.fontWeight,
  color: string,
  lineHeight?: keyof typeof Typography.lineHeight,
  letterSpacing?: keyof typeof Typography.letterSpacing
) => ({
  fontSize: Typography.fontSize[size],
  fontWeight: Typography.fontWeight[weight],
  color,
  lineHeight: lineHeight ? Typography.fontSize[size] * Typography.lineHeight[lineHeight] : undefined,
  letterSpacing: letterSpacing ? Typography.letterSpacing[letterSpacing] : undefined,
});

export const createShadowStyle = (shadowKey: keyof typeof Shadows) => Shadows[shadowKey];

export const createSpacingStyle = (
  top?: keyof typeof Spacing,
  right?: keyof typeof Spacing,
  bottom?: keyof typeof Spacing,
  left?: keyof typeof Spacing
) => ({
  paddingTop: top ? Spacing[top] : undefined,
  paddingRight: right ? Spacing[right] : undefined,
  paddingBottom: bottom ? Spacing[bottom] : undefined,
  paddingLeft: left ? Spacing[left] : undefined,
});

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  Animations,
  Gradients,
  createTextStyle,
  createShadowStyle,
  createSpacingStyle,
}; 