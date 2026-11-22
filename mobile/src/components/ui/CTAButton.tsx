'use client';

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors, radius, typography } from '@/constants/colors';

interface CTAButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'secondary';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: any;
}

const sizeStyles = {
  sm: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg },
  md: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl },
  lg: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: radius['2xl'] },
};

const sizeTextStyles = {
  sm: { fontSize: typography.sm, letterSpacing: typography.wideTracking },
  md: { fontSize: typography.md, letterSpacing: typography.wideTracking },
  lg: { fontSize: typography.lg, letterSpacing: typography.wideTracking },
};

const primaryShadow = {
  shadowColor: colors.shadow.color,
  shadowOffset: colors.shadow.offset,
  shadowOpacity: colors.shadow.opacity,
  shadowRadius: colors.shadow.radius,
  elevation: colors.shadow.elevation,
};

export const CTAButton = React.forwardRef<React.ElementRef<typeof TouchableOpacity>, CTAButtonProps>(
  (
    {
      children,
      onPress,
      disabled = false,
      fullWidth = false,
      size = 'md',
      variant = 'primary',
      loading = false,
      leftIcon,
      style,
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const opacity = isDisabled ? 0.5 : 1;

    if (variant === 'outline') {
      return (
        <TouchableOpacity
          ref={ref}
          style={[
            styles.outlineContainer,
            sizeStyles[size],
            fullWidth && styles.fullWidth,
            style,
            { opacity },
          ]}
          onPress={isDisabled ? undefined : onPress}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={styles.loadingSpinner} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {leftIcon}
              <Text style={[styles.outlineText, sizeTextStyles[size], { color: isDisabled ? colors.text.muted : colors.primary.DEFAULT }]}>
                {children}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (variant === 'secondary') {
      return (
        <TouchableOpacity
          ref={ref}
          style={[
            styles.secondaryContainer,
            sizeStyles[size],
            fullWidth && styles.fullWidth,
            style,
            { opacity },
          ]}
          onPress={isDisabled ? undefined : onPress}
          activeOpacity={0.8}
        >
          {loading ? (
            <View style={[styles.loadingSpinner, { borderColor: colors.text.primary }]} />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {leftIcon}
              <Text style={[styles.secondaryText, sizeTextStyles[size], { color: isDisabled ? colors.text.muted : colors.text.primary }]}>
                {children}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    // Primary variant - standard corporate blue
    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.primaryContainer,
          sizeStyles[size],
          fullWidth && styles.fullWidth,
          style,
          { opacity },
        ]}
        onPress={isDisabled ? undefined : onPress}
        activeOpacity={0.8}
      >
        {loading ? (
          <View style={styles.loadingSpinner} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {leftIcon}
            <Text style={[styles.primaryText, sizeTextStyles[size]]}>
              {children}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

CTAButton.displayName = 'CTAButton';

const styles = StyleSheet.create({
  primaryContainer: {
    backgroundColor: colors.primary.DEFAULT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...primaryShadow,
  },
  secondaryContainer: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  outlineContainer: {
    borderWidth: 1.5,
    borderColor: colors.primary.DEFAULT,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontFamily: typography.sans,
    fontWeight: '600' as const,
    color: colors.primary.foreground,
    textTransform: 'none',
  },
  secondaryText: {
    fontFamily: typography.sans,
    fontWeight: '600' as const,
    textTransform: 'none',
    textAlign: 'center',
  },
  outlineText: {
    fontFamily: typography.sans,
    fontWeight: '600' as const,
    textTransform: 'none',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary.foreground,
    borderTopColor: 'transparent',
  },
});