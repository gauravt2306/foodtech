'use client';

import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingOverlay({ visible, message = 'Loading...', fullScreen = true, className }: LoadingOverlayProps) {
  if (!visible) return null;

  const baseOverlayStyle: any = {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  if (!fullScreen) {
    baseOverlayStyle.position = 'absolute';
  }

  return (
    <View style={baseOverlayStyle}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  text: {
    fontFamily: typography.sansMedium,
    fontSize: 16,
    color: colors.text.primary,
  },
});