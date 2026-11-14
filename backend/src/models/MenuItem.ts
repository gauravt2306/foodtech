import mongoose, { Document, Schema, Types } from 'mongoose';

export type DietType = 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
export type Category = 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';

export interface IMenuItem extends Document {
  vendorId: Types.ObjectId;
  name: string;
  description: string;
  price: number; // in paise (integer)
  category: Category;
  dietType: DietType;
  imageUrl?: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    vendorId: {
      type: Schema.Types.ObjectId,
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
        validator: (arr: string[]) => arr.length <= 10,
        message: 'Maximum 10 tags allowed',
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

menuItemSchema.index({ vendorId: 1, category: 1 });
menuItemSchema.index({ vendorId: 1, isAvailable: 1 });
menuItemSchema.index({ vendorId: 1, dietType: 1 });

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);