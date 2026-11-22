import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { VendorNavigationProp, VendorStackParamList } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { OrderStatus } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type VendorOrderDetailRouteProp = RouteProp<VendorStackParamList, 'VendorOrderDetail'>;

export const VendorOrderDetailScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const route = useRoute<VendorOrderDetailRouteProp>();
  const { currentOrder, fetchOrder, updateOrderStatus, getQrCode, isLoading, error, clearCurrentOrder } = useVendorStore();

  const [qrCodeData, setQrCodeData] = useState<{ qrToken: string; expiresAt: string } | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    fetchOrder(route.params.orderId);
    return () => clearCurrentOrder();
  }, [route.params.orderId]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { bg: colors.warning.bg, text: colors.warning.dark, icon: 'time' };
      case 'confirmed': return { bg: colors.info.bg, text: colors.info.dark, icon: 'checkmark-circle' };
      case 'preparing': return { bg: colors.primaryLight, text: colors.primary.dark, icon: 'restaurant' };
      case 'ready': return { bg: colors.success.bg, text: colors.success.dark, icon: 'bag-handle' };
      case 'completed': return { bg: colors.background.secondary, text: colors.text.secondary, icon: 'checkmark-circle' };
      case 'cancelled': return { bg: colors.error.bg, text: colors.error.dark, icon: 'close-circle' };
      default: return { bg: colors.background.secondary, text: colors.text.muted, icon: 'help-circle' };
    }
  };

  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case 'pending': return 'confirmed';
      case 'confirmed': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(route.params.orderId, newStatus);
    } catch (err: any) {
      // Error handled by store
    }
  };

  const handleGenerateQr = async () => {
    try {
      const data = await getQrCode(route.params.orderId);
      setQrCodeData(data);
      setShowQrModal(true);
    } catch (err: any) {
      // Error handled by store
    }
  };

  const handleHandoff = () => {
    navigation.navigate('VendorQrHandoff', { orderId: route.params.orderId } as any);
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
  const statusStyle = getStatusColor(order.status);
  const nextStatus = getNextStatus(order.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
            <Text style={styles.orderTime}>{new Date(order.createdAt).toLocaleString()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon as any} size={16} color={statusStyle.text} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          {order.employee && (
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{order.employee.email}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{order.employee.role}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={[styles.itemImage, styles.itemImagePlaceholder]} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                {item.specialInstructions && (
                  <Text style={styles.itemInstructions}>Note: {item.specialInstructions}</Text>
                )}
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{(item.price / 100).toFixed(2)} each</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>
              <Text style={styles.priceValue}>₹{(order.subtotal / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tax</Text>
              <Text style={styles.priceValue}>₹{(order.taxAmount / 100).toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>
              <Text style={styles.priceValue}>₹{(order.deliveryFee / 100).toFixed(2)}</Text>
            </View>
            <View style={[styles.priceRow, styles.priceTotal]}>
              <Text style={[styles.priceLabel, styles.priceTotalLabel]}>Total</Text>
              <Text style={[styles.priceValue, styles.priceTotalValue]}>₹{(order.total / 100).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Method</Text>
              <Text style={styles.infoValue}>{order.paymentMethod?.toUpperCase()}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{order.paymentStatus}</Text>
            </View>
            {order.paymentId && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Payment ID</Text>
                <Text style={styles.infoValue}>{order.paymentId}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{order.notes}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {nextStatus && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleStatusUpdate(nextStatus)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}</Text>
            </TouchableOpacity>
          )}

          {order.status === 'ready' && (
            <TouchableOpacity
              style={styles.handoffButton}
              onPress={handleHandoff}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={18} color={colors.success.foreground} style={styles.handoffButtonIcon} />
              <Text style={styles.handoffButtonText}>QR Handoff</Text>
            </TouchableOpacity>
          )}

          {order.status === 'ready' && (
            <TouchableOpacity
              style={styles.qrButton}
              onPress={handleGenerateQr}
              activeOpacity={0.8}
            >
              <Ionicons name="qr-code" size={18} color={colors.info.foreground} style={styles.qrButtonIcon} />
              <Text style={styles.qrButtonText}>Generate QR Code</Text>
            </TouchableOpacity>
          )}

          {['pending', 'confirmed', 'preparing'].includes(order.status) && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => Alert.alert(
                'Cancel Order',
                'Are you sure you want to cancel this order?',
                [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes, Cancel', style: 'destructive', onPress: () => handleStatusUpdate('cancelled') },
                ]
              )}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* QR Code Modal */}
        {showQrModal && qrCodeData && (
          <View style={styles.modalOverlay} onTouchStart={() => setShowQrModal(false)}>
            <View style={styles.modalContent} onTouchStart={e => e.stopPropagation()}>
              <TouchableOpacity onPress={() => setShowQrModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={24} color={colors.text.muted} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>QR Code for Handoff</Text>
              <Text style={styles.modalSubtitle}>Show this to the customer for verification</Text>
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeText}>QR: {qrCodeData.qrToken}</Text>
                <Text style={styles.qrExpires}>Expires: {new Date(qrCodeData.expiresAt).toLocaleTimeString()}</Text>
              </View>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  statusIcon: {},
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    gap: spacing.md,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  itemImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  itemInstructions: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.warning.DEFAULT,
    fontStyle: 'italic',
  },
  itemMeta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemQty: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  itemPrice: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
    color: colors.primary.dark,
  },
  priceBreakdown: {
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  priceValue: {
    fontFamily: typography.sansMedium,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  priceTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  priceTotalLabel: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
  },
  priceTotalValue: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.primary.dark,
  },
  notesText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  actionsSection: {
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.xl,
    alignItems: 'center',
  },
  actionButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  handoffButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.success.DEFAULT,
    borderRadius: radius.xl,
  },
  handoffButtonIcon: {},
  handoffButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.success.foreground,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    backgroundColor: colors.info.DEFAULT,
    borderRadius: radius.xl,
  },
  qrButtonIcon: {},
  qrButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.info.foreground,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    backgroundColor: colors.error.bg,
    borderRadius: radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error.DEFAULT,
  },
  cancelButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.error.DEFAULT,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalClose: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  modalSubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  qrCodeContainer: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    gap: spacing.xs,
  },
  qrCodeText: {
    fontFamily: typography.mono,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  qrExpires: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
});