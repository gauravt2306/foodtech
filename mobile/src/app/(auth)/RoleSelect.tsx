'use client';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { ROLES, UserRole } from '@/constants/roles';
import { colors, spacing, radius, typography } from '@/constants/colors';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleRoleSelect = (role: UserRole) => {
    switch (role) {
      case 'employee':
        router.replace('/employee');
        break;
      case 'vendor':
        router.replace('/vendor');
        break;
      case 'superadmin':
        router.replace('/superadmin');
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>🍛</Text>
        </View>
        <Text style={styles.title}>FoodTech</Text>
        <Text style={styles.subtitle}>
          Welcome, {user?.name || 'User'}!
        </Text>
        <Text style={styles.instruction}>
          Select your role to continue
        </Text>

        <View style={styles.roleGrid}>
          {ROLES
            .filter(r => r.value !== 'superadmin' || user?.role === 'superadmin')
            .map((role) => (
              <TouchableOpacity
                key={role.value}
                style={styles.roleCard}
                onPress={() => handleRoleSelect(role.value)}
                activeOpacity={0.85}
              >
                <View style={styles.roleIcon}>
                  <Text style={styles.roleEmoji}>
                    {role.value === 'employee' ? '👤' : role.value === 'vendor' ? '🏪' : '👑'}
                  </Text>
                </View>
                <Text style={styles.roleName}>{role.label}</Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: {
    fontSize: 50,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: 18,
    color: colors.text.muted,
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
    marginBottom: 32,
    textAlign: 'center',
  },
  roleGrid: {
    width: '100%',
    gap: spacing.lg,
  },
  roleCard: {
    padding: spacing.xl,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    gap: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  roleIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 32,
  },
  roleName: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  roleDesc: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
});