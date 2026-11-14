"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVendors = listVendors;
exports.getVendor = getVendor;
exports.approveVendor = approveVendor;
exports.listUsers = listUsers;
exports.updateUserStatus = updateUserStatus;
exports.getAnalytics = getAnalytics;
exports.getOrderAnalytics = getOrderAnalytics;
exports.getRevenueAnalytics = getRevenueAnalytics;
exports.getVendorPerformance = getVendorPerformance;
const mongoose_1 = require("mongoose");
const ApiError_1 = require("../utils/ApiError");
const repositories_1 = require("../repositories");
const vendorProfile_repository_1 = require("../repositories/vendorProfile.repository");
const services_1 = require("../services");
async function listVendors(req, res) {
    const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (status)
        filter.isApproved = status === 'approved';
    const result = await vendorProfile_repository_1.vendorProfileRepository.search(String(search) || '', {
        page: Number(page),
        limit: Number(limit),
        sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
    // Filter by approval status if specified
    let filteredData = result.data;
    if (status) {
        filteredData = result.data.filter(v => v.isApproved === (status === 'approved'));
    }
    res.json({
        success: true,
        data: filteredData,
        meta: result.meta,
    });
}
async function getVendor(req, res) {
    const { id } = req.params;
    const vendor = await vendorProfile_repository_1.vendorProfileRepository.findById(id);
    if (!vendor) {
        throw ApiError_1.ApiError.notFound('Vendor not found');
    }
    res.json({ success: true, data: vendor });
}
async function approveVendor(req, res) {
    const { id } = req.params;
    const { approved } = req.body;
    const vendor = await vendorProfile_repository_1.vendorProfileRepository.findById(id);
    if (!vendor) {
        throw ApiError_1.ApiError.notFound('Vendor not found');
    }
    const updated = await vendorProfile_repository_1.vendorProfileRepository.approve(id, new mongoose_1.Types.ObjectId(req.user.sub));
    if (!updated) {
        throw ApiError_1.ApiError.notFound('Vendor not found');
    }
    // Update user's isActive status based on approval
    await repositories_1.userRepository.updateStatus(vendor.userId.toString(), approved);
    res.json({
        success: true,
        data: updated,
        message: `Vendor ${approved ? 'approved' : 'rejected'} successfully`,
    });
}
async function listUsers(req, res) {
    const { page = 1, limit = 20, role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const filter = {};
    if (role)
        filter.role = role;
    if (status !== undefined)
        filter.isActive = status === 'true';
    let result;
    if (search) {
        result = await repositories_1.userRepository.search(String(search), {
            page: Number(page),
            limit: Number(limit),
            sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
        });
    }
    else {
        result = await repositories_1.userRepository.findPaginated(filter, {
            page: Number(page),
            limit: Number(limit),
            sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
        });
    }
    res.json({ success: true, data: result.data, meta: result.meta });
}
async function updateUserStatus(req, res) {
    const { id } = req.params;
    const { isActive } = req.body;
    if (id === req.user.sub) {
        throw ApiError_1.ApiError.badRequest('Cannot deactivate your own account');
    }
    const user = await repositories_1.userRepository.updateStatus(id, isActive);
    if (!user) {
        throw ApiError_1.ApiError.notFound('User not found');
    }
    res.json({
        success: true,
        data: user,
        message: `User ${isActive ? 'activated' : 'deactivated'}`,
    });
}
async function getAnalytics(req, res) {
    const stats = await services_1.analyticsService.getDashboardStats();
    res.json({ success: true, data: stats });
}
async function getOrderAnalytics(req, res) {
    const { startDate, endDate } = req.query;
    const dateFrom = startDate ? new Date(String(startDate)) : undefined;
    const dateTo = endDate ? new Date(String(endDate)) : undefined;
    const [ordersByStatus, ordersByDay, ordersByHour] = await Promise.all([
        services_1.analyticsService.getOrderVolumeByStatus(),
        services_1.analyticsService.getOrdersChart(30),
        services_1.analyticsService.getOrderVolumeByHour(),
    ]);
    res.json({
        success: true,
        data: { ordersByStatus, ordersByDay, ordersByHour },
    });
}
async function getRevenueAnalytics(req, res) {
    const { startDate, endDate } = req.query;
    const dateFrom = startDate ? new Date(String(startDate)) : undefined;
    const dateTo = endDate ? new Date(String(endDate)) : undefined;
    const [revenueByDay, topVendors, breakdown] = await Promise.all([
        services_1.analyticsService.getRevenueChart(30),
        services_1.analyticsService.getTopVendors(10),
        services_1.analyticsService.getRevenueBreakdown(),
    ]);
    res.json({
        success: true,
        data: { revenueByDay, topVendors, breakdown },
    });
}
async function getVendorPerformance(req, res) {
    const topVendors = await services_1.analyticsService.getTopVendors(20);
    res.json({ success: true, data: topVendors });
}
//# sourceMappingURL=superadmin.controller.js.map