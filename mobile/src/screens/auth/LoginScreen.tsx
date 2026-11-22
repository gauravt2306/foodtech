import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { AuthNavigationProp, AuthStackParamList } from '@/navigation/types';

// Type for Login route params
type LoginRouteProp = RouteProp<AuthStackParamList, 'Login'>;
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

export const LoginScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<LoginRouteProp>();
  const { login, error: authError, clearError, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'vendor' | 'employee' | 'superadmin'>(route.params?.preSelectedRole || 'employee');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (authError) {
      Alert.alert('Sign In Failed', authError);
      clearError();
    }
  }, [authError, clearError]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    console.log('[LoginScreen] handleLogin called', { email, password: '***' });
    if (!validateForm()) return;
    try {
      await login(email, password);
    } catch (error) {
      console.log('[LoginScreen] login error:', error);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register', { preSelectedRole: role } as any);
  };

  const roleLabels = {
    employee: 'Employee',
    vendor: 'Vendor',
    superadmin: 'SuperAdmin',
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandSubtitle}>Corporate Dining</Text>
          <Text style={styles.brandTitle}>FoodTech</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <Text style={styles.roleSelectorLabel}>Sign in as</Text>
          <View style={styles.roleOptions}>
            {(['employee', 'vendor', 'superadmin'] as const).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleOption,
                  role === r && styles.roleOptionActive,
                  { borderColor: role === r ? colors.primary.DEFAULT : colors.border.default },
                ]}
                onPress={() => setRole(r)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.roleOptionText,
                  role === r && styles.roleOptionTextActive,
                ]}>
                  {roleLabels[r]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to your {roleLabels[role].toLowerCase()} account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[
              styles.inputWrapper,
              errors.email && styles.inputWrapperError,
            ]}>
              <Ionicons name="mail" size={20} color={errors.email ? colors.error.DEFAULT : colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                onChangeText={(text) => { setEmail(text); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[
              styles.inputWrapper,
              errors.password && styles.inputWrapperError,
            ]}>
              <Ionicons name="lock-closed" size={20} color={errors.password ? colors.error.DEFAULT : colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={password}
                onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: undefined }); }}
                placeholder="Enter your password"
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <CTAButton
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleLogin}
            style={styles.loginButton}
          >
            Sign In
          </CTAButton>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegisterPress}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Test Credentials */}
          <View style={styles.testCredentials}>
            <Text style={styles.testCredentialsTitle}>Test Credentials</Text>
            <View style={styles.testCredentialsList}>
              <Text style={styles.testCredential}>
                <Text style={styles.testCredentialLabel}>Employee:</Text>{' '}
                employee_test@foodtech.com / password123
              </Text>
              <Text style={styles.testCredential}>
                <Text style={styles.testCredentialLabel}>Vendor:</Text>{' '}
                vendor_test@foodtech.com / password123
              </Text>
              <Text style={styles.testCredential}>
                <Text style={styles.testCredentialLabel}>Admin:</Text>{' '}
                admin_test@foodtech.com / password123
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  brandSubtitle: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: colors.text.muted,
  },
  brandTitle: {
    fontFamily: typography.sansBold,
    fontSize: 36,
    color: colors.primary.DEFAULT,
    lineHeight: 44,
  },
  roleSelector: {
    gap: spacing.md,
  },
  roleSelectorLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleOption: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  roleOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  roleOptionText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.text.secondary,
  },
  roleOptionTextActive: {
    color: colors.primary.DEFAULT,
  },
  formContainer: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  formTitle: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: 'center',
  },
  formSubtitle: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: 13,
    color: colors.text.secondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.bg,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
    fontFamily: typography.sans,
    color: colors.text.primary,
    backgroundColor: 'transparent',
  },
  inputError: {
    color: colors.error.DEFAULT,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.error.DEFAULT,
    marginLeft: spacing.xs,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    fontFamily: typography.sansMedium,
    fontSize: 13,
    color: colors.text.muted,
  },
  registerButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  registerButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.secondary,
  },
  testCredentials: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
  },
  testCredentialsTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  testCredentialsList: {
    gap: spacing.xs,
  },
  testCredential: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  testCredentialLabel: {
    fontFamily: typography.sansSemiBold,
    color: colors.text.secondary,
  },
});