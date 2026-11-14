"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.menuItemRepository = exports.MenuItemRepository = void 0;
const base_repository_1 = require("./base.repository");
const MenuItem_1 = require("../models/MenuItem");
class MenuItemRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(MenuItem_1.MenuItem);
    }
    async findByVendorId(vendorId, filter = {}, options) {
        const query = { vendorId };
        if (filter.category)
            query.category = filter.category;
        if (filter.dietType)
            query.dietType = filter.dietType;
        if (filter.isAvailable !== undefined)
            query.isAvailable = filter.isAvailable;
        if (filter.search) {
            query.$or = [
                { name: { $regex: filter.search, $options: 'i' } },
                { description: { $regex: filter.search, $options: 'i' } },
                { tags: { $in: [new RegExp(filter.search, 'i')] } },
            ];
        }
        return this.findPaginated(query, options);
    }
    async findAvailableByVendorId(vendorId) {
        return this.find({ vendorId, isAvailable: true });
    }
    async findByCategory(vendorId, category) {
        return this.find({ vendorId, category, isAvailable: true });
    }
    async toggleAvailability(menuItemId) {
        const item = await this.findById(menuItemId);
        if (!item)
            return null;
        return this.updateById(menuItemId, { isAvailable: !item.isAvailable });
    }
    async incrementOrderCount(menuItemId) {
        return this.updateById(menuItemId, { $inc: { totalOrders: 1 } });
    }
    async searchByVendor(vendorId, query, options) {
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
exports.MenuItemRepository = MenuItemRepository;
exports.menuItemRepository = new MenuItemRepository();
//# sourceMappingURL=menuItem.repository.js.map