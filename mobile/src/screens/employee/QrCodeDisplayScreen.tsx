import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { EmployeeNavigationProp, EmployeeStackParamList } from '@/navigation/types';
import { useEmployeeStore } from '@/store/employeeStore';
import { Order, OrderStatus } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const QrCodeDisplayScreen = () => {
  const navigation = useNavigation<EmployeeNavigationProp>();
  const route = useRoute<RouteProp<EmployeeStackParamList, 'QrCodeDisplay'>>();
  const { currentOrder, fetchOrder, isLoading, clearCurrentOrder } = useEmployeeStore();

  const [qrCodeData, setQrCodeData] = useState<{ qrToken: string; expiresAt: string } | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    fetchOrder(route.params.orderId);
    return () => clearCurrentOrder();
  }, [route.params.orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.status === 'ready') {
      loadQrCode();
    }
  }, [currentOrder]);

  const loadQrCode = async () => {
    setLoadingQr(true);
    try {
      // Use the API directly since getQrCode is not in employeeStore
      const apiClient = (await import('@/api/client')).apiClient;
      const data = await apiClient.getOrderQR(route.params.orderId);
      setQrCodeData(data);
    } catch (err: any) {
      // Error handled silently
    } finally {
      setLoadingQr(false);
    }
  };

  const handleRefreshQr = async () => {
    await loadQrCode();
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

  if (order.status !== 'ready') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notReadyCard}>
          <Ionicons name="bag-handle" size={48} color={colors.warning.DEFAULT} style={styles.notReadyIcon} />
          <Text style={styles.notReadyTitle}>Order Not Ready for Pickup</Text>
          <Text style={styles.notReadyText}>
            This order is currently <Text style={styles.statusHighlight}>{order.status}</Text>.
            The QR code will be available when the order status changes to "Ready".
          </Text>
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

  // Use route params if provided, otherwise fetch from API
  const displayQrToken = route.params.qrToken || qrCodeData?.qrToken || order.qrCodeData;
  const displayExpiresAt = route.params.expiresAt || qrCodeData?.expiresAt;
  const vendorName = order.vendor?.businessName || 'Unknown Vendor';
  const vendorPhone = order.vendor?.phone || 'N/A';
  const vendorAddress = order.vendor?.address
    ? `${order.vendor.address.street || ''}, ${order.vendor.address.city || ''}, ${order.vendor.address.state || ''}`.replace(/^, |, $/g, '')
    : 'N/A';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Order Header */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success.bg }]}>
              <Ionicons name="bag-handle" size={14} color={colors.success.dark} style={styles.statusIcon} />
              <Text style={styles.statusText}>Ready for Pickup</Text>
            </View>
          </View>
          <Text style={styles.orderVendor}>{vendorName}</Text>
          <Text style={styles.orderTime}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>
          <Text style={styles.orderAmount}>Total: ₹{(order.total / 100).toFixed(2)}</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>QR Code for Pickup</Text>
          </View>

          {loadingQr ? (
            <View style={styles.qrLoading}>
              <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
              <Text style={styles.qrLoadingText}>Loading QR code...</Text>
            </View>
          ) : displayQrToken ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrInstruction}>Show this QR code to the vendor for order handoff</Text>

              <View style={styles.qrCodeWrapper}>
                <View style={styles.qrCodeCard}>
                  {/* In a real app, use react-native-qrcode-svg to render the actual QR code */}
                  <View style={styles.qrCodePlaceholder}>
                    <Ionicons name="qr-code" size={48} color={colors.text.primary} style={styles.qrPlaceholderIcon} />
                    <Text style={styles.qrTokenLabel}>QR Token:</Text>
                    <Text style={styles.qrTokenValue}>{displayQrToken}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.qrDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expires:</Text>
                  <Text style={styles.detailValue}>{displayExpiresAt ? new Date(displayExpiresAt).toLocaleString() : 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Order ID:</Text>
                  <Text style={styles.detailValue}>{order.id.slice(0, 8)}...</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Vendor:</Text>
                  <Text style={styles.detailValue}>{vendorName}</Text>
                </View>
              </View>

              <Text style={styles.qrNote}>
                This QR code is unique to this order and expires at the time shown above.
                Do not share this code with anyone except the vendor.
              </Text>

              <TouchableOpacity
                style={styles.refreshButton}
                onPress={handleRefreshQr}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={18} color={colors.primary.DEFAULT} style={styles.refreshButtonIcon} />
                <Text style={styles.refreshButtonText}>Regenerate QR Code</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.qrError}>
              <Text style={styles.qrErrorText}>Failed to load QR code</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={loadQrCode}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Instructions</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Go to the vendor location shown in the order details</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Show this QR code to the vendor or their staff</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>The vendor will scan the code to verify and hand off your order</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>Confirm you received the correct items</Text>
            </View>
          </View>
        </View>

        {/* Vendor Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Contact</Text>
          <View style={styles.vendorContact}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color={colors.primary.DEFAULT} style={styles.contactIcon} />
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{vendorPhone}</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={colors.primary.DEFAULT} style={styles.contactIcon} />
              <Text style={styles.contactLabel}>Address</Text>
              <Text style={styles.contactValue}>{vendorAddress}</Text>
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
    backgroundColor: colors.success.DEFAULT,
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
    fontSize: typography['2xl'],
    color: colors.success.foreground,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusIcon: {},
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.success.dark,
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
  orderAmount: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.success.foreground,
    marginTop: spacing.xs,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
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
    alignItems: 'center',
  },
  qrInstruction: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  qrCodeWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  qrCodeCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    width: 280,
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    gap: spacing.md,
  },
  qrPlaceholderIcon: {},
  qrTokenLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrTokenValue: {
    fontFamily: typography.mono,
    fontSize: typography.sm,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 1,
  },
  qrDetails: {
    width: '100%',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  detailValue: {
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  qrNote: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    width: '100%',
  },
  refreshButtonIcon: {},
  refreshButtonText: {
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
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.lg,
  },
  retryButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  notReadyCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  notReadyIcon: {},
  notReadyTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  notReadyText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  statusHighlight: {
    fontFamily: typography.sansBold,
    color: colors.warning.DEFAULT,
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
  vendorContact: {
    gap: spacing.md,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  contactIcon: {
    marginRight: spacing.xs,
  },
  contactLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.DEFAULT,
    minWidth: 80,
  },
  contactValue: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.secondary,
    flex: 1,
  },
});