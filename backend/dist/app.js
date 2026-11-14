"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const requestId_1 = require("./middleware/requestId");
const requestLogger_1 = require("./middleware/requestLogger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
const vendor_routes_1 = __importDefault(require("./routes/vendor.routes"));
const employee_routes_1 = __importDefault(require("./routes/employee.routes"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request ID & logging (early in stack)
app.use(requestId_1.requestId);
app.use(requestLogger_1.requestLogger);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});
const apiPrefix = env_1.env.API_PREFIX;
app.use(`${apiPrefix}/auth`, auth_routes_1.default);
app.use(`${apiPrefix}/superadmin`, superadmin_routes_1.default);
app.use(`${apiPrefix}/vendor`, vendor_routes_1.default);
app.use(`${apiPrefix}/employee`, employee_routes_1.default);
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map