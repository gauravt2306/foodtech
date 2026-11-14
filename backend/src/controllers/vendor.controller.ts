import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { vendorProfileRepository } from '../repositories';
import { menuItemRepository } from '../repositories/menuItem.repository';
import { orderRepository, OrderStatus } from '../repositories/order.repository';
import { createQRService } from '../services';

function getVendorId(req: AuthenticatedRequest): string {
  if (!req.user.vendorProfileId) {
    throw ApiError.forbidden('Vendor profile not linked');
  }
  return req.user.vendorProfileId;
}

function getVendorObjectId(req: AuthenticatedRequest): Types.ObjectId {
  return new Types.ObjectId(getVendorId(req));
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const vendor = await vendorProfileRepository.findByUserId(req.user.sub);

  if (!vendor) {
    throw ApiError.notFound('Vendor profile not found');
  }

  res.json({ success: true, data: vendor });
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const vendor = await vendorProfileRepository.updateById(vendorId, req.body);

  if (!vendor) {
    throw ApiError.notFound('Vendor profile not found');
  }

  res.json({ success: true, data: vendor });
}

export async function createMenuItem(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);

  const item = await menuItemRepository.create({
    ...req.body,
    vendorId,
  });

  res.status(201).json({ success: true, data: item });
}

export async function listMenuItems(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { page = 1, limit = 20, category, dietType, isAvailable, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: any = {};
  if (category) filter.category = category;
  if (dietType) filter.dietType = dietType;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';

  const result = await menuItemRepository.findByVendorId(vendorId, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
  });

  res.json({ success: true, data: result.data, meta: result.meta });
}

export async function getMenuItem(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;

  const item = await menuItemRepository.findById(id);
  if (!item || item.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Menu item not found');
  }

  res.json({ success: true, data: item });
}

export async function updateMenuItem(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;

  const item = await menuItemRepository.findById(id);
  if (!item || item.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Menu item not found');
  }

  const updated = await menuItemRepository.updateById(id, req.body);
  res.json({ success: true, data: updated });
}

export async function deleteMenuItem(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;

  const item = await menuItemRepository.findById(id);
  if (!item || item.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Menu item not found');
  }

  await menuItemRepository.deleteById(id);
  res.json({ success: true, message: 'Menu item deleted' });
}

export async function toggleAvailability(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;

  const item = await menuItemRepository.findById(id);
  if (!item || item.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Menu item not found');
  }

  const updated = await menuItemRepository.toggleAvailability(id);
  res.json({ success: true, data: updated });
}

export async function listOrders(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: any = {};
  if (status) filter.status = status;

  const result = await orderRepository.findByVendorId(vendorId, filter, {
    page: Number(page),
    limit: Number(limit),
    sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
  });

  // Group by status for Kanban view
  const grouped = result.data.reduce((acc, order) => {
    if (!acc[order.status]) acc[order.status] = [];
    acc[order.status].push(order);
    return acc;
  }, {} as Record<string, typeof result.data>);

  res.json({
    success: true,
    data: { grouped, all: result.data },
    meta: result.meta,
  });
}

export async function getKanbanOrders(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const kanban = await orderRepository.getKanbanOrders(vendorId);
  res.json({ success: true, data: kanban });
}

export async function getOrder(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;

  const order = await orderRepository.findById(id);
  if (!order || order.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Order not found');
  }

  res.json({ success: true, data: order });
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;
  const { status } = req.body;

  const order = await orderRepository.findById(id);
  if (!order || order.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Order not found');
  }

  // Validate status transition
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  if (!validTransitions[order.status]?.includes(status as OrderStatus)) {
    throw ApiError.badRequest(`Cannot transition from ${order.status} to ${status}`);
  }

  const updated = await orderRepository.updateStatus(id, status as OrderStatus, getVendorObjectId(req));
  res.json({ success: true, data: updated });
}

export async function handoffOrder(req: AuthenticatedRequest, res: Response) {
  const vendorId = getVendorId(req);
  const { id } = req.params;
  const { qrToken } = req.body;

  const order = await orderRepository.findById(id);
  if (!order || order.vendorId.toString() !== vendorId) {
    throw ApiError.notFound('Order not found');
  }

  // Verify QR token using QR service
  const qrService = createQRService();
  const verification = qrService.verifyToken(qrToken);

  if (!verification.valid) {
    throw ApiError.badRequest(verification.error || 'Invalid QR token');
  }

  if (verification.orderId !== order._id.toString()) {
    throw ApiError.badRequest('Invalid QR code for this order');
  }

  if (order.status !== 'ready') {
    throw ApiError.badRequest('Order must be ready for handoff');
  }

  const updated = await orderRepository.handoff(id, qrToken, getVendorObjectId(req), new Types.ObjectId(req.user.sub));
  if (!updated) {
    throw ApiError.badRequest('Handoff failed');
  }

  // Increment vendor order count
  await vendorProfileRepository.updateById(vendorId, { $inc: { totalOrders: 1 } });

  res.json({
    success: true,
    data: updated,
    message: 'Order handed off successfully',
  });
}