"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmployee = exports.requireVendor = exports.requireSuperAdmin = void 0;
exports.requireRole = requireRole;
exports.requireAnyRole = requireAnyRole;
exports.requireOwnershipOrRole = requireOwnershipOrRole;
const ApiError_1 = require("../utils/ApiError");
function requireRole(...allowedRoles) {
    return (req, _res, next) => {
        const authReq = req;
        if (!authReq.user) {
            throw ApiError_1.ApiError.unauthorized('Authentication required');
        }
        if (!allowedRoles.includes(authReq.user.role)) {
            throw ApiError_1.ApiError.forbidden(`Access denied. Required role(s): ${allowedRoles.join(', ')}`);
        }
        next();
    };
}
exports.requireSuperAdmin = requireRole('superadmin');
exports.requireVendor = requireRole('vendor');
exports.requireEmployee = requireRole('employee');
function requireAnyRole(...allowedRoles) {
    return requireRole(...allowedRoles);
}
function requireOwnershipOrRole(getResourceOwnerId, ...allowedRoles) {
    return async (req, _res, next) => {
        const authReq = req;
        if (!authReq.user) {
            throw ApiError_1.ApiError.unauthorized('Authentication required');
        }
        if (allowedRoles.includes(authReq.user.role)) {
            return next();
        }
        const ownerId = await getResourceOwnerId(req);
        if (authReq.user.sub === ownerId) {
            return next();
        }
        throw ApiError_1.ApiError.forbidden('Access denied: not resource owner');
    };
}
//# sourceMappingURL=rbac.js.map