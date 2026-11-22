'use client';

import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { forwardRef, ForwardedRef } from 'react';
import { colors, radius, spacing } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
}

const baseShadow = {
  shadowColor: colors.shadow.color,
  shadowOffset: colors.shadow.offset,
  shadowOpacity: colors.shadow.opacity,
  shadowRadius: colors.shadow.radius,
  elevation: colors.shadow.elevation,
};

const elevationStyles: Record<number, ViewStyle> = {
  0: { shadowOpacity: 0 },
  1: { ...baseShadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  2: { ...baseShadow, elevation: 4 },
  3: { ...baseShadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
};

export const Card = forwardRef<any, CardProps>(({
  children,
  style,
  className,
  onPress,
  elevation = 1,
  padding = 'md',
  variant = 'default',
  ...props
}, ref: ForwardedRef<any>) => {
  const paddingStyles: Record<string, ViewStyle> = {
    none: {},
    sm: { padding: spacing.sm },
    md: { padding: spacing.md },
    lg: { padding: spacing.lg },
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.default,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.border.default,
    },
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      ref={ref}
      {...props}
      onPress={onPress}
      style={[
        {
          borderRadius: radius['2xl'],
        },
        variantStyles[variant],
        elevationStyles[elevation],
        paddingStyles[padding],
        style,
      ] as ViewStyle[]}
      activeOpacity={0.9}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';