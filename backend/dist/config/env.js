"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTest = exports.isProduction = exports.isDevelopment = exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.coerce.number().default(4000),
    API_PREFIX: zod_1.z.string().default('/api/v1'),
    MONGODB_URI: zod_1.z.string().url().min(1),
    MONGODB_DB: zod_1.z.string().min(1),
    MONGODB_TLS_CERT_FILE: zod_1.z.string().optional(),
    MONGODB_TLS_CA_FILE: zod_1.z.string().optional(),
    MONGODB_URI_DEV: zod_1.z.string().optional(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string().default('30d'),
    FRONTEND_URL: zod_1.z.string().url().default('http://localhost:8081'),
    UPLOAD_DIR: zod_1.z.string().default('./uploads'),
    MAX_FILE_SIZE: zod_1.z.coerce.number().default(5242880),
});
exports.env = envSchema.parse(process.env);
exports.isDevelopment = exports.env.NODE_ENV === 'development';
exports.isProduction = exports.env.NODE_ENV === 'production';
exports.isTest = exports.env.NODE_ENV === 'test';
//# sourceMappingURL=env.js.map