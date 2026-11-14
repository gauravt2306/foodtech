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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    menuItemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 50,
    },
    dietType: {
        type: String,
        enum: ['veg', 'non-veg'],
        required: true,
    },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    employeeId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
        index: true,
    },
    items: {
        type: [orderItemSchema],
        required: true,
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'Order must have at least one item',
        },
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
        default: 'pending',
        index: true,
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },
    tax: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    total: {
        type: Number,
        required: true,
        min: 0,
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'cash'],
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
        index: true,
    },
    paymentId: {
        type: String,
        trim: true,
        sparse: true,
        index: true,
    },
    qrCodeData: {
        type: String,
        required: true,
    },
    handoffAt: {
        type: Date,
    },
    handoffBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    specialInstructions: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    pickupTime: {
        type: Date,
    },
}, {
    timestamps: true,
    versionKey: false,
});
orderSchema.index({ employeeId: 1, createdAt: -1 });
orderSchema.index({ vendorId: 1, status: 1 });
orderSchema.index({ vendorId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
// Generate order number before save
orderSchema.pre('validate', function (next) {
    if (this.isNew && !this.orderNumber) {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        this.orderNumber = `ORD-${dateStr}-${random}`;
    }
    next();
});
exports.Order = mongoose_1.default.model('Order', orderSchema);
//# sourceMappingURL=Order.js.map