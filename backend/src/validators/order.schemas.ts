import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    vendorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid vendor ID'),
    items: z
      .array(
        z.object({
          menuItemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid menu item ID'),
          quantity: z.number().int().positive().max(50),
        })
      )
      .min(1, 'At least one item required'),
    paymentMethod: z.enum(['upi', 'cash']),
    specialInstructions: z.string().max(500).optional(),
    pickupTime: z.string().datetime().optional(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
  body: z.object({
    status: z.enum(['confirmed', 'preparing', 'ready', 'completed', 'cancelled']),
  }),
});

export const handoffOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
  body: z.object({
    qrToken: z.string().min(1, 'QR token is required'),
  }),
});

export const orderQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
      .optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
});

export const dummyUpiPaymentSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
  body: z.object({
    upiId: z.string().min(3, 'UPI ID is required').max(100),
  }),
});

export const vendorOrderQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    status: z
      .enum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
      .optional(),
    sortBy: z.enum(['createdAt', 'total', 'status']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type HandoffOrderInput = z.infer<typeof handoffOrderSchema>['body'];