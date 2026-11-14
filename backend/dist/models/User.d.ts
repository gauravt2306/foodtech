import mongoose, { Document, Types } from 'mongoose';
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
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map