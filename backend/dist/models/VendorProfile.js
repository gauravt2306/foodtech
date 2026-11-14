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
exports.VendorProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const addressSchema = new mongoose_1.Schema({
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
}, { _id: false });
const operatingHoursSchema = new mongoose_1.Schema({
    open: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    close: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
}, { _id: false });
const vendorProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    businessName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
        index: true,
    },
    gstNumber: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
        unique: true,
        sparse: true,
        match: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    },
    address: {
        type: addressSchema,
        required: true,
    },
    operatingHours: {
        type: operatingHoursSchema,
        required: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true,
    },
    approvedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    approvedAt: {
        type: Date,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    totalOrders: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
    versionKey: false,
});
vendorProfileSchema.index({ isApproved: 1, rating: -1 });
exports.VendorProfile = mongoose_1.default.model('VendorProfile', vendorProfileSchema);
//# sourceMappingURL=VendorProfile.js.map