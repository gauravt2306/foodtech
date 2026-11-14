import mongoose, { Document, Types } from 'mongoose';
export type DietType = 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
export type Category = 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
export interface IMenuItem extends Document {
    vendorId: Types.ObjectId;
    name: string;
    description: string;
    price: number;
    category: Category;
    dietType: DietType;
    imageUrl?: string;
    isAvailable: boolean;
    prepTimeMinutes: number;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const MenuItem: mongoose.Model<IMenuItem, {}, {}, {}, mongoose.Document<unknown, {}, IMenuItem, {}, {}> & IMenuItem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MenuItem.d.ts.map