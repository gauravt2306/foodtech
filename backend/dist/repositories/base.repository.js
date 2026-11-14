"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async create(data) {
        const doc = new this.model(data);
        return doc.save();
    }
    async findById(id) {
        return this.model.findById(id).exec();
    }
    async findByIdOrThrow(id) {
        const doc = await this.findById(id);
        if (!doc) {
            throw new Error(`${this.model.modelName} not found`);
        }
        return doc;
    }
    async findOne(filter) {
        return this.model.findOne(filter).exec();
    }
    async find(filter, options) {
        return this.model.find(filter, null, options).exec();
    }
    async findPaginated(filter, options = {}) {
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
    async updateById(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    }
    async deleteById(id) {
        const result = await this.model.findByIdAndDelete(id).exec();
        return !!result;
    }
    async exists(filter) {
        const doc = await this.model.exists(filter).exec();
        return !!doc;
    }
    async count(filter) {
        return this.model.countDocuments(filter).exec();
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map