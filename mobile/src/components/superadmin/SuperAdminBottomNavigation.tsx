'use client';

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { Alert } from 'react-native';

type TabKey = 'dashboard' | 'vendors' | 'users' | 'analytics';

interface TabConfig {
  key: TabKey;
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

const TABS: TabConfig[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'analytics-outline', activeIcon: 'analytics', route: '/superadmin/dashboard' },
  { key: 'vendors', label: 'Vendors', icon: 'storefront-outline', activeIcon: 'storefront', route: '/superadmin/vendors' },
  { key: 'users', label: 'Users', icon: 'people-outline', activeIcon: 'people', route: '/superadmin/users' },
  { key: 'analytics', label: 'Analytics', icon: 'bar-chart-outline', activeIcon: 'bar-chart', route: '/superadmin/analytics' },
];

export const SuperAdminBottomNavigation = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { logout, user } = useAuthStore();
  const currentPath = Array.isArray(params.__path__) ? params.__path__[0] : (params.__path__ || '/superadmin/dashboard');

  const getActiveTab = (path: string): TabKey => {
    if (path.includes('/dashboard')) return 'dashboard';
    if (path.includes('/vendors')) return 'vendors';
    if (path.includes('/users')) return 'users';
    if (path.includes('/analytics')) return 'analytics';
    return 'dashboard';
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