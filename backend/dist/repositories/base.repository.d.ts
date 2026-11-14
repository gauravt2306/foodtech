import { Document, FilterQuery, Model, QueryOptions, UpdateQuery, Types } from 'mongoose';
export interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: Record<string, 1 | -1>;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface IBaseRepository<T extends Document> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string | Types.ObjectId): Promise<T | null>;
    findByIdOrThrow(id: string | Types.ObjectId): Promise<T>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
    findPaginated(filter: FilterQuery<T>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
    updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>;
    deleteById(id: string | Types.ObjectId): Promise<boolean>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
}
export declare abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
    readonly model: Model<T>;
    protected constructor(model: Model<T>);
    create(data: Partial<T>): Promise<T>;
    findById(id: string | Types.ObjectId): Promise<T | null>;
    findByIdOrThrow(id: string | Types.ObjectId): Promise<T>;
    findOne(filter: FilterQuery<T>): Promise<T | null>;
    find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]>;
    findPaginated(filter: FilterQuery<T>, options?: PaginationOptions): Promise<PaginatedResult<T>>;
    updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null>;
    deleteById(id: string | Types.ObjectId): Promise<boolean>;
    exists(filter: FilterQuery<T>): Promise<boolean>;
    count(filter: FilterQuery<T>): Promise<number>;
}
//# sourceMappingURL=base.repository.d.ts.map