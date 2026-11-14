"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorCodes = exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    isOperational;
    errors;
    constructor(statusCode, message, errors, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        Object.setPrototypeOf(this, ApiError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message = 'Bad Request', errors) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Not Found') {
        return new ApiError(404, message);
    }
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }
    static internal(message = 'Internal Server Error') {
        return new ApiError(500, message, undefined, false);
    }
    static tooManyRequests(message = 'Too Many Requests') {
        return new ApiError(429, message);
    }
}
exports.ApiError = ApiError;
exports.errorCodes = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',
};
//# sourceMappingURL=ApiError.js.map