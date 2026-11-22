'use client';

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, PermissionsAndroid, Platform, Linking } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { vendorApi } from '@/services/vendor';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography } from '@/constants/colors';

export default function QRScannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const [permissionStatus, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (permissionStatus?.status === 'granted') {
      setHasPermission(true);
    } else if (permissionStatus?.status === 'denied') {
      setHasPermission(false);
    }
  }, [permissionStatus]);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'FoodTech needs access to your camera to scan QR codes for order handoff.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
    } else {
      const { status } = await requestPermission();
      setHasPermission(status === 'granted');
    }
  };

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!scanning || processing) return;

    if (!result?.data) return;

    const qrToken = result.data.trim();
    if (!qrToken || qrToken === lastScanned) return;

    setProcessing(true);
    setLastScanned(qrToken);
    setScanning(false);

    try {
      if (orderId) {
        await vendorApi.handoffOrder(orderId, qrToken);
        Alert.alert('Success!', 'Order handed off to customer.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('QR Scanned', `Token: ${qrToken}`, [
          { text: 'OK', onPress: () => { setScanning(true); setProcessing(false); setLastScanned(null); } },
        ]);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Invalid or expired QR code';
      Alert.alert('Handoff Failed', message, [
        { text: 'Try Again', onPress: () => { setScanning(true); setProcessing(false); setLastScanned(null); } },
      ]);
    }
  };

  const toggleTorch = () => {
    setTorchOn(prev => !prev);
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        // Note: For gallery QR scanning, install expo-barcode-scanner
        // For now, we'll show a message
        Alert.alert(
          'Gallery Scanning',
          'Gallery QR scanning requires expo-barcode-scanner package. Please use the camera to scan the QR code directly.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.text.muted} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          FoodTech needs camera access to scan customer QR codes for order handoff.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestCameraPermission} activeOpacity={0.8}>
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={colors.error.DEFAULT} />
        <Text style={styles.permissionTitle}>Camera Access Denied</Text>
        <Text style={styles.permissionText}>
          Please enable camera permission in your device settings to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={openSettings} activeOpacity={0.8}>
          <Text style={styles.permissionBtnText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          flash={torchOn ? 'on' : 'off'}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        <View style={styles.overlay}>
          <View style={styles.scanFrame}>
            <View style={styles.corner} />
            <View style={styles.corner} />
            <View style={styles.corner} />
            <View style={styles.corner} />
          </View>
          <Text style={styles.scanText}>Align QR code within frame</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlBtn,
            torchOn && styles.controlBtnActive,
          ]}
          onPress={toggleTorch}
          activeOpacity={0.8}
          disabled={processing}
        >
          <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={28} color={colors.primary.foreground} />
          <Text style={styles.controlBtnText}>{torchOn ? 'Torch On' : 'Torch'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={pickFromGallery}
          activeOpacity={0.8}
          disabled={processing}
        >
          <Ionicons name="image-outline" size={28} color={colors.primary.foreground} />
          <Text style={styles.controlBtnText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => { setScanning(true); setLastScanned(null); }}
          activeOpacity={0.8}
          disabled={processing}
        >
          <Ionicons name="refresh" size={28} color={colors.primary.foreground} />
          <Text style={styles.controlBtnText}>Rescan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hint}>
        <Text style={styles.hintText}>
          {orderId ? 'Scan customer\'s QR code to complete handoff' : 'Scan any QR code to test'}
        </Text>
      </View>

      {processing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <Ionicons name="hourglass" size={32} color={colors.primary.DEFAULT} />
            <Text style={styles.processingText}>Validating QR code...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.background.inverse,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: colors.primary.DEFAULT,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
    borderColor: colors.primary.DEFAULT,
  },
  scanText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.text.inverse,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    paddingTop: 0,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  controlBtnActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  controlBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  hint: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  hintText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  processingContent: {
    backgroundColor: colors.surface.DEFAULT,
    padding: spacing.xl,
    borderRadius: radius.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  processingText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
    gap: spacing.lg,
  },
  permissionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 22,
    color: colors.text.primary,
  },
  permissionText: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionBtn: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  permissionBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.primary.foreground,
  },
});