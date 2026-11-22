'use client';

import React from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Linking } from 'react-native';
import { employeeApi, Order, OrderItem, UpiPaymentInitiateResponse } from '@/services/employee';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { QRCodeDisplay } from '@/components/ui/QRCodeDisplay';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime, getRelativeTime } from '@/utils/formatters';
import { getStatusConfig, getStatusInfo, OrderStatus } from '@/constants/orderStatus';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

export default function OrderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orderDetail', id],
    queryFn: () => employeeApi.getOrder(id!),
    enabled: !!id,
    staleTime: 10 * 1000,
    refetchInterval: (query) => {
      const order = query.state.data;
      if (order && ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)) {
        return 10 * 1000;
      }
      return false;
    },
  });

  const order = data;
  const [showQRModal, setShowQRModal] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [upiVpa, setUpiVpa] = React.useState('');
  const [isInitiatingPayment, setIsInitiatingPayment] = React.useState(false);

  const handleInitiateUpiPayment = async () => {
    if (!upiVpa.trim()) {
      Alert.alert('Error', 'Please enter your UPI VPA (e.g., user@upi)');
      return;
    }
    if (!id) return;

    setIsInitiatingPayment(true);
    try {
      const response: UpiPaymentInitiateResponse = await employeeApi.initiateUpiPayment(id, upiVpa.trim());
      // Open UPI deep link
      await Linking.openURL(response.upiDeepLink);
      setShowPaymentModal(false);
      setUpiVpa('');
      // Refetch to update payment status
      await refetch();
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Failed to initiate UPI payment');
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Order Details" showBack={true} showSearch={false} showProfile={false} />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Skeleton variant="card" height={120} style={styles.skeletonCard} />
          <Skeleton variant="card" height={100} style={styles.skeletonCard} />
          <Skeleton variant="card" height={200} style={styles.skeletonCard} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (isError || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Order Details" showBack={true} showSearch={false} showProfile={false} />
        <ScrollView contentContainerStyle={styles.emptyState}>
          <View style={styles.emptyIconWrapper}>
            <Text style={styles.emptyText}>⚠️</Text>
          </View>
          <Text style={styles.emptyTitle}>Failed to load order</Text>
          <Text style={styles.emptySubtext}>Pull to refresh or go back</Text>
          <CTAButton variant="outline" size="sm" onPress={() => router.back()}>Go Back</CTAButton>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const statusInfo = getStatusInfo(order.status);
  const canShowQR = ['ready', 'completed'].includes(order.status as OrderStatus);
  const canPay = order.paymentMethod === 'Upi' && order.paymentStatus.toLowerCase() === 'pending';

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Order Details" showBack={true} showSearch={false} showProfile={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={async () => { await refetch(); }}
            colors={[colors.primary.DEFAULT]}
            progressBackgroundColor={colors.surface.DEFAULT}
          />
        }
      >
        {/* Order Header */}
        <Card style={styles.headerCard} padding="md">
          <View style={styles.headerRow}>
            <View style={styles.headerInfo}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <Text style={styles.orderDate}>{formatDateTime(order.createdAt)}</Text>
            </View>
            <Badge variant={statusConfig.variant} size="md">
              {statusConfig.label}
            </Badge>
          </View>
          <View style={styles.vendorRow}>
            <View style={styles.vendorAvatar}>
              <Text style={styles.avatarText}>🏪</Text>
            </View>
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{order.vendorName || 'Unknown Vendor'}</Text>
              <Text style={styles.vendorMeta}>
                {order.pickupTime ? `Pickup: ${formatDateTime(order.pickupTime)}` : 'ASAP'} • {getRelativeTime(order.handoffAt || order.createdAt)}
              </Text>
            </View>
          </View>
          {order.specialInstructions && (
            <View style={styles.instructionsRow}>
              <Ionicons name="chatbubble" size={16} color={colors.primary.DEFAULT} />
              <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
            </View>
          )}
        </Card>

        {/* Items */}
        <Card style={styles.itemsCard} padding="md">
          <Text style={styles.sectionTitle}>Items ({order.items.length})</Text>
          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={(item: OrderItem, index) => item.menuItemId || String(index)}
            ListEmptyComponent={undefined}
            style={styles.itemsList}
          />
        </Card>

        {/* Price Breakdown */}
        <Card style={styles.priceCard} padding="md">
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>{formatCurrency(order.subtotal)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>GST (5%)</Text>
            <Text style={styles.priceValue}>{formatCurrency(order.taxAmount)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>{formatCurrency(0)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, styles.totalLabel]}>Total Paid</Text>
            <Text style={[styles.priceValue, styles.totalValue]}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              {order.paymentMethod === 'Upi' ? '📱 UPI' : '💵 Cash on Pickup'}
            </Text>
            <Badge
              variant={order.paymentStatus.toLowerCase() === 'paid' ? 'ready' : order.paymentStatus.toLowerCase() === 'pending' ? 'pending' : 'cancelled'}
              size="sm"
            >
              {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
            </Badge>
          </View>
          {order.paymentId && (
            <Text style={styles.paymentId}>Transaction ID: {order.paymentId}</Text>
          )}
        </Card>

        {/* UPI Payment Button */}
        {canPay && (
          <Card style={styles.paymentCard} padding="md">
            <View style={styles.paymentCardContent}>
              <Ionicons name="card" size={32} color={colors.primary.DEFAULT} />
              <View style={styles.paymentCardText}>
                <Text style={styles.paymentCardTitle}>Payment Pending</Text>
                <Text style={styles.paymentCardSubtitle}>
                  Complete your UPI payment to confirm the order
                </Text>
              </View>
            </View>
            <CTAButton
              size="lg"
              fullWidth
              leftIcon={<Ionicons name="logo-google-playstore" size={20} color={colors.text.onPrimary} />}
              onPress={() => setShowPaymentModal(true)}
              loading={isInitiatingPayment}
            >
              Pay with UPI
            </CTAButton>
          </Card>
        )}

        {/* Status Timeline */}
        <Card style={styles.timelineCard} padding="md">
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.timeline}>
            {(['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).map((status, index) => {
              const statusInfo = getStatusInfo(status);
              const isCurrent = status === order.status;
              const isPast = (['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).indexOf(status) <
                (['pending', 'confirmed', 'preparing', 'ready', 'completed'] as OrderStatus[]).indexOf(order.status as OrderStatus);
              return (
                <View key={status} style={styles.timelineItem}>
                  <View style={styles.timelineMarkerContainer}>
                    <View style={[
                      styles.timelineLine,
                      index === 0 && styles.timelineLineFirst,
                      index === 4 && styles.timelineLineLast,
                    ]} />
                    <View style={[
                      styles.timelineDot,
                      isPast && styles.timelineDotPast,
                      isCurrent && styles.timelineDotCurrent,
                    ]}>
                      {isPast && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                    </View>
                  </View>
                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineStatus,
                      isCurrent && styles.timelineStatusCurrent,
                    ]}>
                      {statusInfo.label}
                    </Text>
                    <Text style={styles.timelineDesc}>{statusInfo.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* QR Button */}
        {canShowQR && (
          <View style={styles.qrSection}>
            <CTAButton
              size="lg"
              fullWidth
              leftIcon={<Ionicons name="qr-code" size={20} color={colors.text.onPrimary} />}
              onPress={() => setShowQRModal(true)}
            >
              Show QR for Pickup
            </CTAButton>
            <Text style={styles.qrHint}>Show this QR code at the vendor counter to collect your order</Text>
          </View>
        )}

        {/* Cancelled/Pending Message */}
        {order.status === 'cancelled' && (
          <Card style={styles.cancelledCard} padding="md">
            <View style={styles.cancelledContent}>
              <Ionicons name="alert-circle" size={32} color={colors.status.cancelled} />
              <Text style={styles.cancelledTitle}>Order Cancelled</Text>
              <Text style={styles.cancelledText}>
                This order was cancelled. If you didn't cancel it, please contact support.
              </Text>
            </View>
          </Card>
        )}

        {order.status === 'pending' && (
          <Card style={styles.pendingCard} padding="md">
            <View style={styles.pendingContent}>
              <Ionicons name="time" size={32} color={colors.status.pending} />
              <Text style={styles.pendingTitle}>Waiting for Confirmation</Text>
              <Text style={styles.pendingText}>
                The vendor will confirm your order shortly. You'll get a notification when it's ready.
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal
        visible={showQRModal}
        onClose={() => setShowQRModal(false)}
        size="lg"
        showHandle
      >
        <View style={styles.qrModalContent}>
          <QRCodeDisplay
            data={order.qrCodeData}
            size={280}
            orderNumber={order.orderNumber}
            showLabel={true}
          />
          <View style={styles.qrModalFooter}>
            <Button variant="outline" onPress={() => setShowQRModal(false)}>Close</Button>
          </View>
        </View>
      </Modal>

      {/* UPI Payment Modal */}
      <Modal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        size="md"
        showHandle
      >
        <View style={styles.paymentModalContent}>
          <View style={styles.paymentModalHeader}>
            <Ionicons name="logo-google-playstore" size={40} color={colors.primary.DEFAULT} />
            <Text style={styles.paymentModalTitle}>UPI Payment</Text>
          </View>
          <Text style={styles.paymentModalSubtitle}>
            Enter your UPI VPA to proceed with payment
          </Text>
          <View style={styles.paymentModalInputWrapper}>
            <Text style={styles.paymentModalInputLabel}>UPI ID</Text>
            <TextInput
              style={styles.paymentModalInput}
              placeholder="user@upi"
              value={upiVpa}
              onChangeText={setUpiVpa}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <Text style={styles.paymentModalInputHint}>
              Example: yourname@okhdfcbank, user@paytm, etc.
            </Text>
          </View>
          <View style={styles.paymentModalAmount}>
            <Text style={styles.paymentModalAmountLabel}>Amount to Pay</Text>
            <Text style={styles.paymentModalAmountValue}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.paymentModalButtons}>
            <Button variant="outline" onPress={() => setShowPaymentModal(false)} fullWidth style={styles.paymentModalButton}>
              Cancel
            </Button>
            <CTAButton
              size="lg"
              fullWidth
              loading={isInitiatingPayment}
              onPress={handleInitiateUpiPayment}
              style={styles.paymentModalButton}
            >
              Pay {formatCurrency(order.total)}
            </CTAButton>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function renderOrderItem({ item }: { item: OrderItem }) {
  const menuItem = item.menuItemId as any;
  return (
    <View style={styles.orderItem} key={item.menuItemId || Math.random()}>
      <View style={styles.orderItemImageContainer}>
        {menuItem?.imageUrl ? (
          <Image source={{ uri: menuItem.imageUrl }} style={styles.orderItemImage} />
        ) : (
          <View style={[styles.orderItemImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>🍛</Text>
          </View>
        )}
        <Badge
          variant={item.dietType === 'veg' ? 'veg' : 'nonveg'}
          size="sm"
          style={styles.dietBadge}
        >
          {item.dietType === 'veg' ? 'VEG' : 'NON-VEG'}
        </Badge>
      </View>
      <View style={styles.orderItemDetails}>
        <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.orderItemMeta}>
          <Text style={styles.orderItemQty}>{item.quantity} × {formatCurrency(item.price)}</Text>
          <Text style={styles.orderItemTotal}>{formatCurrency(item.price * item.quantity)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.lg,
  },
  headerCard: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  orderDate: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  vendorAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    fontSize: 20,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  vendorMeta: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  instructionsText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.primary,
    flex: 1,
  },
  itemsCard: {
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
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  itemsList: {
    gap: spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  orderItemImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    overflow: 'hidden',
    flexShrink: 0,
  },
  orderItemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  dietBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    zIndex: 1,
  },
  orderItemDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xs,
    minWidth: 0,
  },
  orderItemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  orderItemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItemQty: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  orderItemTotal: {
    fontFamily: typography.sansBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  priceCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  priceLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 15,
    color: colors.text.secondary,
  },
  priceValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
  },
  totalValue: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.primary.DEFAULT,
  },
  paymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  paymentMethod: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  paymentId: {
    marginTop: spacing.sm,
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  timelineCard: {
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
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  timelineMarkerContainer: {
    width: 28,
    alignItems: 'center',
  },
  timelineLine: {
    position: 'absolute',
    width: 2,
    height: '100%',
    backgroundColor: colors.border.default,
    left: 13,
  },
  timelineLineFirst: {
    height: '50%',
    top: '50%',
  },
  timelineLineLast: {
    height: '50%',
    top: 0,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.border.default,
    borderWidth: 3,
    borderColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineDotPast: {
    backgroundColor: colors.success.DEFAULT,
    borderColor: colors.success.DEFAULT,
  },
  timelineDotCurrent: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: spacing.lg,
  },
  timelineStatus: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.tertiary,
  },
  timelineStatusCurrent: {
    color: colors.primary.DEFAULT,
    fontWeight: '700',
  },
  timelineDesc: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  qrSection: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  qrHint: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  cancelledCard: {
    backgroundColor: colors.error.bg,
    borderColor: colors.error.DEFAULT,
    borderWidth: 1,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  cancelledContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  cancelledTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
  cancelledText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.error.DEFAULT,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    opacity: 0.8,
  },
  pendingCard: {
    backgroundColor: colors.warning.bg,
    borderColor: colors.warning.DEFAULT,
    borderWidth: 1,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  pendingContent: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.warning.DEFAULT,
  },
  pendingText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.warning.DEFAULT,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    opacity: 0.8,
  },
  qrModalContent: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  qrModalFooter: {
    paddingTop: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  paymentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  paymentCardText: {
    flex: 1,
  },
  paymentCardTitle: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.text.primary,
  },
  paymentCardSubtitle: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  paymentModalContent: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  paymentModalHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentModalTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  paymentModalSubtitle: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  paymentModalInputWrapper: {
    gap: spacing.xs,
  },
  paymentModalInputLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 14,
    color: colors.text.primary,
  },
  paymentModalInput: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.primary,
  },
  paymentModalInputHint: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
  paymentModalAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  paymentModalAmountLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 15,
    color: colors.text.secondary,
  },
  paymentModalAmountValue: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.primary.DEFAULT,
  },
  paymentModalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  paymentModalButton: {
    flex: 1,
    minWidth: '45%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.surface.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emptyText: {
    fontSize: 36,
  },
  emptyTitle: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  skeletonCard: {
    marginHorizontal: spacing.lg,
    borderRadius: radius['2xl'],
  },
});