'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '@/constants/colors';

interface QuantitySelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

const sizeConfig = {
  sm: { buttonSize: 28, fontSize: 13, width: 32 },
  md: { buttonSize: 36, fontSize: 15, width: 44 },
  lg: { buttonSize: 44, fontSize: 17, width: 56 },
};

export const QuantitySelector = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  disabled = false,
  size = 'md',
  showLabel = false,
  label,
}: QuantitySelectorProps) => {
  const config = sizeConfig[size];
  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <View style={[styles.container, showLabel && styles.withLabel]}>
      {showLabel && label && (
        <Text style={[styles.label, { fontSize: config.fontSize - 2 }]}>{label}</Text>
      )}
      <View style={[styles.selector, { height: config.buttonSize }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { width: config.buttonSize, height: config.buttonSize },
            !canDecrement && styles.buttonDisabled,
          ]}
          onPress={onDecrement}
          disabled={!canDecrement}
          activeOpacity={0.7}
          accessibilityLabel="Decrease quantity"
        >
          <Ionicons name="remove" size={config.fontSize} color={canDecrement ? colors.text.primary : colors.text.muted} />
        </TouchableOpacity>
        <Text
          style={[
            styles.value,
            { fontSize: config.fontSize, minWidth: config.width, lineHeight: config.buttonSize },
          ]}
        >
          {value}
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            { width: config.buttonSize, height: config.buttonSize },
            !canIncrement && styles.buttonDisabled,
          ]}
          onPress={onIncrement}
          disabled={!canIncrement}
          activeOpacity={0.7}
          accessibilityLabel="Increase quantity"
        >
          <Ionicons name="add" size={config.fontSize} color={canIncrement ? colors.primary.DEFAULT : colors.text.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  withLabel: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  label: {
    fontFamily: typography.sansMedium,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 9999,
    paddingHorizontal: 4,
    gap: 4,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 9999,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    fontFamily: typography.sansSemiBold,
    color: colors.text.primary,
    textAlign: 'center',
  },
});