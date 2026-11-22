'use client';

import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, shadows, radius, spacing, typography } from '@/constants/colors';
import { VendorListItemDto } from '@/services/employee';

interface RestaurantCardProps {
  vendor: VendorListItemDto;
  onPress: () => void;
  style?: any;
}

export const RestaurantCard = ({ vendor, onPress, style }: RestaurantCardProps) => {
  const rating = vendor.rating || 0;
  const menuItemCount = vendor.menuItemCount || 0;
  const openTime = vendor.operatingHours?.open || '08:00';
  const closeTime = vendor.operatingHours?.close || '22:00';
  const city = vendor.address?.city || 'Unknown';
  const state = vendor.address?.state || '';

  // Determine price tier based on rating/menu count (mock logic)
  const priceTier = rating >= 4.5 ? '$$$$' : rating >= 4.0 ? '$$$' : '$$';

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityLabel={`${vendor.businessName}, ${rating} stars, ${menuItemCount} items`}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=300&auto=format&fit=crop',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        {/* Accent border on image */}
        <View style={styles.imageAccent} />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{vendor.businessName}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={styles.cuisine}>
          Multi-Cuisine • {city}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={11} color={colors.text.muted} />
            <Text style={styles.metaText}>{openTime} - {closeTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="restaurant" size={11} color={colors.text.muted} />
            <Text style={styles.metaText}>{menuItemCount} items</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.priceTier}>{priceTier}</Text>
          </View>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.sm,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary.DEFAULT,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.sansSemiBold,
    fontSize: 17,
    color: colors.text.primary,
    lineHeight: 22,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  ratingText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    color: colors.primary.DEFAULT,
  },
  cuisine: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.text.muted,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: typography.sans,
    fontSize: 11,
    color: colors.text.muted,
  },
  priceTier: {
    fontFamily: typography.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
    color: colors.text.primary,
  },
  arrowContainer: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.xs,
  },
});