'use client';

import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { colors, typography } from '@/constants/colors';

type BadgeVariant =
  | 'veg'
  | 'nonveg'
  | 'vegan'
  | 'gf'
  | 'default'
  | 'status'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dotColor?: string }> = {
  veg: { bg: colors.success.bg, text: colors.success.DEFAULT, dotColor: colors.success.DEFAULT },
  nonveg: { bg: colors.error.bg, text: colors.error.DEFAULT, dotColor: colors.error.DEFAULT },
  vegan: { bg: colors.info.bg, text: colors.info.DEFAULT, dotColor: colors.info.DEFAULT },
  gf: { bg: colors.warning.bg, text: colors.warning.DEFAULT, dotColor: colors.warning.DEFAULT },
  default: { bg: colors.background.tertiary, text: colors.text.secondary },
  status: { bg: colors.background.tertiary, text: colors.text.secondary },
  pending: { bg: colors.warning.bgMedium, text: colors.warning.DEFAULT },
  confirmed: { bg: colors.info.bgMedium, text: colors.info.DEFAULT },
  preparing: { bg: '#EDE9FE', text: '#8B5CF6' }, // Violet-100 / Violet-500
  ready: { bg: colors.success.bgMedium, text: colors.success.DEFAULT },
  completed: { bg: colors.gray[200], text: colors.gray[600] },
  cancelled: { bg: colors.error.bgMedium, text: colors.error.DEFAULT },
};

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4 },
  md: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 5 },
  lg: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
};

const textSizeStyles: Record<string, TextStyle> = {
  sm: { fontSize: 11, fontFamily: typography.sansSemiBold },
  md: { fontSize: 12, fontFamily: typography.sansSemiBold },
  lg: { fontSize: 13, fontFamily: typography.sansSemiBold },
};

export function Badge({ variant = 'default', label, children, size = 'md', style, className }: BadgeProps) {
  const { bg, text, dotColor } = variantStyles[variant];
  const content = children ?? label ?? variant.charAt(0).toUpperCase() + variant.slice(1);

  return (
    <View style={[{ backgroundColor: bg, flexDirection: 'row', alignItems: 'center' }, sizeStyles[size], style] as ViewStyle[]}>
      {(variant === 'veg' || variant === 'nonveg' || variant === 'vegan' || variant === 'gf') && dotColor && (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dotColor }} />
      )}
      <Text style={[{ color: text }, textSizeStyles[size]] as TextStyle[]}>
        {content}
      </Text>
    </View>
  );
}