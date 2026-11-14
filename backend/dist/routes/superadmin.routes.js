"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const superadminController = __importStar(require("../controllers/superadmin.controller"));
const validation_1 = require("../middleware/validation");
const vendor_schemas_1 = require("../validators/vendor.schemas");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
router.use(auth_1.authenticate, rbac_1.requireSuperAdmin);
router.get('/vendors', (0, validation_1.validate)(vendor_schemas_1.vendorQuerySchema), wrap(superadminController.listVendors));
router.get('/vendors/:id', (0, validation_1.validate)(vendor_schemas_1.vendorIdSchema), wrap(superadminController.getVendor));
router.patch('/vendors/:id/approve', (0, validation_1.validate)(vendor_schemas_1.approveVendorSchema), wrap(superadminController.approveVendor));
router.get('/users', wrap(superadminController.listUsers));
router.patch('/users/:id/status', wrap(superadminController.updateUserStatus));
router.get('/analytics', wrap(superadminController.getAnalytics));
router.get('/analytics/orders', wrap(superadminController.getOrderAnalytics));
router.get('/analytics/revenue', wrap(superadminController.getRevenueAnalytics));
exports.default = router;
//# sourceMappingURL=superadmin.routes.js.map