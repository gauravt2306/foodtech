"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.createMenuItem = createMenuItem;
exports.listMenuItems = listMenuItems;
exports.getMenuItem = getMenuItem;
exports.updateMenuItem = updateMenuItem;
exports.deleteMenuItem = deleteMenuItem;
exports.toggleAvailability = toggleAvailability;
exports.listOrders = listOrders;
exports.getKanbanOrders = getKanbanOrders;
exports.getOrder = getOrder;
exports.updateOrderStatus = updateOrderStatus;
exports.handoffOrder = handoffOrder;
const mongoose_1 = require("mongoose");
const ApiError_1 = require("../utils/ApiError");
const repositories_1 = require("../repositories");
const menuItem_repository_1 = require("../repositories/menuItem.repository");
const order_repository_1 = require("../repositories/order.repository");
const services_1 = require("../services");
function getVendorId(req) {
    if (!req.user.vendorProfileId) {
        throw ApiError_1.ApiError.forbidden('Vendor profile not linked');
    }
    return req.user.vendorProfileId;
}
function getVendorObjectId(req) {
    return new mongoose_1.Types.ObjectId(getVendorId(req));
}
async function getProfile(req, res) {
    const vendor = await repositories_1.vendorProfileRepository.findByUserId(req.user.sub);
    if (!vendor) {
        throw ApiError_1.ApiError.notFound('Vendor profile not found');
    }
    res.json({ success: true, data: vendor });
}
async function updateProfile(req, res) {
    const vendorId = getVendorId(req);
    const vendor = await repositories_1.vendorProfileRepository.updateById(vendorId, req.body);
    if (!vendor) {
        throw ApiError_1.ApiError.notFound('Vendor profile not found');
    }
    res.json({ success: true, data: vendor });
}
async function createMenuItem(req, res) {
    const vendorId = getVendorId(req);
    const item = await menuItem_repository_1.menuItemRepository.create({
        ...req.body,
        vendorId,
    });
    res.status(201).json({ success: true, data: item });
}
async function listMenuItems(req, res) {
    const vendorId = getVendorId(req);
    const { page = 1, limit = 20, category, dietType, isAvailable, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (category)
        filter.category = category;
    if (dietType)
        filter.dietType = dietType;
    if (isAvailable !== undefined)
        filter.isAvailable = isAvailable === 'true';
    const result = await menuItem_repository_1.menuItemRepository.findByVendorId(vendorId, filter, {
        page: Number(page),
        limit: Number(limit),
        sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
    res.json({ success: true, data: result.data, meta: result.meta });
}
async function getMenuItem(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const item = await menuItem_repository_1.menuItemRepository.findById(id);
    if (!item || item.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Menu item not found');
    }
    res.json({ success: true, data: item });
}
async function updateMenuItem(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const item = await menuItem_repository_1.menuItemRepository.findById(id);
    if (!item || item.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Menu item not found');
    }
    const updated = await menuItem_repository_1.menuItemRepository.updateById(id, req.body);
    res.json({ success: true, data: updated });
}
async function deleteMenuItem(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const item = await menuItem_repository_1.menuItemRepository.findById(id);
    if (!item || item.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Menu item not found');
    }
    await menuItem_repository_1.menuItemRepository.deleteById(id);
    res.json({ success: true, message: 'Menu item deleted' });
}
async function toggleAvailability(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const item = await menuItem_repository_1.menuItemRepository.findById(id);
    if (!item || item.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Menu item not found');
    }
    const updated = await menuItem_repository_1.menuItemRepository.toggleAvailability(id);
    res.json({ success: true, data: updated });
}
async function listOrders(req, res) {
    const vendorId = getVendorId(req);
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    const result = await order_repository_1.orderRepository.findByVendorId(vendorId, filter, {
        page: Number(page),
        limit: Number(limit),
        sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
    // Group by status for Kanban view
    const grouped = result.data.reduce((acc, order) => {
        if (!acc[order.status])
            acc[order.status] = [];
        acc[order.status].push(order);
        return acc;
    }, {});
    res.json({
        success: true,
        data: { grouped, all: result.data },
        meta: result.meta,
    });
}
async function getKanbanOrders(req, res) {
    const vendorId = getVendorId(req);
    const kanban = await order_repository_1.orderRepository.getKanbanOrders(vendorId);
    res.json({ success: true, data: kanban });
}
async function getOrder(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    res.json({ success: true, data: order });
}
async function updateOrderStatus(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const { status } = req.body;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    // Validate status transition
    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
    };
    if (!validTransitions[order.status]?.includes(status)) {
        throw ApiError_1.ApiError.badRequest(`Cannot transition from ${order.status} to ${status}`);
    }
    const updated = await order_repository_1.orderRepository.updateStatus(id, status, getVendorObjectId(req));
    res.json({ success: true, data: updated });
}
async function handoffOrder(req, res) {
    const vendorId = getVendorId(req);
    const { id } = req.params;
    const { qrToken } = req.body;
    const order = await order_repository_1.orderRepository.findById(id);
    if (!order || order.vendorId.toString() !== vendorId) {
        throw ApiError_1.ApiError.notFound('Order not found');
    }
    // Verify QR token using QR service
    const qrService = (0, services_1.createQRService)();
    const verification = qrService.verifyToken(qrToken);
    if (!verification.valid) {
        throw ApiError_1.ApiError.badRequest(verification.error || 'Invalid QR token');
    }
    if (verification.orderId !== order._id.toString()) {
        throw ApiError_1.ApiError.badRequest('Invalid QR code for this order');
    }
    if (order.status !== 'ready') {
        throw ApiError_1.ApiError.badRequest('Order must be ready for handoff');
    }
    const updated = await order_repository_1.orderRepository.handoff(id, qrToken, getVendorObjectId(req), new mongoose_1.Types.ObjectId(req.user.sub));
    if (!updated) {
        throw ApiError_1.ApiError.badRequest('Handoff failed');
    }
    // Increment vendor order count
    await repositories_1.vendorProfileRepository.updateById(vendorId, { $inc: { totalOrders: 1 } });
    res.json({
        success: true,
        data: updated,
        message: 'Order handed off successfully',
    });
}
//# sourceMappingURL=vendor.controller.js.map