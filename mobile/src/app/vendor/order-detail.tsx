'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { vendorApi } from '@/services/vendor';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { getStatusConfig, getNextStatus, STATUS_FLOW, OrderStatus } from '@/constants/orderStatus';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  dietType: string;
  menuItemId?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  items: OrderItem[];
  employeeId: string | {
    id: string;
    name: string;
    phone?: string;
  };
  specialInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export default function VendorOrderDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = params.id;
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor-order', orderId],
    queryFn: () => vendorApi.getOrder(orderId!),
    enabled: !!orderId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: Order['status']) => vendorApi.updateOrderStatus(orderId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update status';
      Alert.alert('Error', message);
    },
  });

  const handoffMutation = useMutation({
    mutationFn: (qrToken: string) => vendorApi.handoffOrder(orderId!, qrToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-orders'] });
      Alert.alert('Success', 'Order handed off to customer!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Invalid or expired QR code';
      Alert.alert('Handoff Failed', message);
    },
  });

  const order = data;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order...</Text>
      </View>
    );
  }

  if (isError || !order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const nextStatus = getNextStatus(order.status);
  const canAdvance = !!nextStatus && order.status !== 'completed' && order.status !== 'cancelled';
  const isReadyForHandoff = order.status === 'ready';

  const handleAdvanceStatus = () => {
    if (nextStatus) {
      updateStatusMutation.mutate(nextStatus);
    }
  };

  const handleHandoff = () => {
    Alert.prompt(
      'Scan Customer QR',
      'Enter the QR token from customer\'s screen',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: (qrToken) => {
            if (qrToken?.trim()) {
              handoffMutation.mutate(qrToken.trim());
            }
          },
        },
      ],
      'plain-text',
      '',
      'QR Token'
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.headerCard} padding="lg">
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <Text style={styles.orderTime}>{formatDateTime(order.createdAt)}</Text>
          </View>
          <Badge variant={statusConfig.variant} size="lg">
            {statusConfig.label}
          </Badge>
        </View>

        <View style={styles.customerInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>
              {typeof order.employeeId === 'object' ? order.employeeId?.name : 'Unknown'}
            </Text>
          </View>
          {typeof order.employeeId === 'object' && order.employeeId?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{order.employeeId.phone}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.paymentMethod === 'Upi' ? 'UPI' : 'Cash'} • {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.itemsCard} padding="lg">
        <Text style={styles.sectionTitle}>Items</Text>
        {order.items.map((item: OrderItem, index: number) => (
          <View key={item.menuItemId || index} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemQuantity}>{item.quantity}x</Text>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Badge variant={item.dietType === 'veg' ? 'veg' : 'nonveg'} size="sm">
                  {item.dietType === 'veg' ? 'VEG' : 'NON-VEG'}
                </Badge>
              </View>
            </View>
            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
          </View>
        ))}

        {order.specialInstructions && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsLabel}>Special Instructions</Text>
            <Text style={styles.instructionsText}>{order.specialInstructions}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.pricingCard} padding="lg">
        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Subtotal</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.subtotal)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>GST (5%)</Text>
          <Text style={styles.priceValue}>{formatCurrency(order.tax)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, styles.totalLabel]}>Total</Text>
          <Text style={[styles.priceValue, styles.totalValue]}>{formatCurrency(order.total)}</Text>
        </View>
      </Card>

      <Card style={styles.actionsCard} padding="lg">
        <Text style={styles.sectionTitle}>Actions</Text>

        {canAdvance && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={updateStatusMutation.isPending}
            onPress={handleAdvanceStatus}
            style={styles.actionBtn}
          >
            Mark as {STATUS_FLOW[order.status as OrderStatus]?.nextLabel || nextStatus}
          </Button>
        )}

        {isReadyForHandoff && (
          <Button
            variant="outline"
            size="lg"
            fullWidth
            loading={handoffMutation.isPending}
            onPress={handleHandoff}
            style={styles.actionBtn}
          >
            <View style={styles.buttonWithIcon}>
              <Ionicons name="qr-code" size={20} color={colors.primary.DEFAULT} />
              <Text style={styles.buttonText}>Scan Customer QR for Handoff</Text>
            </View>
          </Button>
        )}

        {order.status === 'completed' && (
          <View style={styles.completed}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success.DEFAULT} />
            <Text style={styles.completedText}>Order Completed</Text>
            <Text style={styles.completedSubtext}>
              Handed off to customer on {formatDateTime(order.updatedAt)}
            </Text>
          </View>
        )}

        {order.status === 'cancelled' && (
          <View style={styles.cancelled}>
            <Ionicons name="close-circle" size={48} color={colors.error.DEFAULT} />
            <Text style={styles.cancelledText}>Order Cancelled</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  orderTime: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
  },
  customerInfo: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
  },
  infoValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  itemsCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  itemQuantity: {
    fontFamily: typography.sansBold,
    fontSize: 16,
    color: colors.primary.DEFAULT,
    minWidth: 28,
  },
  itemDetails: {
    gap: spacing.xs,
  },
  itemName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  itemPrice: {
    fontFamily: typography.sansBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  instructions: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  instructionsLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  instructionsText: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.primary,
  },
  pricingCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  priceLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 15,
    color: colors.text.muted,
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
  actionsCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  actionBtn: {
    marginBottom: spacing.md,
  },
  buttonWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.primary.DEFAULT,
  },
  completed: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  completedText: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.success.DEFAULT,
  },
  completedSubtext: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
  },
  cancelled: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  cancelledText: {
    fontFamily: typography.sansBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
});