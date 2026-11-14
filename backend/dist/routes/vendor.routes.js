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
const vendorController = __importStar(require("../controllers/vendor.controller"));
const validation_1 = require("../middleware/validation");
const menu_schemas_1 = require("../validators/menu.schemas");
const order_schemas_1 = require("../validators/order.schemas");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
const wrap = (fn) => (req, res, next) => fn(req, res).catch(next);
router.use(auth_1.authenticate, rbac_1.requireVendor);
router.get('/profile', wrap(vendorController.getProfile));
router.patch('/profile', wrap(vendorController.updateProfile));
router.post('/menu', (0, validation_1.validate)(menu_schemas_1.createMenuItemSchema), wrap(vendorController.createMenuItem));
router.get('/menu', (0, validation_1.validate)(menu_schemas_1.menuItemQuerySchema), wrap(vendorController.listMenuItems));
router.get('/menu/:id', (0, validation_1.validate)(menu_schemas_1.menuItemIdSchema), wrap(vendorController.getMenuItem));
router.patch('/menu/:id', (0, validation_1.validate)(menu_schemas_1.updateMenuItemSchema), wrap(vendorController.updateMenuItem));
router.delete('/menu/:id', (0, validation_1.validate)(menu_schemas_1.menuItemIdSchema), wrap(vendorController.deleteMenuItem));
router.patch('/menu/:id/toggle', (0, validation_1.validate)(menu_schemas_1.toggleAvailabilitySchema), wrap(vendorController.toggleAvailability));
router.get('/orders', (0, validation_1.validate)(order_schemas_1.vendorOrderQuerySchema), wrap(vendorController.listOrders));
router.get('/orders/:id', (0, validation_1.validate)(order_schemas_1.orderIdSchema), wrap(vendorController.getOrder));
router.patch('/orders/:id/status', (0, validation_1.validate)(order_schemas_1.updateOrderStatusSchema), wrap(vendorController.updateOrderStatus));
router.post('/orders/:id/handoff', (0, validation_1.validate)(order_schemas_1.handoffOrderSchema), wrap(vendorController.handoffOrder));
exports.default = router;
//# sourceMappingURL=vendor.routes.js.map