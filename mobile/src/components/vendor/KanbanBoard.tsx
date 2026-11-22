'use client';

import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { KanbanColumn } from './KanbanColumn';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStatusConfig } from '@/constants/orderStatus';
import { Ionicons } from '@expo/vector-icons';
import type { Order } from '@/services/vendor';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface KanbanBoardProps {
  orders: Order[];
  onOrderPress: (order: Order) => void;
  onDragEnd: (orderId: string, newStatus: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
const COLUMN_WIDTH = 280;
const COLUMN_GAP = spacing.md;

export function KanbanBoard({
  orders,
  onOrderPress,
  onDragEnd,
  isLoading = false,
  isError = false,
  refreshing = false,
  onRefresh,
}: KanbanBoardProps) {
  const scrollViewRef = useRef<any>(null);
  const columnRefs = useRef<any[]>([]);

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const activeOrderId = useSharedValue<string | null>(null);
  const activeColumnIndex = useSharedValue<number>(-1);
  const initialColumnIndex = useSharedValue<number>(-1);
  const columnLayouts = useSharedValue<{ x: number; width: number }[]>([]);

  // Group orders by status
  const groupedOrders = orders.reduce((acc: Record<string, Order[]>, order: Order) => {
    const status = order.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, Order[]>);

  const columns = STATUSES.map(status => ({
    status,
    orders: groupedOrders[status] || [],
  }));

  const handleDragBegin = (orderId: string, columnIndex: number) => {
    activeOrderId.value = orderId;
    activeColumnIndex.value = columnIndex;
    initialColumnIndex.value = columnIndex;
  };

  const handleDragEnd = (translationX: number, orderId: string) => {
    const layouts = columnLayouts.value;
    if (layouts.length === 0) {
      // Fallback: calculate column from translation
      const relativeX = translationX + COLUMN_WIDTH / 2;
      const targetColumnIndex = Math.round(relativeX / (COLUMN_WIDTH + COLUMN_GAP));
      const clampedIndex = Math.max(0, Math.min(STATUSES.length - 1, targetColumnIndex));

      if (clampedIndex !== initialColumnIndex.value) {
        runOnJS(onDragEnd)(orderId, STATUSES[clampedIndex]);
      }
    } else {
      // Use measured layouts for precise drop detection
      const absoluteX = dragX.value + translationX;
      let targetColumnIndex = -1;

      layouts.forEach((layout, index) => {
        const columnCenter = layout.x + layout.width / 2;
        const columnLeft = layout.x - COLUMN_GAP / 2;
        const columnRight = layout.x + layout.width + COLUMN_GAP / 2;

        if (absoluteX >= columnLeft && absoluteX <= columnRight) {
          targetColumnIndex = index;
        }
      });

      if (targetColumnIndex >= 0 && targetColumnIndex !== initialColumnIndex.value) {
        runOnJS(onDragEnd)(orderId, STATUSES[targetColumnIndex]);
      }
    }

    // Reset animation
    activeOrderId.value = null;
    activeColumnIndex.value = -1;
    initialColumnIndex.value = -1;
  };

  const onColumnLayout = (index: number) => (event: LayoutChangeEvent) => {
    const layouts = [...columnLayouts.value];
    layouts[index] = { x: event.nativeEvent.layout.x, width: event.nativeEvent.layout.width };
    columnLayouts.value = layouts;
  };

  // Ensure columnRefs array has correct size
  const refs = columnRefs.current;
  while (refs.length < STATUSES.length) {
    refs.push(React.createRef());
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          {STATUSES.map((status, i) => (
            <View key={status} style={styles.skeletonColumn}>
              <Skeleton variant="rect" height={40} style={styles.skeletonHeader} />
              <Skeleton variant="rect" height={120} style={styles.skeletonCard} />
              <Skeleton variant="rect" height={120} style={styles.skeletonCard} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load orders</Text>
        <Text style={styles.errorSubtext}>Pull to refresh</Text>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      contentContainerStyle={styles.container}
      showsHorizontalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary.DEFAULT]}
        />
      }
    >
      {columns.map((col, index) => (
        <View
          key={col.status}
          style={styles.columnWrapper}
          ref={refs[index]}
          onLayout={onColumnLayout(index)}
        >
          <KanbanColumn
            status={col.status}
            orders={col.orders}
            onOrderPress={onOrderPress}
            onDragEnd={(orderId, newStatus) => onDragEnd(orderId, newStatus)}
            activeOrderId={activeOrderId.value ?? undefined}
            columnIndex={index}
            onDragBegin={handleDragBegin}
            onDragEndInternal={(translationX, orderId) => handleDragEnd(translationX, orderId)}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    flexDirection: 'row',
    minWidth: STATUSES.length * COLUMN_WIDTH,
  },
  skeletonColumn: {
    width: 260,
    gap: spacing.md,
  },
  skeletonHeader: {
    borderRadius: radius.xl,
    marginBottom: spacing.sm,
  },
  skeletonCard: {
    borderRadius: radius.xl,
    marginBottom: spacing.md,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: COLUMN_GAP,
    minHeight: '100%',
    alignItems: 'flex-start',
  },
  columnWrapper: {
    width: COLUMN_WIDTH,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background.primary,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
  errorSubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
  },
});