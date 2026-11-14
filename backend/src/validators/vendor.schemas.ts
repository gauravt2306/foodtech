import { z } from 'zod';

export const createVendorProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).max(150),
    gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      pincode: z.string().regex(/^\d{6}$/),
    }),
    operatingHours: z.object({
      open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    }),
  }),
});

export const updateVendorProfileSchema = z.object({
  body: z.object({
    businessName: z.string().min(2).max(150).optional(),
    address: z
      .object({
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        pincode: z.string().regex(/^\d{6}$/),
      })
      .optional(),
    operatingHours: z
      .object({
        open: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
        close: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      })
      .optional(),
  }),
});

export const approveVendorSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
  }),
  body: z.object({
    approved: z.boolean(),
  }),
});

export const vendorQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z.enum(['pending', 'approved', 'rejected']).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['createdAt', 'businessName', 'rating', 'totalOrders']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const vendorIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
  }),
});

export type CreateVendorProfileInput = z.infer<typeof createVendorProfileSchema>['body'];
export type UpdateVendorProfileInput = z.infer<typeof updateVendorProfileSchema>['body'];