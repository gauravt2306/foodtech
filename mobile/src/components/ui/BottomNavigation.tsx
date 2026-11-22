'use client';

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { Alert } from 'react-native';

type TabKey = 'home' | 'cart' | 'orders' | 'concierge' | 'profile';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/employee/(tabs)/home' },
  { key: 'cart', label: 'Cart', icon: 'bag-handle-outline', activeIcon: 'bag-handle', route: '/employee/(tabs)/cart' },
  { key: 'orders', label: 'Orders', icon: 'receipt-outline', activeIcon: 'receipt', route: '/employee/(tabs)/orders' },
  { key: 'concierge', label: 'Support', icon: 'help-circle-outline', activeIcon: 'help-circle', route: '/employee/(tabs)/concierge' },
  { key: 'profile', label: 'Account', icon: 'person-outline', activeIcon: 'person', route: '/employee/(tabs)/profile' },
];

export const BottomNavigation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const pathParam = params.__path__;
  const currentPath = Array.isArray(pathParam) ? pathParam[0] : (pathParam || '/employee/(tabs)/home');
  const { logout } = useAuthStore();

  const itemCount = useCartStore((state: { items: CartItem[] }) =>
    state.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)
  );

  // Determine active tab from current path
  const getActiveTab = (path: string): TabKey => {
    if (path.includes('/home') || path === '/employee/(tabs)/') return 'home';
    if (path.includes('/cart')) return 'cart';
    if (path.includes('/orders')) return 'orders';
    if (path.includes('/concierge')) return 'concierge';
    if (path.includes('/profile')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab(currentPath);

  const handleTabPress = (tab: TabConfig) => {
    router.replace(tab.route as any);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout, style: 'destructive' },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.7}
              accessibilityLabel={tab.label}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={(isActive ? tab.activeIcon : tab.icon) as any}
                size={isActive ? 26 : 24}
                color={isActive ? colors.primary.DEFAULT : colors.text.muted}
              />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
              {/* Cart badge */}
              {tab.key === 'cart' && itemCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{itemCount > 9 ? '9+' : itemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" as any size={24} color={colors.error.DEFAULT} />
          <Text style={styles.logoutLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg + 20, // Safe area
    backgroundColor: colors.surface.DEFAULT,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    height: 100,
    pointerEvents: 'auto',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
    minWidth: 60,
    position: 'relative',
  },
  tabItemActive: {},
  tabLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.text.muted,
  },
  tabLabelActive: {
    color: colors.primary.DEFAULT,
    fontFamily: typography.sansSemiBold,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: radius.full,
    backgroundColor: colors.error.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface.DEFAULT,
  },
  badgeText: {
    fontFamily: typography.sansBold,
    fontSize: 10,
    color: colors.primary.foreground,
    lineHeight: 12,
  },
  logoutBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minWidth: 70,
  },
  logoutLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.error.DEFAULT,
  },
});