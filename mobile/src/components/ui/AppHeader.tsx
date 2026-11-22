'use client';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  showSearch?: boolean;
  onSearchPress?: () => void;
  showProfile?: boolean;
  profileImage?: string;
  isOnline?: boolean;
  style?: any;
}

export const AppHeader = ({
  title = 'FoodTech',
  subtitle = 'Corporate Dining',
  showBack = false,
  onBack,
  rightElement,
  showSearch = true,
  onSearchPress,
  showProfile = true,
  profileImage,
  isOnline = true,
  style,
}: AppHeaderProps) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleSearch = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push('/search');
    }
  };

  const handleProfile = () => {
    router.push('/employee/profile');
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left: Back button or Brand */}
      <View style={styles.leftSection}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.brandContainer}>
            <Text style={styles.subtitleText}>{subtitle}</Text>
            <Text style={styles.titleText}>{title}</Text>
          </View>
        )}
      </View>

      {/* Right: Search + Profile */}
      <View style={styles.rightSection}>
        {showSearch && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSearch}
            activeOpacity={0.7}
            accessibilityLabel="Search"
          >
            <Ionicons name="search" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity
            style={styles.profileButton}
            onPress={handleProfile}
            activeOpacity={0.7}
            accessibilityLabel="Profile"
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={profileImage ? { uri: profileImage } : undefined}
                style={styles.avatar}
                resizeMode="cover"
                // overflow property not valid for Image style
              />
              {!profileImage && (
                <Text style={styles.avatarPlaceholder}>👤</Text>
              )}
              {isOnline && <View style={styles.onlineIndicator} />}
            </View>
          </TouchableOpacity>
        )}

        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg + 10, // Account for status bar
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
    height: 100, // Fixed height with status bar padding
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
  },
  brandContainer: {
    gap: 2,
  },
  subtitleText: {
    fontFamily: typography.sans,
    fontWeight: '500' as const,
    fontSize: typography.xs,
    letterSpacing: typography.wideTracking,
    textTransform: 'uppercase',
    color: colors.text.muted,
    lineHeight: 16,
  },
  titleText: {
    fontFamily: typography.sans,
    fontWeight: '600' as const,
    fontSize: typography.xl,
    color: colors.text.primary,
    lineHeight: 28,
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  profileButton: {
    padding: 2,
  },
  avatarWrapper: {
    position: 'relative',
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  avatarPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontSize: 16,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.diet.veg,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
});

export default AppHeader;