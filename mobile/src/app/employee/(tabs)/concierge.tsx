'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppHeader } from '@/components/ui/AppHeader';
import { CTAButton } from '@/components/ui/CTAButton';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';
import { useRouter } from 'expo-router';

const CONCIERGE_SERVICES = [
  {
    id: 'dietary',
    icon: 'leaf',
    title: 'Dietary Preferences',
    description: 'Set allergies, vegetarian, vegan, gluten-free',
    action: 'Configure',
  },
  {
    id: 'scheduling',
    icon: 'calendar',
    title: 'Recurring Orders',
    description: 'Schedule daily/weekly meal deliveries',
    action: 'Schedule',
  },
  {
    id: 'budget',
    icon: 'wallet',
    title: 'Budget Controls',
    description: 'Set daily/weekly spending limits',
    action: 'Set Limits',
  },
  {
    id: 'preferences',
    icon: 'heart',
    title: 'Favorite Restaurants',
    description: 'Quick reorder from preferred venues',
    action: 'Manage',
  },
  {
    id: 'notifications',
    icon: 'bell',
    title: 'Smart Notifications',
    description: 'Order confirmations, delivery updates, offers',
    action: 'Configure',
  },
  {
    id: 'support',
    icon: 'headphones',
    title: 'Concierge Support',
    description: '24/7 dedicated support for executives',
    action: 'Contact',
  },
];

export default function ConciergeScreen() {
  const router = useRouter();

  const handleServicePress = (service: typeof CONCIERGE_SERVICES[0]) => {
    Alert.alert(`${service.title}`, `${service.description} - Coming soon!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Concierge" showBack={false} showSearch={false} showProfile={false} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroGradient} />
          <View style={styles.heroContent}>
            <View style={styles.heroIconWrapper}>
              <Ionicons name="sparkles" size={32} color={colors.primary.DEFAULT} />
            </View>
            <Text style={styles.heroTitle}>Executive Concierge</Text>
            <Text style={styles.heroSubtitle}>
              Personalized dining experience tailored for your lifestyle
            </Text>
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.servicesGrid}>
            {CONCIERGE_SERVICES.map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceCard, index % 2 === 1 && styles.serviceCardAlt]}
                onPress={() => handleServicePress(service)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIconWrapper}>
                  <Ionicons name={service.icon as any} size={24} color={colors.primary.DEFAULT} />
                </View>
                <View style={styles.serviceContent}>
                  <Text style={styles.serviceTitle}>{service.title}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
                <View style={styles.serviceAction}>
                  <Text style={styles.serviceActionText}>{service.action}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary.DEFAULT} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/employee/(tabs)/home')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrapper}>
                <Ionicons name="restaurant" size={24} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.quickActionLabel}>Browse Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/employee/(tabs)/orders')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrapper}>
                <Ionicons name="bag-handle" size={24} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.quickActionLabel}>View Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/employee/(tabs)/cart')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrapper}>
                <Ionicons name="bag" size={24} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.quickActionLabel}>My Bag</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/employee/(tabs)/profile')}
              activeOpacity={0.8}
            >
              <View style={styles.quickActionIconWrapper}>
                <Ionicons name="person" size={24} color={colors.primary.DEFAULT} />
              </View>
              <Text style={styles.quickActionLabel}>Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Features */}
        <View style={styles.premiumSection}>
          <View style={styles.premiumCard}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumBadge}>PREMIUM FEATURE</Text>
              <Text style={styles.premiumTitle}>White-Glove Service</Text>
              <Text style={styles.premiumDescription}>
                Upgrade to Executive Concierge for priority reservations, dedicated account manager, and exclusive restaurant access.
              </Text>
            </View>
            <CTAButton size="sm" onPress={() => Alert.alert('Coming Soon', 'Executive Concierge upgrade coming soon!')}>
              Learn More
            </CTAButton>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 140,
  },
  heroSection: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius['2xl'],
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  heroIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  heroTitle: {
    fontFamily: typography.sansBold,
    fontSize: 28,
    color: colors.text.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: typography.sans,
    fontSize: 15,
    color: colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  servicesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  servicesGrid: {
    gap: spacing.md,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    padding: spacing.md,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  serviceCardAlt: {
    backgroundColor: colors.surfaceVariant,
    borderColor: colors.border.default,
  },
  serviceIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  serviceContent: {
    flex: 1,
    gap: spacing.xs,
  },
  serviceTitle: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  serviceDescription: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.tertiary,
    lineHeight: 18,
  },
  serviceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
  },
  serviceActionText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 12,
    color: colors.primary.DEFAULT,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  quickActionIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 13,
    color: colors.text.primary,
    textAlign: 'center',
  },
  premiumSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  premiumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.surface.DEFAULT,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: radius['2xl'],
    padding: spacing.lg,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  premiumContent: {
    flex: 1,
    gap: spacing.sm,
  },
  premiumBadge: {
    fontFamily: typography.sansSemiBold,
    fontSize: 10,
    color: colors.primary.DEFAULT,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  premiumTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
  },
  premiumDescription: {
    fontFamily: typography.sans,
    fontSize: 13,
    color: colors.text.tertiary,
    lineHeight: 20,
  },
});