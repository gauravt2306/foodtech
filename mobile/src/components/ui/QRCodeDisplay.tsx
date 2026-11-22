'use client';

import { View, Text, ViewStyle, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSharedValue, withTiming, withRepeat, Easing, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import { colors } from '@/constants/colors';

interface QRCodeDisplayProps {
  data: string;
  size?: number;
  orderNumber?: string;
  showLabel?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function QRCodeDisplay({
  data,
  size = 280,
  orderNumber,
  showLabel = true,
  onRefresh,
  className,
}: QRCodeDisplayProps) {
  const pulseAnim = useSharedValue(0);

  pulseAnim.value = withRepeat(
    withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );

  const containerStyle = {
    alignItems: 'center',
    gap: 16,
  } as ViewStyle;

  const qrContainerStyle = useAnimatedStyle(() => ({
    width: size + 32,
    height: size + 32,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(pulseAnim.value, [0, 1], [0.1, 0.3]),
    shadowRadius: interpolate(pulseAnim.value, [0, 1], [10, 20]),
    elevation: 10,
  }));

  return (
    <View style={[containerStyle] as ViewStyle[]}>
      <Animated.View style={qrContainerStyle}>
        <QRCode
          value={data}
          size={size}
          color='#FFFFFF'
          backgroundColor='#0F172A'
        />
      </Animated.View>

      {orderNumber && showLabel && (
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: '#1E293B',
            fontFamily: 'monospace',
            letterSpacing: 2,
          }}>
            {orderNumber}
          </Text>
          <Text style={{
            fontSize: 13,
            color: '#9CA3AF',
            fontWeight: '500',
          }}>
            Scan at counter for pickup
          </Text>
        </View>
      )}

      {onRefresh && (
        <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
            QR refreshes every 30s for security
          </Text>
        </View>
      )}
    </View>
  );
}