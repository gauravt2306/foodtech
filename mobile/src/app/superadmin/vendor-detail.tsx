'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { superadminApi, Vendor } from '@/services/superadmin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AppHeader } from '@/components/ui/AppHeader';
import { formatCurrency, formatDateTime, formatDate } from '@/utils/formatters';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';
import { useRouter } from 'expo-router';

// Extend Vendor with the userId object type from the API
interface VendorDetail extends Omit<Vendor, 'userId'> {
  userId?: string | {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
  };
  operatingHours?: {
    open: string;
    close: string;
  };
}

export default function SuperAdminVendorDetailScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const vendorId = params.id;
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['superadmin-vendor', vendorId],
    queryFn: () => superadminApi.getVendor(vendorId!),
    enabled: !!vendorId,
  });

  const approveMutation = useMutation({
    mutationFn: (approve: boolean) => superadminApi.approveVendor(vendorId!, approve),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-vendor', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['superadmin-vendors'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update vendor status';
      Alert.alert('Error', message);
    },
  });

  const vendor = data as VendorDetail | undefined;

  const toggleUserStatusMutation = useMutation({
    mutationFn: (isActive: boolean) => {
      if (!vendor) throw new Error('Vendor not loaded');
      const userId = typeof vendor.userId === 'object' ? vendor.userId?.id : vendor.userId;
      return superadminApi.updateUserStatus(userId!, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-vendor', vendorId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update user status';
      Alert.alert('Error', message);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <AppHeader title="Loading..." showBack={true} showSearch={false} showProfile={false} />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading vendor details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !vendor) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <AppHeader title="Error" showBack={true} showSearch={false} showProfile={false} />
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
          <Text style={styles.errorText}>Vendor not found</Text>
          <CTAButton size="sm" onPress={() => router.back()}>Go Back</CTAButton>
        </View>
      </SafeAreaView>
    );
  }

  const owner = typeof vendor.userId === 'object' ? vendor.userId : null;

  const handleApprove = () => {
    Alert.alert(
      'Approve Vendor',
      `Approve "${vendor.businessName}"? They will gain full vendor access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Approve', onPress: () => approveMutation.mutate(true) },
      ]
    );
  };

  const handleReject = () => {
    Alert.alert(
      'Reject Vendor',
      `Reject "${vendor.businessName}"? They will lose vendor access.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => approveMutation.mutate(false) },
      ]
    );
  };

  const handleToggleUser = () => {
    if (!owner) return;
    const newStatus = !owner.isActive;
    Alert.alert(
      newStatus ? 'Activate User' : 'Deactivate User',
      `${newStatus ? 'Activate' : 'Deactivate'} ${owner.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: newStatus ? 'Activate' : 'Deactivate', style: newStatus ? 'default' : 'destructive', onPress: () => toggleUserStatusMutation.mutate(newStatus) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title={vendor.businessName} showBack={true} showSearch={false} showProfile={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>🏪</Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.businessName}>{vendor.businessName}</Text>
              <View style={styles.statusRow}>
                <Badge variant={vendor.isApproved ? 'veg' : 'nonveg'} size="lg">
                  {vendor.isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
                </Badge>
                <Text style={styles.rating}>
                  ⭐ {vendor.rating?.toFixed(1) || '0.0'} • {vendor.totalOrders || 0} orders
                </Text>
              </View>
            </View>
          </View>

          {!vendor.isApproved && (
            <View style={styles.approvalActions}>
              <CTAButton variant="primary" size="md" onPress={handleApprove} style={styles.approvalBtn}>
                Approve Vendor
              </CTAButton>
              <CTAButton variant="outline" size="md" onPress={handleReject} style={styles.approvalBtn}>
                Reject
              </CTAButton>
            </View>
          )}
        </View>

        {/* Business Details Card */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Business Details</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>GST Number</Text>
              <Text style={styles.infoValue}>{vendor.gstNumber}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue} numberOfLines={3}>
                {vendor.address?.street}, {vendor.address?.city}, {vendor.address?.state} - {vendor.address?.zipCode}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Operating Hours</Text>
              <Text style={styles.infoValue}>
                {vendor.operatingHours?.open || '09:00'} - {vendor.operatingHours?.close || '22:00'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Registered</Text>
              <Text style={styles.infoValue}>{formatDate(vendor.createdAt || '2024-01-01')}</Text>
            </View>

            {vendor.isApproved && vendor.approvedAt && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Approved On</Text>
                <Text style={styles.infoValue}>{formatDateTime(vendor.approvedAt)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Owner Information Card */}
        {owner && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Owner Information</Text>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{owner.name}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{owner.email}</Text>
              </View>

              {owner.phone && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{owner.phone}</Text>
                </View>
              )}

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Account Status</Text>
                <View style={styles.statusToggle}>
                  <Badge variant={owner.isActive ? 'veg' : 'nonveg'} size="sm">
                    {owner.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                  <TouchableOpacity
                    style={styles.toggleBtn}
                    onPress={handleToggleUser}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.toggleBtnText}>
                      {owner.isActive ? 'Deactivate' : 'Activate'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.versionText}>FoodTech SuperAdmin v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  businessName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  rating: {
    fontFamily: typography.sansSemiBold,
    fontSize: 14,
    color: colors.text.muted,
  },
  approvalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  approvalBtn: {
    flex: 1,
    minWidth: 140,
  },
  infoCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    gap: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoGrid: {
    gap: spacing.lg,
  },
  infoItem: {
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 11,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  toggleBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  versionText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
});