'use client';

import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { validateEmail, validatePassword } from '@/utils/validation';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'employee' | 'vendor';
}

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<'employee' | 'vendor'>('employee');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFieldError,
    clearErrors,
  } = useForm<RegisterForm>({
    defaultValues: { role: 'employee' },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    clearErrors('confirmPassword');

    if (data.password !== data.confirmPassword) {
      setFieldError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }

    try {
      await registerUser(data.email, data.password, data.role, data.name);
      // RootNavigator will handle role-based redirect
    } catch (err: any) {
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Registration failed. Please try again.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🍛</Text>
          </View>
          <Text style={styles.title}>FoodTech</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        <Card style={styles.formCard} padding="lg">
          <Text style={styles.formTitle}>Sign Up</Text>

          <View style={styles.roleSelector}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'employee' && styles.roleOptionSelected,
              ]}
              onPress={() => setSelectedRole('employee')}
            >
              <Text style={[
                styles.roleOptionText,
                selectedRole === 'employee' && styles.roleOptionTextSelected,
              ]}>
                👤 Employee
              </Text>
              <Text style={styles.roleOptionDesc}>Order food from cafeteria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'vendor' && styles.roleOptionSelected,
              ]}
              onPress={() => setSelectedRole('vendor')}
            >
              <Text style={[
                styles.roleOptionText,
                selectedRole === 'vendor' && styles.roleOptionTextSelected,
              ]}>
                🏪 Vendor
              </Text>
              <Text style={styles.roleOptionDesc}>Manage cafeteria menu</Text>
            </TouchableOpacity>
          </View>

          <View>
            <Input
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name too long' },
              })}
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              error={errors.name?.message}
            />

            <Input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email?.message}
            />

            <Input
              {...register('phone', {
                pattern: {
                  value: /^\+?[1-9]\d{9,14}$/,
                  message: 'Invalid phone number',
                },
              })}
              label="Phone (Optional)"
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              error={errors.phone?.message}
            />

            <Input
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                validate: (value) => {
                  const { valid, errors: pwdErrors } = validatePassword(value);
                  return valid || pwdErrors.join(', ');
                },
              })}
              label="Password"
              placeholder="Create a strong password"
              secureTextEntry
              error={errors.password?.message}
            />

            <Input
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword?.message}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-4"
              onPress={handleSubmit(onSubmit) as any}
            >
              Create Account
            </Button>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/Login" style={styles.linkText}>
            Sign In
          </Link>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Creating account..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary.DEFAULT,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    fontSize: 40,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  formTitle: {
    fontFamily: typography.sansBold,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleOption: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.DEFAULT,
  },
  roleOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primaryLight,
  },
  roleOptionText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  roleOptionTextSelected: {
    color: colors.primary.DEFAULT,
  },
  roleOptionDesc: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
  errorContainer: {
    backgroundColor: colors.error.bgMedium,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  errorText: {
    color: colors.error.DEFAULT,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: typography.sans,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: colors.text.muted,
    fontSize: 14,
    fontFamily: typography.sans,
  },
  linkText: {
    color: colors.primary.DEFAULT,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: typography.sansSemiBold,
  },
});