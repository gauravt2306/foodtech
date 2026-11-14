"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorOrderQuerySchema = exports.dummyUpiPaymentSchema = exports.orderIdSchema = exports.orderQuerySchema = exports.handoffOrderSchema = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        vendorId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
        items: zod_1.z
            .array(zod_1.z.object({
            menuItemId: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
            quantity: zod_1.z.number().int().positive().max(50),
        }))
            .min(1, 'At least one item required'),
        paymentMethod: zod_1.z.enum(['upi', 'cash']),
        specialInstructions: zod_1.z.string().max(500).optional(),
        pickupTime: zod_1.z.string().datetime().optional(),
    }),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    }),
    body: zod_1.z.object({
        status: zod_1.z.enum(['confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
    }),
});
exports.handoffOrderSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    }),
    body: zod_1.z.object({
        qrToken: zod_1.z.string().min(1, 'QR token is required'),
    }),
});
exports.orderQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
        status: zod_1.z
            .enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
            .optional(),
        startDate: zod_1.z.string().datetime().optional(),
        endDate: zod_1.z.string().datetime().optional(),
        sortBy: zod_1.z.enum(['createdAt', 'total', 'status']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    }),
});
exports.orderIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    }),
});
exports.dummyUpiPaymentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    }),
    body: zod_1.z.object({
        upiId: zod_1.z.string().min(3, 'UPI ID is required').max(100),
    }),
});
exports.vendorOrderQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
        status: zod_1.z
            .enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
            .optional(),
        sortBy: zod_1.z.enum(['createdAt', 'total', 'status']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    }),
});
//# sourceMappingURL=order.schemas.js.map