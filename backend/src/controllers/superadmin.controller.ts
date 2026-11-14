import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { userRepository } from '../repositories';
import { vendorProfileRepository } from '../repositories/vendorProfile.repository';
import { orderRepository } from '../repositories/order.repository';
import { analyticsService } from '../services';

export async function listVendors(req: AuthenticatedRequest, res: Response) {
  const { page = 1, limit = 20, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: any = {};
  if (status) filter.isApproved = status === 'approved';

  const result = await vendorProfileRepository.search(String(search) || '', {
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

export async function getVendor(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const vendor = await vendorProfileRepository.findById(id);
  if (!vendor) {
    throw ApiError.notFound('Vendor not found');
  }

  res.json({ success: true, data: vendor });
}

export async function approveVendor(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { approved } = req.body;

  const vendor = await vendorProfileRepository.findById(id);
  if (!vendor) {
    throw ApiError.notFound('Vendor not found');
  }

  const updated = await vendorProfileRepository.approve(id, new Types.ObjectId(req.user.sub));
  if (!updated) {
    throw ApiError.notFound('Vendor not found');
  }

  // Update user's isActive status based on approval
  await userRepository.updateStatus(vendor.userId.toString(), approved);

  res.json({
    success: true,
    data: updated,
    message: `Vendor ${approved ? 'approved' : 'rejected'} successfully`,
  });
}

export async function listUsers(req: AuthenticatedRequest, res: Response) {
  const { page = 1, limit = 20, role, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: any = {};
  if (role) filter.role = role;
  if (status !== undefined) filter.isActive = status === 'true';

  let result;
  if (search) {
    result = await userRepository.search(String(search), {
      page: Number(page),
      limit: Number(limit),
      sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
  } else {
    result = await userRepository.findPaginated(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
    });
  }

  res.json({ success: true, data: result.data, meta: result.meta });
}

export async function updateUserStatus(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { isActive } = req.body;

  if (id === req.user.sub) {
    throw ApiError.badRequest('Cannot deactivate your own account');
  }

  const user = await userRepository.updateStatus(id, isActive);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  res.json({
    success: true,
    data: user,
    message: `User ${isActive ? 'activated' : 'deactivated'}`,
  });
}

export async function getAnalytics(req: AuthenticatedRequest, res: Response) {
  const stats = await analyticsService.getDashboardStats();
  res.json({ success: true, data: stats });
}

export async function getOrderAnalytics(req: AuthenticatedRequest, res: Response) {
  const { startDate, endDate } = req.query;

  const dateFrom = startDate ? new Date(String(startDate)) : undefined;
  const dateTo = endDate ? new Date(String(endDate)) : undefined;

  const [ordersByStatus, ordersByDay, ordersByHour] = await Promise.all([
    analyticsService.getOrderVolumeByStatus(),
    analyticsService.getOrdersChart(30),
    analyticsService.getOrderVolumeByHour(),
  ]);

  res.json({
    success: true,
    data: { ordersByStatus, ordersByDay, ordersByHour },
  });
}

export async function getRevenueAnalytics(req: AuthenticatedRequest, res: Response) {
  const { startDate, endDate } = req.query;

  const dateFrom = startDate ? new Date(String(startDate)) : undefined;
  const dateTo = endDate ? new Date(String(endDate)) : undefined;

  const [revenueByDay, topVendors, breakdown] = await Promise.all([
    analyticsService.getRevenueChart(30),
    analyticsService.getTopVendors(10),
    analyticsService.getRevenueBreakdown(),
  ]);

  res.json({
    success: true,
    data: { revenueByDay, topVendors, breakdown },
  });
}

export async function getVendorPerformance(req: AuthenticatedRequest, res: Response) {
  const topVendors = await analyticsService.getTopVendors(20);
  res.json({ success: true, data: topVendors });
}