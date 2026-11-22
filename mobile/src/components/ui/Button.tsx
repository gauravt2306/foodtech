'use client';

import { TouchableOpacity, Text, TextStyle, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/colors';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof TouchableOpacity> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  disabled,
  style,
  className,
  ...props
}: ButtonProps) {
  const baseStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary.DEFAULT,
      shadowColor: colors.primary.DEFAULT,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 3,
    },
    secondary: {
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.primary.DEFAULT,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.error.bg,
      borderWidth: 1,
      borderColor: colors.error.border,
    },
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, minHeight: 36 },
    md: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 44 },
    lg: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md + 2, minHeight: 52 },
  };

  const textStyles: Record<string, TextStyle> = {
    primary: { color: colors.primary.foreground, fontWeight: '600' as const },
    secondary: { color: colors.text.primary, fontWeight: '600' as const },
    outline: { color: colors.primary.DEFAULT, fontWeight: '600' as const },
    ghost: { color: colors.primary.DEFAULT, fontWeight: '500' as const },
    danger: { color: colors.error.DEFAULT, fontWeight: '600' as const },
  };

  const textSizeStyles: Record<string, TextStyle> = {
    sm: { fontSize: typography.sm, letterSpacing: typography.wideTracking },
    md: { fontSize: typography.md, letterSpacing: typography.wideTracking },
    lg: { fontSize: typography.lg, letterSpacing: typography.wideTracking },
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      {...props}
      disabled={isDisabled}
      style={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && { width: '100%' },
        isDisabled && { opacity: 0.5 },
        style,
      ] as ViewStyle[]}
      activeOpacity={0.85}
    >
      {loading ? (
        <Text
          style={[
            { color: variant === 'outline' || variant === 'ghost' ? colors.primary.DEFAULT : colors.primary.foreground },
            textSizeStyles[size],
          ] as TextStyle[]}
        >
          Loading...
        </Text>
      ) : (
        <>
          {leftIcon}
          <Text style={[
            textStyles[variant],
            textSizeStyles[size],
          ] as TextStyle[]}>
            {children}
          </Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}