'use client';

import { View, ViewStyle, StyleSheet } from 'react-native';
import { useSharedValue, withTiming, withRepeat, Easing, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { colors, radius } from '@/constants/colors';

interface SkeletonProps {
  style?: ViewStyle;
  className?: string;
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'rect' | 'circle' | 'text' | 'card';
}

export function Skeleton({ style, className, width = '100%', height, borderRadius, variant = 'rect' }: SkeletonProps) {
  const animation = useSharedValue(0);

  animation.value = withRepeat(
    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );

  const baseColor = colors.background.tertiary;
  const highlightColor = colors.background.secondary;

  const getStyle = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: baseColor,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'circle':
        return { ...base, borderRadius: 9999, aspectRatio: 1 };
      case 'text':
        return { ...base, borderRadius: radius.sm, height: height || 16 };
      case 'card':
        return { ...base, borderRadius: radius['2xl'], height: height || 200 };
      default:
        return { ...base, borderRadius: borderRadius ?? radius.md };
    }
  };

  const shimmerStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFill,
    backgroundColor: highlightColor,
    transform: [
      { translateX: interpolate(animation.value, [0, 1], [-100, 100]) },
      { skewX: '-15deg' },
    ],
    width: '50%',
  }));

  return (
    <View style={[{ width, ...getStyle() }, style] as ViewStyle[]}>
      <Animated.View style={[{ ...StyleSheet.absoluteFill, backgroundColor: baseColor }]}>
        <Animated.View style={shimmerStyle} />
      </Animated.View>
    </View>
  );
}