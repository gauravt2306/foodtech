import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { AuthNavigationProp, AuthStackParamList } from '@/navigation/types';
import { useAuthStore } from '@/store/authStore';

// Type for Register route params
type RegisterRouteProp = RouteProp<AuthStackParamList, 'Register'>;
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const route = useRoute<RegisterRouteProp>();
  const { register, error: authError, clearError, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'vendor' | 'employee' | 'superadmin'>(route.params?.preSelectedRole || 'vendor');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string; name?: string }>({});

  useEffect(() => {
    if (authError) {
      Alert.alert('Registration Failed', authError);
      clearError();
    }
  }, [authError, clearError]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string; name?: string } = {};
    if (!name) newErrors.name = 'Name is required';
    else if (name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      await register(email, password, role, name);
    } catch (error) {
      // Error handled by store effect
    }
  };

  const handleLoginPress = () => {
    navigation.goBack();
  };

  const roleLabels = {
    vendor: 'Vendor',
    employee: 'Employee',
    superadmin: 'Super Admin',
  };

  const roleColors = {
    vendor: colors.primary.DEFAULT,
    employee: colors.success.DEFAULT,
    superadmin: colors.warning.DEFAULT,
  };

  const selectedColor = roleColors[role];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={[styles.roleBadge, { backgroundColor: selectedColor }]}>{roleLabels[role]} Registration</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Join FoodTech as a {roleLabels[role].toLowerCase()}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={(text) => { setName(text); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
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
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={(text) => { setPassword(text); if (errors.password) setErrors({ ...errors, password: undefined }); }}
              placeholder="Create a password (min. 6 characters)"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="go"
              onSubmitEditing={handleRegister}
            />
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, { backgroundColor: selectedColor }]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primary.foreground} size="large" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={[styles.dividerText, { color: selectedColor }]}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, { borderColor: selectedColor }]}
            onPress={handleLoginPress}
            activeOpacity={0.8}
          >
            <Text style={[styles.loginButtonText, { color: selectedColor }]}>Already have an account? Sign In</Text>
          </TouchableOpacity>
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
    paddingVertical: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    color: colors.primary.foreground,
    fontFamily: typography.sansSemiBold,
    fontSize: typography.sm,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  formSubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    marginBottom: spacing['2xl'],
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontSize: typography.md,
    fontFamily: typography.sans,
    backgroundColor: colors.background.secondary,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.bg,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.error.DEFAULT,
    marginTop: spacing.xs,
  },
  registerButton: {
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  registerButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
  },
  loginButton: {
    height: 56,
    borderRadius: radius.lg,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
  },
});