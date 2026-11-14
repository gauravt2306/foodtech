"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase')
            .regex(/[a-z]/, 'Password must contain lowercase')
            .regex(/[0-9]/, 'Password must contain number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        phone: zod_1.z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone format').optional(),
        role: zod_1.z.enum(['employee', 'vendor']).default('employee'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1, 'Current password is required'),
        newPassword: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase')
            .regex(/[a-z]/, 'Password must contain lowercase')
            .regex(/[0-9]/, 'Password must contain number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
    }),
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, 'Reset token is required'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain uppercase')
            .regex(/[a-z]/, 'Password must contain lowercase')
            .regex(/[0-9]/, 'Password must contain number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain special character'),
    }),
});
//# sourceMappingURL=auth.schemas.js.map