import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'superadmin' | 'vendor' | 'employee';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  vendorProfile?: Types.ObjectId;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['superadmin', 'vendor', 'employee'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    vendorProfile: {
      type: Schema.Types.ObjectId,
      ref: 'VendorProfile',
      sparse: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ role: 1, isActive: 1 });

userSchema.set('toJSON', {
  transform: (_doc: any, ret: any) => {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', userSchema);