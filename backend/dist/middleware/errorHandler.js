"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const ApiError_1 = require("../utils/ApiError");
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
function sendErrorResponse(res, statusCode, code, message, details) {
    const response = {
        success: false,
        error: { code, message, details },
        meta: {
            timestamp: new Date().toISOString(),
            path: res.req?.path || '',
        },
    };
    res.status(statusCode).json(response);
}
function errorHandler(err, req, res, _next) {
    const log = req.log || logger_1.logger;
    log.error({
        err: {
            name: err.name,
            message: err.message,
            stack: err.stack,
        },
        path: req.path,
        method: req.method,
    }, 'Request error');
    if (err instanceof ApiError_1.ApiError) {
        sendErrorResponse(res, err.statusCode, ApiError_1.errorCodes.INTERNAL_ERROR, err.message, err.errors);
        return;
    }
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        for (const issue of err.issues) {
            const path = issue.path.join('.');
            if (!errors[path])
                errors[path] = [];
            errors[path].push(issue.message);
        }
        sendErrorResponse(res, 400, ApiError_1.errorCodes.VALIDATION_ERROR, 'Validation failed', errors);
        return;
    }
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const errors = {};
        for (const [field, error] of Object.entries(err.errors)) {
            errors[field] = [error.message];
        }
        sendErrorResponse(res, 400, ApiError_1.errorCodes.VALIDATION_ERROR, 'Database validation failed', errors);
        return;
    }
    if (err instanceof mongoose_1.default.Error.CastError) {
        sendErrorResponse(res, 400, ApiError_1.errorCodes.VALIDATION_ERROR, 'Invalid ID format');
        return;
    }
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        sendErrorResponse(res, 409, ApiError_1.errorCodes.CONFLICT, `${field} already exists`);
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        sendErrorResponse(res, 401, ApiError_1.errorCodes.TOKEN_INVALID, 'Invalid token');
        return;
    }
    if (err.name === 'TokenExpiredError') {
        sendErrorResponse(res, 401, ApiError_1.errorCodes.TOKEN_EXPIRED, 'Token expired');
        return;
    }
    const statusCode = 500;
    const message = env_1.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    sendErrorResponse(res, statusCode, ApiError_1.errorCodes.INTERNAL_ERROR, message);
}
function notFoundHandler(_req, res) {
    sendErrorResponse(res, 404, ApiError_1.errorCodes.NOT_FOUND, 'Route not found');
}
//# sourceMappingURL=errorHandler.js.map