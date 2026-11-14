"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleAvailabilitySchema = exports.menuItemIdSchema = exports.menuItemQuerySchema = exports.updateMenuItemSchema = exports.createMenuItemSchema = void 0;
const zod_1 = require("zod");
exports.createMenuItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100),
        description: zod_1.z.string().min(10).max(500),
        price: zod_1.z.number().int().positive().max(999999),
        category: zod_1.z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']),
        dietType: zod_1.z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']),
        imageUrl: zod_1.z.string().url().optional(),
        prepTimeMinutes: zod_1.z.number().int().positive().max(120).default(15),
        tags: zod_1.z.array(zod_1.z.string().max(30)).max(10).default([]),
    }),
});
exports.updateMenuItemSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        description: zod_1.z.string().min(10).max(500).optional(),
        price: zod_1.z.number().int().positive().max(999999).optional(),
        category: zod_1.z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']).optional(),
        dietType: zod_1.z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']).optional(),
        imageUrl: zod_1.z.string().url().optional(),
        prepTimeMinutes: zod_1.z.number().int().positive().max(120).optional(),
        tags: zod_1.z.array(zod_1.z.string().max(30)).max(10).optional(),
    }),
});
exports.menuItemQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
        category: zod_1.z.enum(['breakfast', 'lunch', 'snacks', 'beverages', 'dinner']).optional(),
        dietType: zod_1.z.enum(['veg', 'non-veg', 'vegan', 'gluten-free']).optional(),
        isAvailable: zod_1.z.coerce.boolean().optional(),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['name', 'price', 'createdAt', 'prepTimeMinutes']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    }),
});
exports.menuItemIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
    }),
});
exports.toggleAvailabilitySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
    }),
    body: zod_1.z.object({
        isAvailable: zod_1.z.boolean(),
    }),
});
//# sourceMappingURL=menu.schemas.js.map