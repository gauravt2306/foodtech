import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { EmployeeNavigationProp, EmployeeStackParamList } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

// Type for UpiPayment route params
type UpiPaymentRouteProp = RouteProp<EmployeeStackParamList, 'UpiPayment'>;

export const UpiPaymentScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const route = useRoute<UpiPaymentRouteProp>();
  const { currentOrder, fetchOrder, isLoading } = useEmployeeStore();

  const [upiQrCode, setUpiQrCode] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchOrder(route.params.orderId);
  }, [route.params.orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.paymentMethod === 'Upi' && currentOrder.paymentStatus === 'pending') {
      generateUpiQr();
      startPolling();
    }
    return () => setPolling(false);
  }, [currentOrder]);

  const generateUpiQr = async () => {
    if (!currentOrder) return;
    setLoadingQr(true);
    try {
      // Use qrCodeData from order if available, otherwise construct UPI link
      if (currentOrder.qrCodeData) {
        setUpiQrCode(currentOrder.qrCodeData);
      } else {
        const vendorName = currentOrder.vendor?.businessName || 'FoodTech Vendor';
        const upiLink = `upi://pay?pa=vendor@foodtech&pn=${encodeURIComponent(vendorName)}&am=${(currentOrder.total / 100).toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order #${currentOrder.orderNumber}`)}`;
        setUpiQrCode(upiLink);
      }
    } catch (error) {
      console.error('Failed to generate UPI QR:', error);
    } finally {
      setLoadingQr(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      if (!polling) {
        clearInterval(interval);
        return;
      }
      try {
        // fetchOrder updates the store, we need to check from the store
        // This is a simplified approach - in real app, you'd refetch
        // For now, we'll just check the current order in the store
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      setPolling(false);
    };
  };

  const handleCheckStatus = async () => {
    // In a real app, this would call an API to check payment status
    // For now, we just navigate back to order detail
    navigation.navigate('EmployeeOrderDetail', { orderId: route.params.orderId });
  };

  if (isLoading && !currentOrder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order...</Text>
      </SafeAreaView>
    );
  }

  if (!currentOrder) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Order not found</Text>
      </SafeAreaView>
    );
  }

  const order = currentOrder;

  if (order.paymentMethod !== 'Upi') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorCard}>
          <Ionicons name="cash" size={48} color={colors.warning.DEFAULT} style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Not a UPI Order</Text>
          <Text style={styles.errorText}>This order uses {order.paymentMethod?.toUpperCase()} payment method.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>← Back to Order</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (order.paymentStatus === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success.DEFAULT} style={styles.successIcon} />
          <Text style={styles.successTitle}>Payment Completed</Text>
          <Text style={styles.successText}>Your payment of ₹{(order.total / 100).toFixed(2)} has been confirmed.</Text>
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('EmployeeOrderDetail', { orderId: order.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>View Order Details</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderAmount}>₹{(order.total / 100).toFixed(2)}</Text>
          </View>
          <Text style={styles.orderVendor}>{order.vendor?.businessName || 'Unknown Vendor'}</Text>
          <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString()}</Text>
        </View>

        {/* UPI Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPI Payment</Text>

          {paymentStatus === 'pending' && (
            <>
              {loadingQr ? (
                <View style={styles.qrLoading}>
                  <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
                  <Text style={styles.qrLoadingText}>Generating UPI QR Code...</Text>
                </View>
              ) : upiQrCode ? (
                <View style={styles.qrContainer}>
                  <Text style={styles.qrInstruction}>Scan with any UPI app (GPay, PhonePe, Paytm, etc.)</Text>
                  <View style={styles.qrCodeWrapper}>
                    {/* In a real app, use react-native-qrcode-svg to render the QR code */}
                    <View style={styles.qrCodePlaceholder}>
                      <Ionicons name="qr-code" size={48} color={colors.text.primary} style={styles.qrPlaceholderIcon} />
                      <Text style={styles.qrPlaceholderLabel}>UPI QR Code</Text>
                      <Text style={styles.qrPlaceholderAmount}>₹{(order.total / 100).toFixed(2)}</Text>
                    </View>
                  </View>
                  <View style={styles.upiDetails}>
                    <Text style={styles.upiDetailLabel}>Amount:</Text>
                    <Text style={styles.upiDetailValue}>₹{(order.total / 100).toFixed(2)}</Text>
                  </View>
                  <Text style={styles.qrNote}>Complete the payment in your UPI app, then tap "Check Payment Status"</Text>
                </View>
              ) : (
                <View style={styles.qrError}>
                  <Text style={styles.qrErrorText}>Failed to generate QR code</Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={generateUpiQr}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.checkStatusButton, polling && styles.checkStatusButtonPolling]}
                onPress={handleCheckStatus}
                disabled={polling}
                activeOpacity={0.8}
              >
                {polling ? (
                  <>
                    <ActivityIndicator color={colors.success.foreground} size="small" />
                    <Text style={styles.checkStatusButtonText}>Checking Status...</Text>
                  </>
                ) : (
                  <Text style={styles.checkStatusButtonText}>Check Payment Status</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.codButton}
                onPress={handleCheckStatus}
                activeOpacity={0.8}
              >
                <Ionicons name="cash" size={18} color={colors.primary.DEFAULT} style={styles.codButtonIcon} />
                <Text style={styles.codButtonText}>Pay with Cash Instead</Text>
              </TouchableOpacity>
            </>
          )}

          {paymentStatus === 'failed' && (
            <View style={styles.failedCard}>
              <Ionicons name="close-circle" size={48} color={colors.error.DEFAULT} style={styles.failedIcon} />
              <Text style={styles.failedTitle}>Payment Failed</Text>
              <Text style={styles.failedText}>The payment was not completed. Please try again or choose Cash on Delivery.</Text>
              <TouchableOpacity
                style={styles.retryPaymentButton}
                onPress={generateUpiQr}
                activeOpacity={0.8}
              >
                <Text style={styles.retryPaymentButtonText}>Try UPI Payment Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.codButton}
                onPress={handleCheckStatus}
                activeOpacity={0.8}
              >
                <Ionicons name="cash" size={18} color={colors.primary.DEFAULT} style={styles.codButtonIcon} />
                <Text style={styles.codButtonText}>Pay with Cash Instead</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Pay</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Open your UPI app (GPay, PhonePe, Paytm, BHIM, etc.)</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Scan the QR code above or enter the UPI ID manually</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Enter your UPI PIN to authorize the payment</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Tap "Check Payment Status" to confirm</Text>
            </View>
          </View>
        </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  orderCard: {
    backgroundColor: colors.primary.dark,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.primary.foreground,
  },
  orderAmount: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.primary.foreground,
  },
  orderVendor: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.primaryLight,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.primary.DEFAULT,
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
  qrLoading: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  qrLoadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  qrContainer: {
    gap: spacing.md,
  },
  qrInstruction: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  qrCodeWrapper: {
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: radius.xl,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  qrPlaceholderIcon: {},
  qrPlaceholderLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  qrPlaceholderAmount: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.primary.dark,
  },
  upiDetails: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  upiDetailLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upiDetailValue: {
    fontFamily: typography.mono,
    fontSize: typography.md,
    fontWeight: '500',
    color: colors.text.primary,
  },
  qrNote: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  checkStatusButtonPolling: {
    backgroundColor: colors.border.subtle,
  },
  checkStatusButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
  codButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  codButtonIcon: {},
  codButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.DEFAULT,
  },
  qrError: {
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  qrErrorText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.error.DEFAULT,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.dark,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  errorCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  errorIcon: {},
  errorTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.dark,
    borderRadius: radius.lg,
  },
  backButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  successCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.success.bg,
    borderRadius: radius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.success.bg,
  },
  successIcon: {},
  successTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.success.dark,
  },
  successText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.success.dark,
    textAlign: 'center',
  },
  doneButton: {
    paddingHorizontal: spacing['3xl'],
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.xl,
  },
  doneButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
  failedCard: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.error.bg,
    borderRadius: radius.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.error.bg,
  },
  failedIcon: {},
  failedTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.error.dark,
  },
  failedText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.error.dark,
    textAlign: 'center',
  },
  retryPaymentButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.dark,
    borderRadius: radius.lg,
  },
  retryPaymentButtonText: {
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