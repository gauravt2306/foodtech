'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { AppHeader } from '@/components/ui/AppHeader';
import { CTAButton } from '@/components/ui/CTAButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => { logout(); router.replace('/(auth)/login'); } },
      ]
    );
  };

  const handleRoleSwitch = () => {
    router.push('/(auth)/role-select');
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen
  };

  const handleOrderHistory = () => {
    router.push('/employee/orders');
  };

  const handleSettings = () => {
    // Navigate to settings
  };

  const handleHelp = () => {
    // Navigate to help/support
  };

  const handleAbout = () => {
    Alert.alert('FoodTech', 'Version 1.0.0\nCorporate Dining Platform');
  };

  const roleColors = {
    employee: { bg: colors.primaryLight, border: colors.primary.DEFAULT, text: colors.primary.DEFAULT, icon: '👤', label: 'Employee' },
    vendor: { bg: colors.success.bg, border: colors.success.DEFAULT, text: colors.success.DEFAULT, icon: '🏪', label: 'Vendor' },
    superadmin: { bg: colors.role.superadmin.bg, border: colors.role.superadmin.border, text: colors.role.superadmin.text, icon: '👑', label: 'SuperAdmin' },
  };

  const role = user?.role?.toLowerCase() || 'employee';
  const roleStyle = roleColors[role as keyof typeof roleColors] || roleColors.employee;

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Account" showBack={false} showSearch={false} showProfile={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.avatarContainer}>
              <Image
                source={user?.avatarUrl ? { uri: user.avatarUrl } : undefined}
                style={styles.avatar}
              />
              {!user?.avatarUrl && (
                <Text style={styles.avatarPlaceholder}>👤</Text>
              )}
            </View>
            <Text style={styles.name}>{user?.name || 'User'}</Text>
            <View style={styles.roleContainer}>
              <View style={[
                styles.roleBadge,
                { backgroundColor: roleStyle.bg, borderColor: roleStyle.border }
              ]}>
                <Text style={[styles.roleBadgeText, { color: roleStyle.text }]}>
                  {roleStyle.icon} {roleStyle.label}
                </Text>
              </View>
            </View>
            <Text style={styles.email}>{user?.email || ''}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleOrderHistory} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="bag-handle" size={20} color={colors.primary.DEFAULT} />
                </View>
                <Text style={styles.menuLabel}>Order History</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleSettings} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="settings" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.menuLabel}>Settings</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleRoleSwitch} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="swap-horizontal" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.menuLabel}>Switch Role</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleHelp} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="help-circle" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.menuLabel}>Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.menuItem} onPress={handleAbout} activeOpacity={0.8}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.menuLabel}>About</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Profile Button */}
        <View style={styles.section}>
          <CTAButton
            size="md"
            fullWidth
            onPress={handleEditProfile}
            style={styles.editProfileBtn}
          >
            Edit Profile
          </CTAButton>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <CTAButton
            variant="outline"
            fullWidth
            onPress={handleLogout}
            style={styles.logoutBtn}
          >
            Sign Out
          </CTAButton>
        </View>

        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FoodTech v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 140,
    gap: spacing.xl,
  },
  heroSection: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    flexShrink: 0,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.primaryLight,
  },
  avatarPlaceholder: {
    position: 'absolute',
    fontSize: 48,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  name: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: 'center',
  },
  roleContainer: {
    marginTop: spacing.xs,
  },
  roleBadge: {
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
  },
  email: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.xs,
  },
  menuCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    overflow: 'hidden',
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 16,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginHorizontal: spacing.md,
  },
  editProfileBtn: {
    marginTop: spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.sm,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  versionText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
  },
});