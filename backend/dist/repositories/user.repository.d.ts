import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { IUser } from '../models/User';
export interface UserFilter {
    role?: 'superadmin' | 'vendor' | 'employee';
    isActive?: boolean;
    search?: string;
}
export declare class UserRepository extends BaseRepository<IUser> {
    constructor();
    findByEmail(email: string): Promise<IUser | null>;
    findByRole(role: 'superadmin' | 'vendor' | 'employee', options?: PaginationOptions): Promise<PaginatedResult<IUser>>;
    findActiveVendors(options?: PaginationOptions): Promise<PaginatedResult<IUser>>;
    findPendingVendors(options?: PaginationOptions): Promise<PaginatedResult<IUser>>;
    updateStatus(userId: string | Types.ObjectId, isActive: boolean): Promise<IUser | null>;
    assignVendorProfile(userId: string | Types.ObjectId, vendorProfileId: Types.ObjectId): Promise<IUser | null>;
    search(query: string, options?: PaginationOptions): Promise<PaginatedResult<IUser>>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=user.repository.d.ts.map