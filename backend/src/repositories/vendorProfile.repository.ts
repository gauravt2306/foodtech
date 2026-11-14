import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { VendorProfile, IVendorProfile } from '../models/VendorProfile';

export interface VendorProfileFilter {
  isApproved?: boolean;
  search?: string;
}

export class VendorProfileRepository extends BaseRepository<IVendorProfile> {
  constructor() {
    super(VendorProfile);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IVendorProfile | null> {
    return this.model.findOne({ userId }).exec();
  }

  async findApproved(options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>> {
    return this.findPaginated({ isApproved: true }, options);
  }

  async findPending(options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>> {
    return this.findPaginated({ isApproved: false }, options);
  }

  async approve(vendorProfileId: string | Types.ObjectId, approvedBy: Types.ObjectId): Promise<IVendorProfile | null> {
    return this.updateById(vendorProfileId, {
      isApproved: true,
      approvedBy,
      approvedAt: new Date(),
    });
  }

  async reject(vendorProfileId: string | Types.ObjectId, approvedBy: Types.ObjectId): Promise<IVendorProfile | null> {
    return this.updateById(vendorProfileId, {
      isApproved: false,
      approvedBy,
      approvedAt: new Date(),
    });
  }

  async updateRating(vendorProfileId: string | Types.ObjectId, rating: number, totalOrders: number): Promise<IVendorProfile | null> {
    return this.updateById(vendorProfileId, { rating, totalOrders });
  }

  async search(query: string, options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>> {
    const filter = {
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { gstNumber: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { 'address.state': { $regex: query, $options: 'i' } },
      ],
    };
    return this.findPaginated(filter, options);
  }
}

export const vendorProfileRepository = new VendorProfileRepository();