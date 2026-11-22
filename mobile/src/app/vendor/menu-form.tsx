'use client';

import React from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/services/vendor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '@/constants/colors';

interface MenuItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  dietType: string;
  prepTimeMinutes: string;
  imageUrl: string;
  tags: string;
  isAvailable: boolean;
}

const CATEGORIES = ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner'];
const DIET_TYPES = ['veg', 'non-veg', 'vegan', 'gluten-free'];

const CATEGORY_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  snacks: 'Snacks',
  beverages: 'Beverages',
  dinner: 'Dinner',
};

const DIET_LABELS: Record<string, string> = {
  veg: 'Vegetarian',
  'non-veg': 'Non-Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-Free',
};

export default function MenuFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;
  const itemId = params.id;

  const { data: existingItem, isLoading: isLoadingItem } = useQuery({
    queryKey: ['vendor-menu-item', itemId],
    queryFn: () => vendorApi.getMenuItem(itemId!),
    enabled: isEditing,
  });

  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<MenuItemForm>({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: 'lunch',
      dietType: 'veg',
      prepTimeMinutes: '15',
      imageUrl: '',
      tags: '',
      isAvailable: true,
    },
  });

  React.useEffect(() => {
    if (isEditing && existingItem?.data?.data) {
      const item = existingItem.data.data;
      reset({
        name: item.name,
        description: item.description,
        price: String(item.price / 100),
        category: item.category,
        dietType: item.dietType,
        prepTimeMinutes: String(item.prepTimeMinutes),
        imageUrl: item.imageUrl || '',
        tags: item.tags?.join(', ') || '',
        isAvailable: item.isAvailable,
      });
    }
  }, [existingItem, isEditing, reset]);

  const createMutation = useMutation({
    mutationFn: (data: MenuItemForm) => vendorApi.createMenuItem({
      name: data.name,
      description: data.description,
      price: Math.round(parseFloat(data.price) * 100),
      category: data.category as 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner',
      dietType: data.dietType as 'veg' | 'non-veg' | 'vegan' | 'gluten-free',
      prepTimeMinutes: parseInt(data.prepTimeMinutes),
      imageUrl: data.imageUrl || undefined,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu'] });
      router.back();
    },
    onError: (err: any) => {
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Failed to create menu item';
      setError(message);
      setSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: MenuItemForm) => vendorApi.updateMenuItem(itemId!, {
      name: data.name,
      description: data.description,
      price: Math.round(parseFloat(data.price) * 100),
      category: data.category as 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner',
      dietType: data.dietType as 'veg' | 'non-veg' | 'vegan' | 'gluten-free',
      prepTimeMinutes: parseInt(data.prepTimeMinutes),
      imageUrl: data.imageUrl || undefined,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      isAvailable: data.isAvailable,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-menu'] });
      router.back();
    },
    onError: (err: any) => {
      const message = err.response?.data?.error?.Message || err.response?.data?.errorInfo?.Message || 'Failed to update menu item';
      setError(message);
      setSubmitting(false);
    },
  });

  const onSubmit = async (data: MenuItemForm) => {
    setError(null);
    setSubmitting(true);

    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const price = watch('price');
  const priceInPaise = price ? Math.round(parseFloat(price) * 100) : 0;

  if (isEditing && isLoadingItem) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
          </Text>
        </View>

        <Card style={styles.formCard} padding="lg">
          <View>
            <Input
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name too long' },
              })}
              label="Item Name"
              placeholder="e.g., Butter Chicken"
              autoCapitalize="words"
              error={errors.name?.message}
            />

            <Input
              {...register('description', {
                required: 'Description is required',
                maxLength: { value: 500, message: 'Description too long' },
              })}
              label="Description"
              placeholder="Brief description of the item"
              multiline
              numberOfLines={3}
              error={errors.description?.message}
            />

            <View style={styles.row}>
              <Input
                {...register('price', {
                  required: 'Price is required',
                  validate: (value) => {
                    const num = parseFloat(value);
                    return (!isNaN(num) && num > 0) || 'Enter a valid price';
                  },
                })}
                label="Price (₹)"
                placeholder="150.00"
                keyboardType="decimal-pad"
                error={errors.price?.message}
                style={styles.halfInput}
              />
              <Input
                {...register('prepTimeMinutes', {
                  required: 'Prep time is required',
                  validate: (value) => {
                    const num = parseInt(value);
                    return (!isNaN(num) && num > 0 && num <= 120) || 'Enter valid minutes (1-120)';
                  },
                })}
                label="Prep Time (min)"
                placeholder="20"
                keyboardType="numeric"
                error={errors.prepTimeMinutes?.message}
                style={styles.halfInput}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>Category</Text>
                <View style={styles.selectWrapper}>
                  <View style={styles.select}>
                    <Input
                      {...register('category')}
                      label=""
                      placeholder="Select category"
                      editable={false}
                      style={styles.selectInput}
                    />
                    <Ionicons name="chevron-down" size={20} color={colors.text.muted} style={styles.selectIcon} />
                  </View>
                </View>
              </View>
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>Diet Type</Text>
                <View style={styles.selectWrapper}>
                  <View style={styles.select}>
                    <Input
                      {...register('dietType')}
                      label=""
                      placeholder="Select diet type"
                      editable={false}
                      style={styles.selectInput}
                    />
                    <Ionicons name="chevron-down" size={20} color={colors.text.muted} style={styles.selectIcon} />
                  </View>
                </View>
              </View>
            </View>

            <Input
              {...register('imageUrl')}
              label="Image URL (Optional)"
              placeholder="https://example.com/image.jpg"
              keyboardType="url"
              autoCapitalize="none"
            />

            <Input
              {...register('tags')}
              label="Tags (Optional)"
              placeholder="spicy, popular, chef's special"
              autoCapitalize="words"
            />

            <View style={styles.availabilityToggle}>
              <View style={styles.toggleLabel}>
                <Text style={styles.toggleText}>Available for Ordering</Text>
                <Text style={styles.toggleDesc}>Toggle to show/hide from customer menu</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggleTrack,
                  watch('isAvailable') && styles.toggleTrackActive,
                ]}
                onPress={() => setValue('isAvailable', !watch('isAvailable'))}
              >
                <View style={[
                  styles.toggleThumb,
                  watch('isAvailable') && styles.toggleThumbActive,
                ]} />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting || createMutation.isPending || updateMutation.isPending}
              className="mt-4"
              onPress={() => handleSubmit(onSubmit)()}
            >
              {isEditing ? 'Update Item' : 'Create Item'}
            </Button>
          </View>
        </Card>
      </ScrollView>

      <LoadingOverlay visible={submitting || createMutation.isPending || updateMutation.isPending} />
    </KeyboardAvoidingView>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  backBtn: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontFamily: typography.sansBold,
    fontSize: 20,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  selectContainer: {
    flex: 1,
  },
  selectLabel: {
    fontFamily: typography.sansMedium,
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  selectWrapper: {
    flex: 1,
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInput: {
    flex: 1,
  },
  selectIcon: {
    marginLeft: spacing.sm,
  },
  availabilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    marginTop: spacing.md,
  },
  toggleLabel: {
    flex: 1,
    gap: spacing.xs,
  },
  toggleText: {
    fontFamily: typography.sansSemiBold,
    fontSize: 15,
    color: colors.text.primary,
  },
  toggleDesc: {
    fontFamily: typography.sans,
    fontSize: 12,
    color: colors.text.muted,
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border.default,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.success.DEFAULT,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface.DEFAULT,
    shadowColor: colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: colors.shadow.opacity,
    shadowRadius: colors.shadow.radius,
    elevation: colors.shadow.elevation,
  },
  toggleThumbActive: {
    marginLeft: 24,
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
});