import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VendorNavigationProp } from '@/navigation/types';
import { useVendorStore } from '@/store/vendorStore';
import { Category, DietType, CreateMenuItemRequest } from '@/types/api';
import { colors, spacing, radius, typography, shadows } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';

export const MenuItemCreateScreen = () => {
  const navigation = useNavigation<VendorNavigationProp>();
  const { createMenuItem, isLoading } = useVendorStore();

  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    name: '',
    description: '',
    price: 0,
    category: 'main',
    dietType: 'none',
    imageUrl: '',
    prepTimeMinutes: 0,
    tags: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);

  const categories: Category[] = ['appetizer', 'main', 'dessert', 'beverage', 'side'];
  const dietTypes: DietType[] = ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'halal', 'none'];

  const updateField = <K extends keyof CreateMenuItemRequest>(field: K, value: any) => {
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
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.dietType) newErrors.dietType = 'Diet type is required';
    if (formData.prepTimeMinutes < 0) newErrors.prepTimeMinutes = 'Prep time cannot be negative';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await createMenuItem(formData);
      navigation.goBack();
    } catch (err: any) {
      // Error handled by store
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add Menu Item</Text>

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
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? <Text style={styles.saveButtonText}>Creating...</Text> : <Text style={styles.saveButtonText}>Create Menu Item</Text>}
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
    fontSize: typography.xl,
    color: colors.text.primary,
  },
  section: {
    backgroundColor: colors.surface.DEFAULT,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  sectionTitle: {
    fontFamily: typography.sansBold,
    fontSize: typography.lg,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing.sm,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.text.secondary,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    fontFamily: typography.sans,
    fontSize: typography.md,
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
    color: colors.text.muted,
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
  saveButton: {
    height: 56,
    backgroundColor: colors.primary.DEFAULT,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.border.subtle,
  },
  saveButtonText: {
    fontFamily: typography.sansSemiBold,
    fontSize: typography.md,
    color: colors.primary.foreground,
  },
});