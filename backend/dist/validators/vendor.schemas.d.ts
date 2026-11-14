import { z } from 'zod';
export declare const createVendorProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        businessName: z.ZodString;
        gstNumber: z.ZodString;
        address: z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            pincode: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            pincode: string;
        }, {
            street: string;
            city: string;
            state: string;
            pincode: string;
        }>;
        operatingHours: z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        businessName: string;
        gstNumber: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        };
        operatingHours: {
            close: string;
            open: string;
        };
    }, {
        businessName: string;
        gstNumber: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        };
        operatingHours: {
            close: string;
            open: string;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        businessName: string;
        gstNumber: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        };
        operatingHours: {
            close: string;
            open: string;
        };
    };
}, {
    body: {
        businessName: string;
        gstNumber: string;
        address: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        };
        operatingHours: {
            close: string;
            open: string;
        };
    };
}>;
export declare const updateVendorProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        businessName: z.ZodOptional<z.ZodString>;
        address: z.ZodOptional<z.ZodObject<{
            street: z.ZodString;
            city: z.ZodString;
            state: z.ZodString;
            pincode: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            street: string;
            city: string;
            state: string;
            pincode: string;
        }, {
            street: string;
            city: string;
            state: string;
            pincode: string;
        }>>;
        operatingHours: z.ZodOptional<z.ZodObject<{
            open: z.ZodString;
            close: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            close: string;
            open: string;
        }, {
            close: string;
            open: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        businessName?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        } | undefined;
        operatingHours?: {
            close: string;
            open: string;
        } | undefined;
    }, {
        businessName?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        } | undefined;
        operatingHours?: {
            close: string;
            open: string;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        businessName?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        } | undefined;
        operatingHours?: {
            close: string;
            open: string;
        } | undefined;
    };
}, {
    body: {
        businessName?: string | undefined;
        address?: {
            street: string;
            city: string;
            state: string;
            pincode: string;
        } | undefined;
        operatingHours?: {
            close: string;
            open: string;
        } | undefined;
    };
}>;
export declare const approveVendorSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        approved: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        approved: boolean;
    }, {
        approved: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        approved: boolean;
    };
}, {
    params: {
        id: string;
    };
    body: {
        approved: boolean;
    };
}>;
export declare const vendorQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["pending", "approved", "rejected"]>>;
        search: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "businessName", "rating", "totalOrders"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "createdAt" | "businessName" | "rating" | "totalOrders";
        sortOrder: "asc" | "desc";
        status?: "pending" | "approved" | "rejected" | undefined;
        search?: string | undefined;
    }, {
        status?: "pending" | "approved" | "rejected" | undefined;
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "createdAt" | "businessName" | "rating" | "totalOrders" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "createdAt" | "businessName" | "rating" | "totalOrders";
        sortOrder: "asc" | "desc";
        status?: "pending" | "approved" | "rejected" | undefined;
        search?: string | undefined;
    };
}, {
    query: {
        status?: "pending" | "approved" | "rejected" | undefined;
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "createdAt" | "businessName" | "rating" | "totalOrders" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export declare const vendorIdSchema: z.ZodObject<{
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
export type CreateVendorProfileInput = z.infer<typeof createVendorProfileSchema>['body'];
export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>['body'];
//# sourceMappingURL=vendor.schemas.d.ts.map