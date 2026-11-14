"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVendors = listVendors;
exports.getVendor = getVendor;
exports.getVendorMenu = getVendorMenu;
exports.createOrder = createOrder;
exports.listOrders = listOrders;
exports.getOrder = getOrder;
exports.dummyUpiPayment = dummyUpiPayment;
exports.getOrderQR = getOrderQR;
const mongoose_1 = require("mongoose");
const ApiError_1 = require("../utils/ApiError");
const vendorProfile_repository_1 = require("../repositories/vendorProfile.repository");
const menuItem_repository_1 = require("../repositories/menuItem.repository");
const order_repository_1 = require("../repositories/order.repository");
const services_1 = require("../services");
async function listVendors(req, res) {
    const { page = 1, limit = 20, search, category, dietType } = req.query;
    const filter = { isApproved: true };
    let result;
    if (search) {
        result = await vendorProfile_repository_1.vendorProfileRepository.search(String(search), {
            page: Number(page),
            limit: Number(limit),
            sort: { rating: -1 },
        });
    }
    else {
        result = await vendorProfile_repository_1.vendorProfileRepository.findPaginated(filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { rating: -1 },
        });
    }
    // Get menu counts for each vendor
    const vendorIds = result.data.map(v => v._id);
    const menuCounts = await menuItem_repository_1.menuItemRepository.model.aggregate([
        { $match: { vendorId: { $in: vendorIds }, isAvailable: true } },
        { $group: { _id: '$vendorId', count: { $sum: 1 } } },
    ]);
    const menuCountMap = new Map(menuCounts.map(m => [m._id.toString(), m.count]));
    const vendorsWithCounts = result.data.map(v => ({
        ...v.toObject(),
        menuItemCount: menuCountMap.get(v._id.toString()) || 0,
    }));
    res.json({
        success: true,
        data: vendorsWithCounts,
        meta: result.meta,
    });
}
async function getVendor(req, res) {
    const { id } = req.params;
    const vendor = await vendorProfile_repository_1.vendorProfileRepository.findById(id);
    if (!vendor || !vendor.isApproved) {
        throw ApiError_1.ApiError.notFound('Vendor not found');
    }
    res.json({ success: true, data: vendor });
}
async function getVendorMenu(req, res) {
    const { id } = req.params;
    const { category, dietType } = req.query;
    const vendor = await vendorProfile_repository_1.vendorProfileRepository.findById(id);
    if (!vendor || !vendor.isApproved) {
        throw ApiError_1.ApiError.notFound('Vendor not found');
    }
    const filter = {};
    if (category)
        filter.category = category;
    if (dietType)
        filter.dietType = dietType;
    const items = await menuItem_repository_1.menuItemRepository.findAvailableByVendorId(id);
    // Apply filters manually since findAvailableByVendorId doesn't support them
    const filteredItems = items.filter(item => {
        if (category && item.category !== category)
            return false;
        if (dietType && item.dietType !== dietType)
            return false;
        return true;
    });
    // Group by category
    const categorized = filteredItems.reduce((acc, item) => {
        if (!acc[item.category])
            acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});
    res.json({
        success: true,
        data: {
            vendor: { _id: vendor._id, businessName: vendor.businessName, operatingHours: vendor.operatingHours },
            menu: categorized,
            categories: ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner'],
        },
    });
}
async function createOrder(req, res) {
    const employeeId = new mongoose_1.Types.ObjectId(req.user.sub);
    const { vendorId, items, paymentMethod, specialInstructions, pickupTime } = req.body;
    const vendorObjectId = new mongoose_1.Types.ObjectId(vendorId);
    // Validate vendor
    const vendor = await vendorProfile_repository_1.vendorProfileRepository.findById(vendorId);
    if (!vendor || !vendor.isApproved) {
        throw ApiError_1.ApiError.notFound('Vendor not found or not approved');
    }
    // Fetch menu items and validate
    const menuItemIds = items.map((i) => i.menuItemId);
    const menuItems = await menuItem_repository_1.menuItemRepository.model.find({ _id: { $in: menuItemIds }, isAvailable: true });
    if (menuItems.length !== menuItemIds.length) {
        throw ApiError_1.ApiError.badRequest('Some menu items are unavailable');
    }
    // Build order items with snapshot pricing
    const orderItems = items.map((item) => {
        const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);
        if (!menuItem)
            throw ApiError_1.ApiError.badRequest(`Menu item ${item.menuItemId} not found`);
        return {
            menuItemId: menuItem._id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: item.quantity,
            dietType: menuItem.dietType,
        };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.05); // 5% GST
    const total = subtotal + tax;
    const qrService = (0, services_1.createQRService)();
    const orderNumber = await order_repository_1.orderRepository.generateOrderNumber();
    const order = await order_repository_1.orderRepository.create({
        orderNumber,
        employeeId,
        vendorId: vendorObjectId,
        items: orderItems,
        subtotal,
        tax,
        total,
        paymentMethod,
        paymentStatus: 'pending',
        qrCodeData: '', // placeholder
        specialInstructions,
        pickupTime: pickupTime ? new Date(pickupTime) : undefined,
    });
    // Generate QR token with actual order ID
    const qrCodeData = qrService.generateToken(order._id.toString());
    order.qrCodeData = qrCodeData;
    await order.save();
    res.status(201).json({
        success: true,
        data: {
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                total: order.total,
                qrCodeData: order.qrCodeData,
            },
        },
    });
}
async function listOrders(req, res) {
    const employeeId = req.user.sub;
    const { page = 1, limit = 20, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = { employeeId };
    if (status)
        filter.status = status;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate)
            filter.createdAt.$gte = new Date(String(startDate));
        if (endDate)
            filter.createdAt.$lte = new Date(String(endDate));
    }
    const result = await order_repository_1.orderRepository.findByEmployeeId(employeeId, {
        page: Number(page),
        limit: Number(limit),
        sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
    res.json({ success: true, data: result.data, meta: result.meta });
}
async function getOrder(req, res) {
    const employeeId = req.user.sub;
    const { id } = req.params;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.employeeId.toString() !== employeeId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    res.json({ success: true, data: order });
}
async function dummyUpiPayment(req, res) {
    const employeeId = req.user.sub;
    const { id } = req.params;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.employeeId.toString() !== employeeId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    if (order.paymentStatus === 'paid') {
        throw ApiError_1.ApiError.badRequest('Order already paid');
    }
    // Simulate 2-second processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    const paymentId = `UPI_MOCK_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    order.paymentStatus = 'paid';
    order.paymentId = paymentId;
    order.status = 'confirmed';
    await order.save();
    res.json({
        success: true,
        data: {
            order: {
                id: order._id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus,
                paymentId: order.paymentId,
                qrCodeData: order.qrCodeData,
            },
        },
        message: 'Payment successful',
    });
}
async function getOrderQR(req, res) {
    const employeeId = req.user.sub;
    const { id } = req.params;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.employeeId.toString() !== employeeId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    if (order.paymentStatus !== 'paid') {
        throw ApiError_1.ApiError.badRequest('Payment not completed');
    }
    // Generate fresh QR token
    const qrService = (0, services_1.createQRService)();
    const qrCodeData = qrService.generateToken(order._id.toString());
    res.json({
        success: true,
        data: {
            orderNumber: order.orderNumber,
            qrCodeData,
            vendorId: order.vendorId,
            status: order.status,
        },
    });
}
//# sourceMappingURL=employee.controller.js.map