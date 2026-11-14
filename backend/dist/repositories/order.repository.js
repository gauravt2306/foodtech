"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const base_repository_1 = require("./base.repository");
const Order_1 = require("../models/Order");
class OrderRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(Order_1.Order);
    }
    async findByOrderNumber(orderNumber) {
        return this.model.findOne({ orderNumber }).exec();
    }
    async findByVendorId(vendorId, filter = {}, options) {
        const query = { vendorId };
        if (filter.status)
            query.status = filter.status;
        if (filter.paymentStatus)
            query.paymentStatus = filter.paymentStatus;
        if (filter.dateFrom || filter.dateTo) {
            query.createdAt = {};
            if (filter.dateFrom)
                query.createdAt.$gte = filter.dateFrom;
            if (filter.dateTo)
                query.createdAt.$lte = filter.dateTo;
        }
        return this.findPaginated(query, { ...options, sort: { createdAt: -1 } });
    }
    async findByEmployeeId(employeeId, options) {
        return this.findPaginated({ employeeId }, { ...options, sort: { createdAt: -1 } });
    }
    async getKanbanOrders(vendorId) {
        const statuses = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
        const orders = await this.find({ vendorId, status: { $in: statuses } });
        const result = {
            pending: [],
            confirmed: [],
            preparing: [],
            ready: [],
            completed: [],
        };
        for (const order of orders) {
            if (order.status in result) {
                result[order.status].push(order);
            }
        }
        return result;
    }
    async updateStatus(orderId, status, vendorId) {
        const query = { _id: orderId };
        if (vendorId)
            query.vendorId = vendorId;
        return this.model.findOneAndUpdate(query, { status }, { new: true, runValidators: true }).exec();
    }
    async handoff(orderId, qrToken, vendorId, vendorUserId) {
        const order = await this.model.findOne({ _id: orderId, vendorId, qrCodeData: qrToken }).exec();
        if (!order)
            return null;
        if (order.status === 'completed' || order.status === 'cancelled')
            return null;
        order.status = 'completed';
        order.handoffAt = new Date();
        order.handoffBy = vendorUserId;
        return order.save();
    }
    async getAnalytics(vendorId, dateFrom, dateTo) {
        const match = {};
        if (vendorId)
            match.vendorId = vendorId;
        if (dateFrom || dateTo) {
            match.createdAt = {};
            if (dateFrom)
                match.createdAt.$gte = dateFrom;
            if (dateTo)
                match.createdAt.$lte = dateTo;
        }
        const [statusStats, dailyStats, revenueStats] = await Promise.all([
            this.model.aggregate([
                { $match: match },
                { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
            ]),
            this.model.aggregate([
                { $match: match },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        revenue: { $sum: '$total' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            this.model.aggregate([
                { $match: { ...match, paymentStatus: 'paid' } },
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        revenue: { $sum: '$total' },
                    },
                },
            ]),
        ]);
        return { statusStats, dailyStats, revenueStats };
    }
    async generateOrderNumber() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.count({ createdAt: { $gte: new Date(date.setHours(0, 0, 0, 0)) } });
        const sequence = String(count + 1).padStart(4, '0');
        return `ORD-${dateStr}-${sequence}`;
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
//# sourceMappingURL=order.repository.js.map