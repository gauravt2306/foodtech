"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorProfileRepository = exports.VendorProfileRepository = void 0;
const base_repository_1 = require("./base.repository");
const VendorProfile_1 = require("../models/VendorProfile");
class VendorProfileRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(VendorProfile_1.VendorProfile);
    }
    async findByUserId(userId) {
        return this.model.findOne({ userId }).exec();
    }
    async findApproved(options) {
        return this.findPaginated({ isApproved: true }, options);
    }
    async findPending(options) {
        return this.findPaginated({ isApproved: false }, options);
    }
    async approve(vendorProfileId, approvedBy) {
        return this.updateById(vendorProfileId, {
            isApproved: true,
            approvedBy,
            approvedAt: new Date(),
        });
    }
    async reject(vendorProfileId, approvedBy) {
        return this.updateById(vendorProfileId, {
            isApproved: false,
            approvedBy,
            approvedAt: new Date(),
        });
    }
    async updateRating(vendorProfileId, rating, totalOrders) {
        return this.updateById(vendorProfileId, { rating, totalOrders });
    }
    async search(query, options) {
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
exports.VendorProfileRepository = VendorProfileRepository;
exports.vendorProfileRepository = new VendorProfileRepository();
//# sourceMappingURL=vendorProfile.repository.js.map