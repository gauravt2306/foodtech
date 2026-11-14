"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../utils/jwt");
const ApiError_1 = require("../utils/ApiError");
function authenticate(req, _res, next) {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    if (!token) {
        throw ApiError_1.ApiError.unauthorized('Authentication required');
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.type !== 'access') {
            throw ApiError_1.ApiError.unauthorized('Invalid token type');
        }
        req.user = payload;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw ApiError_1.ApiError.unauthorized('Token expired');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw ApiError_1.ApiError.unauthorized('Invalid token');
        }
        throw error;
    }
}
function optionalAuth(req, _res, next) {
    const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
    if (!token) {
        return next();
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.type === 'access') {
            req.user = payload;
        }
    }
    catch {
        // Ignore invalid tokens for optional auth
    }
    next();
}
//# sourceMappingURL=auth.js.map