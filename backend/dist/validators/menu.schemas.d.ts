import { z } from 'zod';
export declare const createMenuItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        price: z.ZodNumber;
        category: z.ZodEnum<["breakfast", "lunch", "snacks", "beverages", "dinner"]>;
        dietType: z.ZodEnum<["veg", "non-veg", "vegan", "gluten-free"]>;
        imageUrl: z.ZodOptional<z.ZodString>;
        prepTimeMinutes: z.ZodDefault<z.ZodNumber>;
        tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        price: number;
        category: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner";
        dietType: "veg" | "non-veg" | "vegan" | "gluten-free";
        prepTimeMinutes: number;
        tags: string[];
        imageUrl?: string | undefined;
    }, {
        name: string;
        description: string;
        price: number;
        category: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner";
        dietType: "veg" | "non-veg" | "vegan" | "gluten-free";
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        description: string;
        price: number;
        category: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner";
        dietType: "veg" | "non-veg" | "vegan" | "gluten-free";
        prepTimeMinutes: number;
        tags: string[];
        imageUrl?: string | undefined;
    };
}, {
    body: {
        name: string;
        description: string;
        price: number;
        category: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner";
        dietType: "veg" | "non-veg" | "vegan" | "gluten-free";
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    };
}>;
export declare const updateMenuItemSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        category: z.ZodOptional<z.ZodEnum<["breakfast", "lunch", "snacks", "beverages", "dinner"]>>;
        dietType: z.ZodOptional<z.ZodEnum<["veg", "non-veg", "vegan", "gluten-free"]>>;
        imageUrl: z.ZodOptional<z.ZodString>;
        prepTimeMinutes: z.ZodOptional<z.ZodNumber>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    }, {
        name?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    };
}, {
    body: {
        name?: string | undefined;
        description?: string | undefined;
        price?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        imageUrl?: string | undefined;
        prepTimeMinutes?: number | undefined;
        tags?: string[] | undefined;
    };
}>;
export declare const menuItemQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        category: z.ZodOptional<z.ZodEnum<["breakfast", "lunch", "snacks", "beverages", "dinner"]>>;
        dietType: z.ZodOptional<z.ZodEnum<["veg", "non-veg", "vegan", "gluten-free"]>>;
        isAvailable: z.ZodOptional<z.ZodBoolean>;
        search: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodEnum<["name", "price", "createdAt", "prepTimeMinutes"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "createdAt" | "name" | "price" | "prepTimeMinutes";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        isAvailable?: boolean | undefined;
    }, {
        search?: string | undefined;
        limit?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        isAvailable?: boolean | undefined;
        page?: number | undefined;
        sortBy?: "createdAt" | "name" | "price" | "prepTimeMinutes" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "createdAt" | "name" | "price" | "prepTimeMinutes";
        sortOrder: "asc" | "desc";
        search?: string | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        isAvailable?: boolean | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        limit?: number | undefined;
        category?: "breakfast" | "lunch" | "snacks" | "beverages" | "dinner" | undefined;
        dietType?: "veg" | "non-veg" | "vegan" | "gluten-free" | undefined;
        isAvailable?: boolean | undefined;
        page?: number | undefined;
        sortBy?: "createdAt" | "name" | "price" | "prepTimeMinutes" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export declare const menuItemIdSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
}, {
    params: {
        id: string;
    };
}>;
export declare const toggleAvailabilitySchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        isAvailable: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        isAvailable: boolean;
    }, {
        isAvailable: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        isAvailable: boolean;
    };
}, {
    params: {
        id: string;
    };
    body: {
        isAvailable: boolean;
    };
}>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>['body'];
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>['body'];
//# sourceMappingURL=menu.schemas.d.ts.map