import { z } from 'zod';
export declare const createOrderSchema: z.ZodObject<{
    body: z.ZodObject<{
        vendorId: z.ZodString;
        items: z.ZodArray<z.ZodObject<{
            menuItemId: z.ZodString;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            menuItemId: string;
            quantity: number;
        }, {
            menuItemId: string;
            quantity: number;
        }>, "many">;
        paymentMethod: z.ZodEnum<["upi", "cash"]>;
        specialInstructions: z.ZodOptional<z.ZodString>;
        pickupTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        vendorId: string;
        items: {
            menuItemId: string;
            quantity: number;
        }[];
        paymentMethod: "upi" | "cash";
        specialInstructions?: string | undefined;
        pickupTime?: string | undefined;
    }, {
        vendorId: string;
        items: {
            menuItemId: string;
            quantity: number;
        }[];
        paymentMethod: "upi" | "cash";
        specialInstructions?: string | undefined;
        pickupTime?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        vendorId: string;
        items: {
            menuItemId: string;
            quantity: number;
        }[];
        paymentMethod: "upi" | "cash";
        specialInstructions?: string | undefined;
        pickupTime?: string | undefined;
    };
}, {
    body: {
        vendorId: string;
        items: {
            menuItemId: string;
            quantity: number;
        }[];
        paymentMethod: "upi" | "cash";
        specialInstructions?: string | undefined;
        pickupTime?: string | undefined;
    };
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        status: z.ZodEnum<["confirmed", "preparing", "ready", "completed", "cancelled"]>;
    }, "strip", z.ZodTypeAny, {
        status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
    }, {
        status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
    };
}, {
    params: {
        id: string;
    };
    body: {
        status: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
    };
}>;
export declare const handoffOrderSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        qrToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        qrToken: string;
    }, {
        qrToken: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        qrToken: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        qrToken: string;
    };
}>;
export declare const orderQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]>>;
        startDate: z.ZodOptional<z.ZodString>;
        endDate: z.ZodOptional<z.ZodString>;
        sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "total", "status"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "total";
        sortOrder: "asc" | "desc";
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }, {
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "status" | "createdAt" | "total" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "total";
        sortOrder: "asc" | "desc";
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}, {
    query: {
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "status" | "createdAt" | "total" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    };
}>;
export declare const orderIdSchema: z.ZodObject<{
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
export declare const dummyUpiPaymentSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
    }, {
        id: string;
    }>;
    body: z.ZodObject<{
        upiId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        upiId: string;
    }, {
        upiId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: string;
    };
    body: {
        upiId: string;
    };
}, {
    params: {
        id: string;
    };
    body: {
        upiId: string;
    };
}>;
export declare const vendorOrderQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        status: z.ZodOptional<z.ZodEnum<["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]>>;
        sortBy: z.ZodDefault<z.ZodEnum<["createdAt", "total", "status"]>>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "total";
        sortOrder: "asc" | "desc";
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
    }, {
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "status" | "createdAt" | "total" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        sortBy: "status" | "createdAt" | "total";
        sortOrder: "asc" | "desc";
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
    };
}, {
    query: {
        status?: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: "status" | "createdAt" | "total" | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    };
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type HandoffOrderInput = z.infer<typeof handoffOrderSchema>['body'];
//# sourceMappingURL=order.schemas.d.ts.map