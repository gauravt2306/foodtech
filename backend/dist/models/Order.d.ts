import mongoose, { Document, Types } from 'mongoose';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentMethod = 'upi' | 'cash';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export interface IOrderItem {
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    dietType: 'veg' | 'non-veg';
}
export interface IOrder extends Document {
    orderNumber: string;
    employeeId: Types.ObjectId;
    vendorId: Types.ObjectId;
    items: IOrderItem[];
    status: OrderStatus;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentId?: string;
    qrCodeData: string;
    handoffAt?: Date;
    handoffBy?: Types.ObjectId;
    specialInstructions?: string;
    pickupTime?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, {}> & IOrder & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Order.d.ts.map