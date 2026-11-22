'use client';

import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/services/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { validateEmail, validatePassword } from '@/utils/validation';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    console.log('[LoginScreen] onSubmit called:', data.email);
    setError(null);
    try {
      await login(data.email, data.password);
      console.log('[LoginScreen] login success');
      // RootNavigator will handle role-based redirect
    } catch (err: any) {
      console.log('[LoginScreen] login error:', err);
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  // TEST: Auto-login button for E2E testing (seeded employee account)
  const handleTestLogin = async () => {
    console.log('[LoginScreen] Test login pressed');
    setError(null);
    try {
      await login('employee@test.com', 'password123');
      console.log('[LoginScreen] Test login success');
    } catch (err: any) {
      console.log('[LoginScreen] Test login error:', err);
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  // TEST: Auto-login button for SuperAdmin E2E testing (seeded superadmin account)
  const handleSuperAdminTestLogin = async () => {
    console.log('[LoginScreen] SuperAdmin test login pressed');
    setError(null);
    try {
      await login('admin@test.com', 'Admin@123');
      console.log('[LoginScreen] SuperAdmin test login success');
    } catch (err: any) {
      console.log('[LoginScreen] SuperAdmin test login error:', err);
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  // TEST: Auto-login button for Vendor E2E testing (seeded vendor account)
  const handleVendorTestLogin = async () => {
    console.log('[LoginScreen] Vendor test login pressed');
    setError(null);
    try {
      await login('vendor@foodtech.com', 'password123');
      console.log('[LoginScreen] Vendor test login success');
    } catch (err: any) {
      console.log('[LoginScreen] Vendor test login error:', err);
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🍛</Text>
          </View>
          <Text style={styles.title}>FoodTech</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <Card style={styles.formCard} padding="lg">
          <Text style={styles.formTitle}>Welcome Back</Text>

          <View>
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
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 1, message: 'Password is required' },
              })}
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password?.message}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.forgotPassword}>
              <TouchableOpacity>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              className="mt-4"
              onPress={() => {
                console.log('[LoginScreen] Button onPress fired!');
                handleSubmit(onSubmit)();
              }}
            >
              Sign In
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              loading={isLoading}
              className="mt-4"
              onPress={handleTestLogin}
            >
              Test Login (Employee)
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              loading={isLoading}
              className="mt-4"
              onPress={handleSuperAdminTestLogin}
            >
              Test Login (SuperAdmin)
            </Button>

            <Button
              variant="secondary"
              size="md"
              fullWidth
              loading={isLoading}
              className="mt-4"
              onPress={handleVendorTestLogin}
            >
              Test Login (Vendor)
            </Button>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <Link href="/(auth)/Register" style={styles.linkText}>
            Sign Up
          </Link>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isLoading} message="Signing in..." />
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
  forgotPassword: {
    alignItems: 'flex-end',
    marginTop: -8,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: colors.primary.DEFAULT,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: typography.sansMedium,
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