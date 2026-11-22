'use client';

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { employeeApi } from '@/services/employee';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

export default function PaymentScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { orderId, amount, orderNumber } = useLocalSearchParams<{
    orderId: string;
    amount: string;
    orderNumber: string;
  }>();

  const [processing, setProcessing] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const paymentMutation = useMutation({
    mutationFn: (upiId: string) => employeeApi.initiateUpiPayment(orderId!, upiId),
    onSuccess: (response) => {
      setProcessing(false);
      setShowSuccess(true);
      // Auto-navigate after 2 seconds
      setTimeout(() => {
        router.replace(`/employee/order-detail?id=${orderId}`);
      }, 2000);
    },
    onError: (error: any) => {
      setProcessing(false);
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Payment failed. Please try again.';
      Alert.alert('Payment Failed', message);
    },
  });

  const handlePay = () => {
    if (processing) return;
    setProcessing(true);
    // Simulate UPI payment with a mock UPI ID
    const mockUpiId = `user@upi`;
    paymentMutation.mutate(mockUpiId);
  };

  const totalAmount = parseInt(amount || '0', 10);

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success.DEFAULT} />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtext}>Redirecting to order details...</Text>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={styles.spinner} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="card" size={48} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.headerTitle}>UPI Payment</Text>
            <Text style={styles.headerSubtitle}>Order #{orderNumber}</Text>
          </View>
        </View>

        <Card style={styles.amountCard} padding="lg">
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>{formatCurrency(totalAmount)}</Text>
        </Card>

        <Card style={styles.upiCard} padding="md">
          <View style={styles.upiRow}>
            <View style={styles.upiIcon}>
              <Ionicons name="logo-google" size={28} color={colors.primary.DEFAULT} />
            </View>
            <View style={styles.upiInfo}>
              <Text style={styles.upiName}>Google Pay</Text>
              <Text style={styles.upiDesc}>Pay with your saved UPI ID</Text>
            </View>
          </View>
          <View style={styles.upiRow}>
            <View style={styles.upiIcon}>
              <Ionicons name="phone-portrait" size={28} color={colors.primary.DEFAULT} />
            </View>
            <View style={styles.upiInfo}>
              <Text style={styles.upiName}>PhonePe</Text>
              <Text style={styles.upiDesc}>Pay with PhonePe UPI</Text>
            </View>
          </View>
          <View style={styles.upiRow}>
            <View style={styles.upiIcon}>
              <Ionicons name="logo-paypal" size={28} color={colors.primary.DEFAULT} />
            </View>
            <View style={styles.upiInfo}>
              <Text style={styles.upiName}>Paytm</Text>
              <Text style={styles.upiDesc}>Pay with Paytm UPI</Text>
            </View>
          </View>
        </Card>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary.DEFAULT} />
          <Text style={styles.infoText}>
            This is a demo payment. Tap "Pay Now" to simulate a successful UPI transaction.
          </Text>
        </View>

        <CTAButton
          size="lg"
          fullWidth
          loading={processing}
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
        </CTAButton>

        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.replace(`/employee/order-detail?id=${orderId}`)}
          style={styles.cancelBtn}
        >
          Cancel & View Order
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingBottom: 140,
    justifyContent: 'space-between',
  },
  heroSection: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
  },
  amountCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  amountLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  amountValue: {
    fontFamily: typography.sansBold,
    fontSize: 40,
    color: colors.primary.DEFAULT,
    textAlign: 'center',
  },
  upiCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  upiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  upiIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upiInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  upiName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  upiDesc: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  infoBox: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  infoText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },
  cancelBtn: {
    marginTop: spacing.md,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  successContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.success.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: 'center',
  },
  successSubtext: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.md,
  },
});