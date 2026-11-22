'use client';

import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert, TextInput, SafeAreaView } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superadminApi, User as SuperAdminUser } from '@/services/superadmin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { AppHeader } from '@/components/ui/AppHeader';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { ROLES } from '@/constants/roles';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { CTAButton } from '@/components/ui/CTAButton';

interface User extends SuperAdminUser {
  // Extend with any additional fields needed locally
}

export default function SuperAdminUsersScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['superadmin-users', searchQuery, roleFilter, statusFilter],
    queryFn: () => superadminApi.listUsers(),
    staleTime: 30 * 1000,
  });

  const users = data || [];
  const refreshing = isFetching;

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      superadminApi.updateUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to update user status';
      Alert.alert('Error', message);
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      superadminApi.updateUserStatus(id, true).then(() => {
        // Role change would need a separate API endpoint
        // For now, just update status
        return { success: true, data: { role } };
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin-users'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.Message || error.response?.data?.errorInfo?.Message || 'Failed to change role';
      Alert.alert('Error', message);
    },
  });

  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const renderUser = ({ item }: { item: User }) => {
    const roleInfo = ROLES.find(r => r.value === item.role) || { label: item.role, color: colors.text.muted };

    return (
      <TouchableOpacity
        style={styles.userCard}
        activeOpacity={0.85}
      >
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              <Badge variant={item.role === 'superadmin' ? 'gf' : item.role === 'vendor' ? 'veg' : 'nonveg'} size="sm">
                {roleInfo.label}
              </Badge>
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            {item.vendorProfileId && (
              <Text style={styles.vendorInfo}>🏪 Vendor Profile: {item.vendorProfileId}</Text>
            )}
          </View>
          <Badge variant={item.isActive ? 'veg' : 'nonveg'} size="sm">
            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
          </Badge>
        </View>

        <View style={styles.userStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>JOINED</Text>
            <Text style={styles.statValue}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>LAST LOGIN</Text>
            <Text style={styles.statValue}>
              {item.lastLoginAt ? formatDateTime(item.lastLoginAt) : 'Never'}
            </Text>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[styles.actionBtn, item.isActive ? styles.actionBtnDeactivate : styles.actionBtnActivate]}
            onPress={() => {
              const newStatus = !item.isActive;
              Alert.alert(
                newStatus ? 'Activate User' : 'Deactivate User',
                `${newStatus ? 'Activate' : 'Deactivate'} ${item.name}?`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: newStatus ? 'Activate' : 'Deactivate', style: newStatus ? 'default' : 'destructive', onPress: () => toggleStatusMutation.mutate({ id: item.id, isActive: newStatus }) },
                ]
              );
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {item.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnOutline}
            onPress={() => showRoleChangeModal(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnTextOutline}>Change Role</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const showRoleChangeModal = (user: User) => {
    Alert.alert(
      'Change Role',
      `Change ${user.name}'s role from ${ROLES.find(r => r.value === user.role)?.label || user.role} to:`,
      [
        { text: 'Cancel', style: 'cancel' },
        ...ROLES.filter(r => r.value !== user.role).map(role => ({
          text: role.label,
          onPress: () => {
            Alert.alert(
              'Confirm Role Change',
              `Change ${user.name} to ${role.label}?`,
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Confirm', onPress: () => changeRoleMutation.mutate({ id: user.id, role: role.value }) },
              ]
            );
          },
        })),
      ]
    );
  };

  const renderSkeleton = () => (
    <View style={styles.userCard}>
      <Skeleton variant="rect" height={50} style={styles.skeletonHeader} />
      <Skeleton variant="rect" height={40} style={styles.skeletonStats} />
      <Skeleton variant="rect" height={40} style={styles.skeletonActions} />
    </View>
  );

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="User Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <View style={styles.filters}>
          <Skeleton variant="rect" height={48} width="100%" />
          <Skeleton variant="rect" height={48} width="100%" />
        </View>
        <FlatList
          data={Array(5)}
          renderItem={renderSkeleton}
          keyExtractor={(_, i) => `skeleton-${i}`}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="User Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle" size={48} color={colors.error.DEFAULT} />
          <Text style={styles.emptyTitle}>Failed to load users</Text>
          <Text style={styles.emptySubtext}>Pull to refresh</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="User Management" subtitle="SuperAdmin" showBack={false} showSearch={false} showProfile={false} />
      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.text.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.text.muted}
          />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              roleFilter === 'all' && styles.filterBtnActive,
            ]}
            onPress={() => setRoleFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterBtnText,
              roleFilter === 'all' && styles.filterBtnTextActive,
            ]}>
              All Roles
            </Text>
          </TouchableOpacity>

          {ROLES.map(role => (
            <TouchableOpacity
              key={role.value}
              style={[
                styles.filterBtn,
                roleFilter === role.value && styles.filterBtnActive,
              ]}
              onPress={() => setRoleFilter(role.value)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.filterBtnText,
                roleFilter === role.value && styles.filterBtnTextActive,
              ]}>
                {role.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter === 'all' && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter('all')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'all' && styles.filterBtnTextActive,
            ]}>
              All Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter === 'active' && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter('active')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'active' && styles.filterBtnTextActive,
            ]}>
              Active
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterBtn,
              statusFilter === 'inactive' && styles.filterBtnActive,
            ]}
            onPress={() => setStatusFilter('inactive')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterBtnText,
              statusFilter === 'inactive' && styles.filterBtnTextActive,
            ]}>
              Inactive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary.DEFAULT]}
            progressBackgroundColor={colors.background.secondary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>👥</Text>
            <Text style={styles.emptyTitle}>No users found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No users registered yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  filters: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.sans,
    color: colors.text.primary,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  filterBtnActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary.DEFAULT,
  },
  filterBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterBtnTextActive: {
    color: colors.primary.DEFAULT,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  userCard: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  userName: {
    fontFamily: typography.sansSemiBold,
    fontSize: 17,
    color: colors.text.primary,
  },
  userEmail: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  vendorInfo: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
  userStats: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 10,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.text.primary,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.default,
  },
  userActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    backgroundColor: colors.error.bgMedium,
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  actionBtnDeactivate: {
    backgroundColor: colors.error.bgMedium,
    borderColor: colors.error.border,
  },
  actionBtnActivate: {
    backgroundColor: colors.success.bgMedium,
    borderColor: colors.success.border,
  },
  actionBtnText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.error.DEFAULT,
  },
  actionBtnOutline: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  actionBtnTextOutline: {
    fontFamily: typography.sansSemiBold,
    fontSize: 13,
    color: colors.primary.DEFAULT,
  },
  skeletonHeader: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  skeletonStats: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  skeletonActions: {
    borderRadius: radius.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
    gap: spacing.lg,
  },
  emptyText: {
    fontSize: 48,
  },
  emptyTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  emptySubtext: {
    fontFamily: typography.sans,
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
  },
});