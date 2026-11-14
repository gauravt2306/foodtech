import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { IVendorProfile } from '../models/VendorProfile';
export interface VendorProfileFilter {
    isApproved?: boolean;
    search?: string;
}
export declare class VendorProfileRepository extends BaseRepository<IVendorProfile> {
    constructor();
    findByUserId(userId: string | Types.ObjectId): Promise<IVendorProfile | null>;
    findApproved(options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>>;
    findPending(options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>>;
    approve(vendorProfileId: string | Types.ObjectId, approvedBy: Types.ObjectId): Promise<IVendorProfile | null>;
    reject(vendorProfileId: string | Types.ObjectId, approvedBy: Types.ObjectId): Promise<IVendorProfile | null>;
    updateRating(vendorProfileId: string | Types.ObjectId, rating: number, totalOrders: number): Promise<IVendorProfile | null>;
    search(query: string, options?: PaginationOptions): Promise<PaginatedResult<IVendorProfile>>;
}
export declare const vendorProfileRepository: VendorProfileRepository;
//# sourceMappingURL=vendorProfile.repository.d.ts.map