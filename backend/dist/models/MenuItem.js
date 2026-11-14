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
exports.MenuItem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const menuItemSchema = new mongoose_1.Schema({
    vendorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'VendorProfile',
        required: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: String,
        enum: ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner'],
        required: true,
        index: true,
    },
    dietType: {
        type: String,
        enum: ['veg', 'non-veg', 'vegan', 'gluten-free'],
        required: true,
        index: true,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    isAvailable: {
        type: Boolean,
        default: true,
        index: true,
    },
    prepTimeMinutes: {
        type: Number,
        required: true,
        min: 1,
        max: 120,
        default: 15,
    },
    tags: {
        type: [String],
        default: [],
        validate: {
            validator: (arr) => arr.length <= 10,
            message: 'Maximum 10 tags allowed',
        },
    },
}, {
    timestamps: true,
    versionKey: false,
});
menuItemSchema.index({ vendorId: 1, category: 1 });
menuItemSchema.index({ vendorId: 1, isAvailable: 1 });
menuItemSchema.index({ vendorId: 1, dietType: 1 });
exports.MenuItem = mongoose_1.default.model('MenuItem', menuItemSchema);
//# sourceMappingURL=MenuItem.js.map