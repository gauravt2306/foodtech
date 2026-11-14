import mongoose, { Document, Schema, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'upi' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  name: string;
  price: number; // in paise (snapshot at order time)
  quantity: number;
  dietType: 'veg' | 'non-veg';
}

export interface IOrder extends Document {
  orderNumber: string; // "ORD-YYYYMMDD-XXXX"
  employeeId: Types.ObjectId;
  vendorId: Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  subtotal: number; // in paise
  tax: number; // in paise
  total: number; // in paise
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  qrCodeData: string; // base64 encoded token for handoff
  handoffAt?: Date;
  handoffBy?: Types.ObjectId;
  specialInstructions?: string;
  pickupTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
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
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'VendorProfile',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr: IOrderItem[]) => arr.length > 0,
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
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

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

export const Order = mongoose.model<IOrder>('Order', orderSchema);