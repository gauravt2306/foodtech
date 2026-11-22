import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { VendorNavigationProp, VendorStackParamList } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { Category, DietType, MenuItem, UpdateMenuItemRequest } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

type MenuItemEditRouteProp = RouteProp<VendorStackParamList, 'MenuItemEdit'>;

export const MenuItemEditScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const route = useRoute<MenuItemEditRouteProp>();
  const { menuItems, updateMenuItem, deleteMenuItem, isLoading } = useVendorStore();

  const [formData, setFormData] = useState<Required<Pick<UpdateMenuItemRequest, 'name' | 'description' | 'price' | 'category' | 'dietType' | 'imageUrl' | 'prepTimeMinutes' | 'tags' | 'isAvailable'>>>({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    dietType: 'none',
    imageUrl: '',
    prepTimeMinutes: 0,
    tags: [],
    isAvailable: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const categories: Category[] = ['appetizer', 'main', 'dessert', 'beverage', 'side'];
  const dietTypes: DietType[] = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'halal', 'none'];

  const item = menuItems.find(m => m.id === route.params.itemId);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price,
        category: item.category,
        dietType: item.dietType,
        imageUrl: item.imageUrl || '',
        prepTimeMinutes: item.prepTimeMinutes,
        tags: item.tags || [],
        isAvailable: item.isAvailable,
      });
      setTagsInput(item.tags?.join(', ') || '');
    }
  }, [item]);

  const updateField = <K extends keyof UpdateMenuItemRequest>(field: K, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleTagsChange = (text: string) => {
    setTagsInput(text);
    const tags = text.split(',').map(t => t.trim()).filter(t => t);
    updateField('tags', tags);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = 'Item name is required';
    if ((formData.price ?? 0) <= 0) newErrors.price = 'Price must be greater than 0';
    if ((formData.prepTimeMinutes ?? 0) < 0) newErrors.prepTimeMinutes = 'Prep time cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload: UpdateMenuItemRequest = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        dietType: formData.dietType,
        imageUrl: formData.imageUrl,
        prepTimeMinutes: formData.prepTimeMinutes,
        tags: formData.tags,
        isAvailable: formData.isAvailable,
      };
      await updateMenuItem(route.params.itemId, payload);
      Alert.alert('Success', 'Menu item updated successfully');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item?.name || 'this item'}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteMenuItem(route.params.itemId);
              Alert.alert('Success', 'Menu item deleted');
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete menu item');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Edit Menu Item</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Item Name *</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={formData.name}
                onChangeText={text => updateField('name', text)}
                placeholder="Enter item name"
                autoCapitalize="words"
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={text => updateField('description', text)}
                placeholder="Describe the item"
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price (in ₹) *</Text>
              <TextInput
                style={[styles.input, errors.price && styles.inputError]}
                value={formData.price > 0 ? (formData.price / 100).toFixed(2) : ''}
                onChangeText={text => {
                  const value = parseFloat(text) * 100;
                  updateField('price', isNaN(value) ? 0 : Math.round(value));
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.selectContainer}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.selectButton, formData.category === cat && styles.selectButtonActive]}
                    onPress={() => updateField('category', cat)}
                  >
                    <Text style={[styles.selectButtonText, formData.category === cat && styles.selectButtonTextActive]}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Diet Type *</Text>
              <View style={styles.selectContainer}>
                {dietTypes.map(dt => (
                  <TouchableOpacity
                    key={dt}
                    style={[styles.selectButton, formData.dietType === dt && styles.selectButtonActive]}
                    onPress={() => updateField('dietType', dt)}
                  >
                    <Text style={[styles.selectButtonText, formData.dietType === dt && styles.selectButtonTextActive]}>
                      {dt === 'none' ? 'None' : dt.charAt(0).toUpperCase() + dt.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prep Time (minutes) *</Text>
              <TextInput
                style={[styles.input, errors.prepTimeMinutes && styles.inputError]}
                value={formData.prepTimeMinutes > 0 ? formData.prepTimeMinutes.toString() : ''}
                onChangeText={text => {
                  const value = parseInt(text, 10);
                  updateField('prepTimeMinutes', isNaN(value) ? 0 : value);
                }}
                placeholder="15"
                keyboardType="numeric"
              />
              {errors.prepTimeMinutes && <Text style={styles.errorText}>{errors.prepTimeMinutes}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tags (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={tagsInput}
                onChangeText={handleTagsChange}
                placeholder="spicy, popular, chef-special"
              />
              <Text style={styles.hintText}>Separate tags with commas</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={formData.imageUrl}
                onChangeText={text => updateField('imageUrl', text)}
                placeholder="https://example.com/image.jpg"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <TouchableOpacity
                style={[styles.availabilityToggle, formData.isAvailable && styles.availabilityToggleActive]}
                onPress={() => updateField('isAvailable', !formData.isAvailable)}
              >
                <Text style={[styles.availabilityText, formData.isAvailable && styles.availabilityTextActive]}>
                  {formData.isAvailable ? '✓ Available' : '✗ Unavailable'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? <Text style={styles.saveButtonText}>Saving...</Text> : <Text style={styles.saveButtonText}>Save Changes</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting ? <Text style={styles.deleteButtonText}>Deleting...</Text> : <Text style={styles.deleteButtonText}>Delete Menu Item</Text>}
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
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  formContainer: {
    gap: spacing.xl,
  },
  formTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography['2xl'],
    color: colors.text.primary,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.lg,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.md,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing.md,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: typography.sansMedium,
    fontSize: typography.sm,
    color: colors.text.secondary,
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
  textArea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error.DEFAULT,
    backgroundColor: colors.error.bg,
  },
  errorText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.error.DEFAULT,
  },
  hintText: {
    fontFamily: typography.sans,
    fontSize: typography.xs,
    color: colors.text.tertiary,
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
    minWidth: 100,
    alignItems: 'center',
  },
  selectButtonActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  selectButtonText: {
    fontFamily: typography.sansMedium,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  selectButtonTextActive: {
    color: colors.primary.foreground,
  },
  availabilityToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.background.secondary,
  },
  availabilityToggleActive: {
    backgroundColor: colors.success.bg,
    borderColor: colors.success.border,
  },
  availabilityText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.muted,
  },
  availabilityTextActive: {
    color: colors.success.dark,
  },
  saveButton: {
    height: 56,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  saveButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.primary.foreground,
  },
  deleteButton: {
    height: 56,
    backgroundColor: colors.error.bg,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error.border,
  },
  deleteButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.lg,
    color: colors.error.dark,
  },
});