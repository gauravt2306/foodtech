import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { User, IUser } from '../models/User';

export interface UserFilter {
  role?: 'superadmin' | 'vendor' | 'employee';
  isActive?: boolean;
  search?: string;
}

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByRole(role: 'superadmin' | 'vendor' | 'employee', options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.findPaginated({ role }, options);
  }

  async findActiveVendors(options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.findPaginated({ role: 'vendor', isActive: true }, options);
  }

  async findPendingVendors(options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    return this.findPaginated({ role: 'vendor', isActive: false }, options);
  }

  async updateStatus(userId: string | Types.ObjectId, isActive: boolean): Promise<IUser | null> {
    return this.updateById(userId, { isActive });
  }

  async assignVendorProfile(userId: string | Types.ObjectId, vendorProfileId: Types.ObjectId): Promise<IUser | null> {
    return this.updateById(userId, { vendorProfile: vendorProfileId });
  }

  async search(query: string, options?: PaginationOptions): Promise<PaginatedResult<IUser>> {
    const filter = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
      ],
    };
    return this.findPaginated(filter, options);
  }
}

export const userRepository = new UserRepository();