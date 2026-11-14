import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { IMenuItem } from '../models/MenuItem';
export interface MenuItemFilter {
    vendorId: Types.ObjectId;
    category?: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
    dietType?: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
    isAvailable?: boolean;
    search?: string;
}
export declare class MenuItemRepository extends BaseRepository<IMenuItem> {
    constructor();
    findByVendorId(vendorId: string | Types.ObjectId, filter?: Partial<MenuItemFilter>, options?: PaginationOptions): Promise<PaginatedResult<IMenuItem>>;
    findAvailableByVendorId(vendorId: string | Types.ObjectId): Promise<IMenuItem[]>;
    findByCategory(vendorId: string | Types.ObjectId, category: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner'): Promise<IMenuItem[]>;
    toggleAvailability(menuItemId: string | Types.ObjectId): Promise<IMenuItem | null>;
    incrementOrderCount(menuItemId: string | Types.ObjectId): Promise<IMenuItem | null>;
    searchByVendor(vendorId: string | Types.ObjectId, query: string, options?: PaginationOptions): Promise<PaginatedResult<IMenuItem>>;
}
export declare const menuItemRepository: MenuItemRepository;
//# sourceMappingURL=menuItem.repository.d.ts.map