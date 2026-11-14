import { z } from 'zod';

export const createMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    description: z.string().min(10).max(500),
    price: z.number().int().positive().max(999999),
    category: z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']),
    dietType: z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']),
    imageUrl: z.string().url().optional(),
    prepTimeMinutes: z.number().int().positive().max(120).default(15),
    tags: z.array(z.string().max(30)).max(10).default([]),
  }),
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().min(10).max(500).optional(),
    price: z.number().int().positive().max(999999).optional(),
    category: z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']).optional(),
    dietType: z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']).optional(),
    imageUrl: z.string().url().optional(),
    prepTimeMinutes: z.number().int().positive().max(120).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
  }),
});

export const menuItemQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    category: z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']).optional(),
    dietType: z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']).optional(),
    isAvailable: z.coerce.boolean().optional(),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'price', 'createdAt', 'prepTimeMinutes']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const menuItemIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
  }),
});

export const toggleAvailabilitySchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
  }),
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>['body'];
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>['body'];