'use client';

import { Modal as RNModal, View, ViewStyle, TouchableWithoutFeedback, StyleSheet, Animated } from 'react-native';
import { useSharedValue, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { colors, radius, spacing } from '@/constants/colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  closeOnOverlayPress?: boolean;
  showHandle?: boolean;
  className?: string;
}

const modalShadow = {
  shadowColor: colors.shadow.color,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.2,
  shadowRadius: 25,
  elevation: 10,
};

export function Modal({
  visible,
  onClose,
  children,
  size = 'md',
  closeOnOverlayPress = true,
  showHandle = true,
  className,
}: ModalProps) {
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(1);

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { maxWidth: '85%', maxHeight: '70%' },
    md: { maxWidth: '90%', maxHeight: '80%' },
    lg: { maxWidth: '95%', maxHeight: '90%' },
    full: { width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%', borderRadius: 0 },
  };

  if (visible) {
    fadeAnim.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.ease) });
    slideAnim.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
  } else {
    fadeAnim.value = withTiming(0, { duration: 150, easing: Easing.in(Easing.ease) });
    slideAnim.value = withTiming(1, { duration: 200, easing: Easing.in(Easing.ease) });
  }

  const overlayStyle = StyleSheet.absoluteFill;
  const modalContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  };

  const fadeAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: colors.surface.overlay,
    opacity: fadeAnim.value,
  }));

  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value * 100 }],
  }));

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={closeOnOverlayPress ? onClose : undefined} accessibilityElementsHidden={!closeOnOverlayPress}>
        <Animated.View
          style={[
            overlayStyle,
            fadeAnimatedStyle,
          ] as ViewStyle[]}
        />
      </TouchableWithoutFeedback>
      <Animated.View style={modalContainerStyle}>
        <Animated.View
          style={[
            {
              width: '100%',
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border.default,
              borderRadius: size === 'full' ? 0 : radius['2xl'],
              maxHeight: '90%',
              overflow: 'hidden',
              ...modalShadow,
            },
            sizeStyles[size],
            slideAnimatedStyle,
          ] as ViewStyle[]}
        >
          {showHandle && size !== 'full' && (
            <View style={{ alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.sm }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border.default,
                }}
              />
            </View>
          )}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}