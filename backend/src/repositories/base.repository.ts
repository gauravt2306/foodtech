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

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  public readonly model: Model<T>;

  protected constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    return doc.save();
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findByIdOrThrow(id: string | Types.ObjectId): Promise<T> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new Error(`${this.model.modelName} not found`);
    }
    return doc;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    return this.model.find(filter, null, options).exec();
  }

  async findPaginated(
    filter: FilterQuery<T>,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page ?? 1;
    const limit = Math.min(options.limit ?? 20, 100);
    const sort = options.sort ?? { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.model.find(filter).sort(sort).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateById(id: string | Types.ObjectId, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const doc = await this.model.exists(filter).exec();
    return !!doc;
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }
}