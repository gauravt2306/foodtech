"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const base_repository_1 = require("./base.repository");
const User_1 = require("../models/User");
class UserRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(User_1.User);
    }
    async findByEmail(email) {
        return this.model.findOne({ email: email.toLowerCase() }).exec();
    }
    async findByRole(role, options) {
        return this.findPaginated({ role }, options);
    }
    async findActiveVendors(options) {
        return this.findPaginated({ role: 'vendor', isActive: true }, options);
    }
    async findPendingVendors(options) {
        return this.findPaginated({ role: 'vendor', isActive: false }, options);
    }
    async updateStatus(userId, isActive) {
        return this.updateById(userId, { isActive });
    }
    async assignVendorProfile(userId, vendorProfileId) {
        return this.updateById(userId, { vendorProfile: vendorProfileId });
    }
    async search(query, options) {
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
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=user.repository.js.map