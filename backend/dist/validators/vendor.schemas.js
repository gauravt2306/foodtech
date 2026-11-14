"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorIdSchema = exports.vendorQuerySchema = exports.approveVendorSchema = exports.updateVendorProfileSchema = exports.createVendorProfileSchema = void 0;
const zod_1 = require("zod");
exports.createVendorProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2).max(150),
        gstNumber: zod_1.z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
        address: zod_1.z.object({
            street: zod_1.z.string().min(1),
            city: zod_1.z.string().min(1),
            state: zod_1.z.string().min(1),
            pincode: zod_1.z.string().regex(/^\d{6}$/),
        }),
        operatingHours: zod_1.z.object({
            open: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
            close: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        }),
    }),
});
exports.updateVendorProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        businessName: zod_1.z.string().min(2).max(150).optional(),
        address: zod_1.z
            .object({
            street: zod_1.z.string().min(1),
            city: zod_1.z.string().min(1),
            state: zod_1.z.string().min(1),
            pincode: zod_1.z.string().regex(/^\d{6}$/),
        })
            .optional(),
        operatingHours: zod_1.z
            .object({
            open: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
            close: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        })
            .optional(),
    }),
});
exports.approveVendorSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
    }),
    body: zod_1.z.object({
        approved: zod_1.z.boolean(),
    }),
});
exports.vendorQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(20),
        status: zod_1.z.enum(['pending', 'approved', 'rejected']).optional(),
        search: zod_1.z.string().optional(),
        sortBy: zod_1.z.enum(['createdAt', 'businessName', 'rating', 'totalOrders']).default('createdAt'),
        sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
    }),
});
exports.vendorIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
    }),
});
//# sourceMappingURL=vendor.schemas.js.map