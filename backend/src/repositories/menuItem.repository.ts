import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { MenuItem, IMenuItem } from '../models/MenuItem';

export interface MenuItemFilter {
  vendorId: Types.ObjectId;
  category?: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner';
  dietType?: 'veg' | 'non-veg' | 'vegan' | 'gluten-free';
  isAvailable?: boolean;
  search?: string;
}

export class MenuItemRepository extends BaseRepository<IMenuItem> {
  constructor() {
    super(MenuItem);
  }

  async findByVendorId(
    vendorId: string | Types.ObjectId,
    filter: Partial<MenuItemFilter> = {},
    options?: PaginationOptions
  ): Promise<PaginatedResult<IMenuItem>> {
    const query: any = { vendorId };
    if (filter.category) query.category = filter.category;
    if (filter.dietType) query.dietType = filter.dietType;
    if (filter.isAvailable !== undefined) query.isAvailable = filter.isAvailable;
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { description: { $regex: filter.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filter.search, 'i')] } },
      ];
    }
    return this.findPaginated(query, options);
  }

  async findAvailableByVendorId(vendorId: string | Types.ObjectId): Promise<IMenuItem[]> {
    return this.find({ vendorId, isAvailable: true });
  }

  async findByCategory(
    vendorId: string | Types.ObjectId,
    category: 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'dinner'
  ): Promise<IMenuItem[]> {
    return this.find({ vendorId, category, isAvailable: true });
  }

  async toggleAvailability(menuItemId: string | Types.ObjectId): Promise<IMenuItem | null> {
    const item = await this.findById(menuItemId);
    if (!item) return null;
    return this.updateById(menuItemId, { isAvailable: !item.isAvailable });
  }

  async incrementOrderCount(menuItemId: string | Types.ObjectId): Promise<IMenuItem | null> {
    return this.updateById(menuItemId, { $inc: { totalOrders: 1 } });
  }

  async searchByVendor(
    vendorId: string | Types.ObjectId,
    query: string,
    options?: PaginationOptions
  ): Promise<PaginatedResult<IMenuItem>> {
    const filter = {
      vendorId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    };
    return this.findPaginated(filter, options);
  }
}

export const menuItemRepository = new MenuItemRepository();