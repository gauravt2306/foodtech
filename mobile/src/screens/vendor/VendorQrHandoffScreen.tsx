import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { VendorNavigationProp, VendorStackParamList } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type VendorQrHandoffRouteProp = RouteProp<VendorStackParamList, 'VendorQrHandoff'>;

export const VendorQrHandoffScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const route = useRoute<VendorQrHandoffRouteProp>();
  const { handoffOrder, isLoading, error, clearError } = useVendorStore();

  const [qrToken, setQrToken] = useState('');
  const [errors, setErrors] = useState<{ qrToken?: string }>({});
  const [handoffResult, setHandoffResult] = useState<{ handoffAt?: string; handoffBy?: string; message?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: { qrToken?: string } = {};
    if (!qrToken.trim()) newErrors.qrToken = 'QR token is required';
    else if (qrToken.trim().length < 10) newErrors.qrToken = 'Invalid QR token';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleHandoff = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const result = await handoffOrder(route.params.orderId, qrToken.trim());
      setHandoffResult(result);
      // Alert removed for UX
    } catch (err: any) {
      // Error handled by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleScanQr = () => {
    // In a real app, this would open the camera to scan QR code
    Alert.alert(
      'Scan QR Code',
      'QR scanning would open the camera here. For now, please enter the token manually.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>QR Handoff Verification</Text>
          <Text style={styles.subtitle}>Scan or enter the customer's QR token to complete the handoff</Text>
        </View>

        {handoffResult && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success.DEFAULT} style={styles.successIcon} />
            <Text style={styles.successTitle}>Handoff Complete!</Text>
            <View style={styles.successDetails}>
              {handoffResult.handoffAt && (
                <Text style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Handoff Time: </Text>
                  {new Date(handoffResult.handoffAt).toLocaleString()}
                </Text>
              )}
              {handoffResult.handoffBy && (
                <Text style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Handoff By: </Text>
                  {handoffResult.handoffBy}
                </Text>
              )}
              {handoffResult.message && (
                <Text style={styles.successDetail}>
                  <Text style={styles.successDetailLabel}>Message: </Text>
                  {handoffResult.message}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {!handoffResult && (
          <>
            {/* QR Input */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Enter QR Token</Text>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[styles.input, errors.qrToken && styles.inputError]}
                  value={qrToken}
                  onChangeText={text => { setQrToken(text); if (errors.qrToken) setErrors(prev => { const next = { ...prev }; delete next.qrToken; return next; }); }}
                  placeholder="Enter QR token from customer"
                  autoCapitalize="none"
                  returnKeyType="go"
                  onSubmitEditing={handleHandoff}
                />
                {errors.qrToken && <Text style={styles.errorText}>{errors.qrToken}</Text>}
              </View>

              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanQr}
                activeOpacity={0.8}
              >
                <Ionicons name="qr-code" size={18} color={colors.primary.DEFAULT} style={styles.scanButtonIcon} />
                <Text style={styles.scanButtonText}>Scan QR Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleHandoff}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color={colors.primary.foreground} size="large" />
                ) : (
                  <Text style={styles.submitButtonText}>Verify & Handoff</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How it Works</Text>
              <View style={styles.stepsContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Customer shows QR code from their app</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Scan the QR code or enter the token manually</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Verify and complete the handoff</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: colors.success.bg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.success.DEFAULT,
  },
  successIcon: {},
  successTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.success.dark,
  },
  successDetails: {
    gap: spacing.sm,
    width: '100%',
  },
  successDetail: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.success.dark,
  },
  successDetailLabel: {
    fontFamily: typography.sansBold,
  },
  doneButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.lg,
  },
  doneButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing.sm,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontFamily: typography.sans,
    fontSize: typography.md,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.bg,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.error.DEFAULT,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  scanButtonIcon: {},
  scanButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.DEFAULT,
  },
  submitButton: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border.subtle,
  },
  submitButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  stepsContainer: {
    gap: spacing.md,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontFamily: typography.sansBold,
    fontSize: typography.sm,
    color: colors.primary.foreground,
  },
  stepText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginTop: spacing.xs,
    flex: 1,
  },
});