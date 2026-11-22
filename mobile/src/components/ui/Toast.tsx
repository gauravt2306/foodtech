'use client';

/* eslint-disable react-hooks/refs */

import React from 'react';
import { Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const ICONS: Record<ToastType, string> = {
  success: 'checkmark-circle',
  error: 'close-circle',
  info: 'information-circle',
  warning: 'alert-circle',
};

const COLORS: Record<ToastType, { bg: string; text: string; icon: string }> = {
  success: { bg: colors.success.bg, text: colors.success.DEFAULT, icon: colors.success.DEFAULT },
  error: { bg: colors.error.bg, text: colors.error.DEFAULT, icon: colors.error.DEFAULT },
  info: { bg: colors.info.bg, text: colors.info.DEFAULT, icon: colors.info.DEFAULT },
  warning: { bg: colors.warning.bg, text: colors.warning.DEFAULT, icon: colors.warning.DEFAULT },
};

export const Toast = ({ visible, message, type = 'success', duration = 3000, onClose }: ToastProps) => {
  const fadeAnim = React.useRef(new Animated.Value(0));
  const translateAnim = React.useRef(new Animated.Value(50));

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim.current, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateAnim.current, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim.current, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim.current, {
            toValue: -50,
            duration: 250,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const { bg, text, icon } = COLORS[type];

  const animatedStyle = [
    styles.toast,
    {
      backgroundColor: bg,
      borderColor: icon,
      opacity: fadeAnim.current,
      transform: [{ translateY: translateAnim.current }],
    },
  ];

  return (
    <Animated.View
      style={animatedStyle}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Ionicons name={ICONS[type] as any} size={20} color={icon} style={styles.icon} />
      <Text style={[styles.message, { color: text }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
    zIndex: 1000,
  },
  icon: {
    flexShrink: 0,
  },
  message: {
    fontFamily: typography.sansMedium,
    fontSize: 14,
    flex: 1,
  },
});

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: ToastType; duration: number }[]>([]);

  const toastIdRef = React.useRef(0);

  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    toastIdRef.current += 1;
    const id = `${toastIdRef.current}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          visible={true}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};