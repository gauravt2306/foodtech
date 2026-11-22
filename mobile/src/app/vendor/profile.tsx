'use client';

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendor';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/utils/formatters';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface VendorProfile {
  _id: string;
  businessName: string;
  gstNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  operatingHours: {
    open: string;
    close: string;
  };
  isApproved: boolean;
  rating: number;
  totalOrders: number;
}

export default function VendorProfileScreen() {
  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendor-profile'],
    queryFn: () => vendorApi.getProfile(),
  });

  const profile = data?.data?.data;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
        <Text style={styles.errorText}>Failed to load profile</Text>
      </View>
    );
  }

  const handleEditHours = () => {
    // Navigate to edit operating hours
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.headerCard} padding="lg">
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>🏪</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.businessName}>{profile.businessName}</Text>
            <View style={styles.statusRow}>
              <Badge variant={profile.isApproved ? 'veg' : 'nonveg'} size="sm">
                {profile.isApproved ? 'APPROVED' : 'PENDING APPROVAL'}
              </Badge>
              <Text style={styles.rating}>
                ⭐ {profile.rating?.toFixed(1) || '0.0'} • {profile.totalOrders || 0} orders
              </Text>
            </View>
          </View>
        </View>
      </Card>

      <Card style={styles.infoCard} padding="lg">
        <Text style={styles.sectionTitle}>Business Information</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>GST Number</Text>
            <Text style={styles.infoValue}>{profile.gstNumber}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue} numberOfLines={2}>
              {profile.address?.street}, {profile.address?.city}, {profile.address?.state} - {profile.address?.pincode}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Operating Hours</Text>
            <Text style={styles.infoValue}>
              {profile.operatingHours?.open || '09:00'} - {profile.operatingHours?.close || '22:00'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              January 2024
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editHoursBtn} onPress={handleEditHours} activeOpacity={0.8}>
          <Text style={styles.editHoursBtnText}>Edit Operating Hours</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.statsCard} padding="lg">
        <Text style={styles.sectionTitle}>Performance</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile.totalOrders || 0}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {profile.isApproved ? 'Active' : 'Pending'}
            </Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
        </View>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.versionText}>FoodTech Vendor App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: 16,
    color: colors.text.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 18,
    color: colors.error.DEFAULT,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  headerCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
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
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: radius['2xl'],
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  avatarText: {
    fontSize: 40,
  },
  headerInfo: {
    flex: 1,
  },
  businessName: {
    fontFamily: typography.sansBold,
    fontSize: 22,
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
  infoCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  sectionTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    gap: spacing.lg,
  },
  infoItem: {
    gap: spacing.xs,
  },
  infoLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  editHoursBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  editHoursBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.primary.DEFAULT,
  },
  statsCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  statsGrid: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.sansBold,
    fontSize: 24,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.default,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  versionText: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
});