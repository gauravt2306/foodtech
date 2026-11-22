import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthNavigationProp } from '@/navigation/types';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface RoleOption {
  id: 'vendor' | 'employee' | 'superadmin';
  title: string;
  description: string;
  icon: string;
  color: string;
}

const roles: RoleOption[] = [
  {
    id: 'vendor',
    title: 'Vendor',
    description: 'Manage your food business - menu, orders, and deliveries',
    icon: 'storefront',
    color: colors.primary.DEFAULT,
  },
  {
    id: 'employee',
    title: 'Employee',
    description: 'Place orders for delivery from approved vendors',
    icon: 'person',
    color: colors.success.DEFAULT,
  },
  {
    id: 'superadmin',
    title: 'Super Admin',
    description: 'Platform administration and analytics',
    icon: 'shield-checkmark',
    color: colors.warning.DEFAULT,
  },
];

export const RoleSelectScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();

  const handleRoleSelect = (role: RoleOption['id']) => {
    navigation.navigate('Login', { preSelectedRole: role } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoWrapper}>
          <Ionicons name="restaurant" size={60} color={colors.primary.DEFAULT} />
        </View>
        <Text style={styles.title}>FoodTech</Text>
        <Text style={styles.subtitle}>Choose your role to continue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.rolesContainer} showsVerticalScrollIndicator={false}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, { borderColor: role.color }]}
            onPress={() => handleRoleSelect(role.id)}
            activeOpacity={0.8}
          >
            <View style={[styles.roleIconWrapper, { backgroundColor: role.color + '20' }]}>
              <Ionicons name={role.icon as any} size={32} color={role.color} />
            </View>
            <View style={styles.roleContent}>
              <Text style={[styles.roleTitle, { color: role.color }]}>{role.title}</Text>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
            <View style={[styles.arrowContainer, { backgroundColor: role.color }]}>
              <Ionicons name="chevron-forward" size={24} color={colors.primary.foreground} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>FoodTech - Food Delivery Platform</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    gap: spacing.md,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography['3xl'],
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderRadius: radius.xl,
    backgroundColor: colors.background.secondary,
    ...shadows.md,
  },
  roleIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  roleContent: {
    flex: 1,
    gap: spacing.xs,
  },
  roleTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xl,
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
    flex: 1,
  },
  arrowContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingVertical: spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.muted,
  },
});