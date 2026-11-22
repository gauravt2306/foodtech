'use client';

import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatTimeAgo } from '@/utils/formatters';
import { getStatusConfig } from '@/constants/orderStatus';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '@/services/vendor';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface KanbanColumnProps {
  status: string;
  orders: Order[];
  onOrderPress: (order: Order) => void;
  onDragEnd: (orderId: string, newStatus: string) => void;
  activeOrderId?: string;
  columnIndex?: number;
  onDragBegin?: (orderId: string, columnIndex: number) => void;
  onDragEndInternal?: (translationX: number, orderId: string) => void;
}

const getItemCount = (order: Order): number => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
};

const getEmployeeName = (order: Order): string => {
  return order.employeeId ? `Employee ${order.employeeId.slice(0, 8)}` : 'Unknown';
};

export function KanbanColumn({
  status,
  orders,
  onOrderPress,
  onDragEnd,
  activeOrderId,
  columnIndex = 0,
  onDragBegin,
  onDragEndInternal,
}: KanbanColumnProps) {
  const router = useRouter();
  const statusConfig = getStatusConfig(status as any);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const isDragging = useSharedValue(false);
  const draggingOrderId = useSharedValue<string | null>(null);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      // Note: We can't easily pass orderId here, so we'll use activeOrderId from props
      // The actual orderId is passed via the gesture handler on the card
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (draggingOrderId.value && onDragEndInternal) {
        onDragEndInternal(e.translationX, draggingOrderId.value);
      }
      isDragging.value = false;
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      draggingOrderId.value = null;
    });

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
    zIndex: isDragging.value ? 1000 : 1,
  }));

  const createPanGesture = (orderId: string) => Gesture.Pan()
    .onBegin(() => {
      isDragging.value = true;
      scale.value = withSpring(1.05);
      opacity.value = withSpring(0.8);
      draggingOrderId.value = orderId;
      if (onDragBegin) {
        onDragBegin(orderId, columnIndex);
      }
    })
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (draggingOrderId.value && onDragEndInternal) {
        onDragEndInternal(e.translationX, draggingOrderId.value);
      }
      isDragging.value = false;
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      draggingOrderId.value = null;
    });

  const renderOrderCard = ({ item }: { item: Order }) => {
    const isActive = activeOrderId === item.id;
    const gesture = createPanGesture(item.id);

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.orderCard, animatedCardStyle]}>
          <TouchableOpacity
            style={styles.cardContent}
            onPress={() => onOrderPress(item)}
            activeOpacity={0.85}
            disabled={isDragging.value}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <Text style={styles.timeAgo}>{formatTimeAgo(item.createdAt)}</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerLabel}>Customer</Text>
                <Text style={styles.customerName}>{getEmployeeName(item)}</Text>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>ITEMS</Text>
                  <Text style={styles.statValue}>{getItemCount(item)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>TOTAL</Text>
                  <Text style={styles.statValue}>{formatCurrency(item.total)}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {isActive && (
            <View style={styles.dragIndicator}>
              <Ionicons name="reorder-four" size={20} color={colors.primary.DEFAULT} />
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  return (
    <View style={styles.columnWrapper}>
      <View style={styles.column}>
        <View style={styles.columnHeader}>
          <View style={[styles.columnTitleContainer, { backgroundColor: statusConfig.bgColor }]}>
            <Text style={[styles.columnTitle, { color: statusConfig.color }]}>
              {statusConfig.label.toUpperCase()}
            </Text>
            <Text style={[styles.columnCount, { color: statusConfig.color }]}>
              {orders.length}
            </Text>
          </View>
        </View>

        <FlatList
          data={orders}
          renderItem={renderOrderCard}
          keyExtractor={order => order.id}
          contentContainerStyle={styles.columnContent}
          ListEmptyComponent={
            <View style={styles.emptyColumn}>
              <Text style={styles.emptyColumnText}>No orders</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  columnWrapper: {
    width: 280,
  },
  column: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    minHeight: 500,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  columnHeader: {
    padding: spacing.lg,
  },
  columnTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  columnTitle: {
    fontFamily: typography.sansBold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  columnCount: {
    fontFamily: typography.sansBold,
    fontSize: 13,
    minWidth: 24,
    textAlign: 'center',
  },
  columnContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyColumn: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyColumnText: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
  },
  orderCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  cardContent: {
    padding: spacing.md,
  },
  dragIndicator: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  orderNumber: {
    fontFamily: typography.sansBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  timeAgo: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.text.muted,
  },
  cardBody: {
    gap: spacing.md,
  },
  customerInfo: {
    gap: spacing.xs,
  },
  customerLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  customerName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.text.primary,
  },
  cardStats: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.sansSemiBold,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.sansBold,
    fontSize: 13,
    color: colors.text.primary,
  },
});