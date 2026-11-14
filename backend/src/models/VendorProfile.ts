import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOperatingHours {
  open: string;  // "09:00"
  close: string; // "22:00"
}

export interface IVendorProfile extends Document {
  userId: Types.ObjectId;
  businessName: string;
  gstNumber: string;
  address: IAddress;
  operatingHours: IOperatingHours;
  isApproved: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rating: number;
  totalOrders: number;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: /^\d{6}$/ },
  },
  { _id: false }
);

const operatingHoursSchema = new Schema<IOperatingHours>(
  {
    open: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    close: { type: String, required: true, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  },
  { _id: false }
);

const vendorProfileSchema = new Schema<IVendorProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vendorProfileSchema.index({ isApproved: 1, rating: -1 });

export const VendorProfile = mongoose.model<IVendorProfile>('VendorProfile', vendorProfileSchema);