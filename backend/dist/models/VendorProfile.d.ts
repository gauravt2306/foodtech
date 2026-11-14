import mongoose, { Document, Types } from 'mongoose';
export interface IAddress {
    street: string;
    city: string;
    state: string;
    pincode: string;
}
export interface IOperatingHours {
    open: string;
    close: string;
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
export declare const VendorProfile: mongoose.Model<IVendorProfile, {}, {}, {}, mongoose.Document<unknown, {}, IVendorProfile, {}, {}> & IVendorProfile & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=VendorProfile.d.ts.map