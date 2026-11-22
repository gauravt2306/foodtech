import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl, FlatList, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SuperAdminNavigationProp } from '@/navigation/types';
import { useSuperAdminStore } from '@/store/superAdminStore';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const PendingVendorsScreen = () => {
  const navigation = useNavigation<SuperAdminNavigationProp>();
  const { pendingVendors, fetchPendingVendors, approveVendor, rejectVendor, isLoading } = useSuperAdminStore();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    try {
      await fetchPendingVendors();
    } catch (error) {
      // Error handled by store
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleApprove = async (vendorId: string) => {
    Alert.alert(
      'Approve Vendor',
      'Are you sure you want to approve this vendor? They will be able to accept orders immediately.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setActionLoading(vendorId);
            try {
              await approveVendor(vendorId);
              Alert.alert('Success', 'Vendor approved successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve vendor');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleReject = async (vendorId: string) => {
    Alert.alert(
      'Reject Vendor',
      'Are you sure you want to reject this vendor? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(vendorId);
            try {
              await rejectVendor(vendorId);
              Alert.alert('Success', 'Vendor rejected');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to reject vendor');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const renderVendor = ({ item }: { item: any }) => {
    const isExpanded = expandedId === item.id;
    const isActionLoading = actionLoading === item.id;

    return (
      <View style={styles.vendorCard} key={item.id}>
        {/* Main Card */}
        <TouchableOpacity
          style={styles.vendorMain}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          activeOpacity={0.9}
        >
          <View style={styles.vendorHeader}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.vendorAvatar} />
            ) : (
              <View style={[styles.vendorAvatar, styles.vendorAvatarPlaceholder]}>
                <Ionicons name="storefront" size={24} color={colors.text.muted} style={styles.avatarPlaceholder} />
              </View>
            )}
            <View style={styles.vendorInfo}>
              <Text style={styles.vendorName}>{item.businessName}</Text>
              <Text style={styles.vendorEmail}>{item.ownerEmail}</Text>
            </View>
            <View style={styles.vendorStatusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: colors.warning.bg }]}>
                <Text style={[styles.statusText, { color: colors.warning.dark }]}>Pending</Text>
              </View>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={colors.text.muted} style={styles.chevron} />
            </View>
          </View>

          <View style={styles.vendorMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Phone</Text>
              <Text style={styles.metaValue}>{item.contactPhone}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>City</Text>
              <Text style={styles.metaValue}>{item.address?.city}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Cuisine</Text>
              <Text style={styles.metaValue}>{item.cuisineType || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Applied</Text>
              <Text style={styles.metaValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Address</Text>
              <Text style={styles.detailText}>
                {item.address?.street}, {item.address?.city}, {item.address?.state} - {item.address?.postalCode}
              </Text>
            </View>

            {item.operatingHours && Object.keys(item.operatingHours).length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Operating Hours</Text>
                {Object.entries(item.operatingHours).map(([day, hours]: [string, any]) => (
                  <Text key={day} style={styles.detailText}>
                    {day}: {hours.isOpen ? `${hours.open} - ${hours.close}` : 'Closed'}
                  </Text>
                ))}
              </View>
            )}

            {item.gstNumber && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>GST Number</Text>
                <Text style={styles.detailText}>{item.gstNumber}</Text>
              </View>
            )}

            {item.fssaiNumber && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>FSSAI Number</Text>
                <Text style={styles.detailText}>{item.fssaiNumber}</Text>
              </View>
            )}

            {item.bankAccount && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Bank Details</Text>
                <Text style={styles.detailText}>
                  {item.bankAccount.accountName} • {item.bankAccount.bankName} • {item.bankAccount.accountNumber.slice(-4)}
                </Text>
                <Text style={styles.detailText}>IFSC: {item.bankAccount.ifscCode}</Text>
              </View>
            )}

            {item.upiId && (
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>UPI ID</Text>
                <Text style={styles.detailText}>{item.upiId}</Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton, isActionLoading && styles.actionButtonDisabled]}
                onPress={() => handleReject(item.id)}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                {isActionLoading ? (
                  <ActivityIndicator color={colors.error.foreground} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Reject</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton, isActionLoading && styles.actionButtonDisabled]}
                onPress={() => handleApprove(item.id)}
                disabled={isActionLoading}
                activeOpacity={0.8}
              >
                {isActionLoading ? (
                  <ActivityIndicator color={colors.success.foreground} size="small" />
                ) : (
                  <Text style={styles.actionButtonText}>Approve</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading && pendingVendors.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading vendors...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.warning.DEFAULT]} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Pending Vendors</Text>
          <Text style={styles.subtitle}>{pendingVendors.length} vendor{pendingVendors.length !== 1 ? 's' : ''} awaiting approval</Text>
        </View>

        {pendingVendors.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success.DEFAULT} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No pending vendors</Text>
            <Text style={styles.emptySubtitle}>All vendors have been reviewed</Text>
          </View>
        ) : (
          <FlatList
            data={pendingVendors}
            renderItem={renderVendor}
            keyExtractor={item => item.id}
            ListEmptyComponent={() => null}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
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
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
  },
  subtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.muted,
    textAlign: 'center',
  },
  vendorCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  vendorMain: {
    padding: spacing.md,
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  vendorAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.background.secondary,
  },
  vendorAvatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    fontSize: 24,
  },
  vendorInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  vendorName: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.primary,
  },
  vendorEmail: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.muted,
  },
  vendorStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.xs,
    textTransform: 'capitalize',
  },
  chevron: {},
  vendorMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  metaItem: {
    gap: spacing.xs,
  },
  metaLabel: {
    fontFamily: typography.sansMedium,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontFamily: typography.sans,
    fontSize: typography.sm,
    color: colors.text.primary,
  },
  expandedSection: {
    padding: spacing.md,
    paddingTop: 0,
    backgroundColor: colors.background.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    gap: spacing.lg,
  },
  detailSection: {
    gap: spacing.xs,
  },
  detailTitle: {
    fontFamily: typography.sansMedium,
    fontSize: typography.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontFamily: typography.sans,
    fontSize: typography.md,
    color: colors.text.primary,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  rejectButton: {
    backgroundColor: colors.error.bg,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  approveButton: {
    backgroundColor: colors.success.bg,
    borderWidth: 1,
    borderColor: colors.success.border,
  },
  actionButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: '#ffffff',
  },
  separator: {
    height: spacing.lg,
  },
});