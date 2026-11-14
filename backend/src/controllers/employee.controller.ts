import { Response } from 'express';
import { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../middleware/auth';
import { vendorProfileRepository } from '../repositories/vendorProfile.repository';
import { menuItemRepository } from '../repositories/menuItem.repository';
import { orderRepository } from '../repositories/order.repository';
import { createQRService } from '../services';

export async function listVendors(req: AuthenticatedRequest, res: Response) {
  const { page = 1, limit = 20, search, category, dietType } = req.query;

  const filter: any = { isApproved: true };

  let result;
  if (search) {
    result = await vendorProfileRepository.search(String(search), {
      page: Number(page),
      limit: Number(limit),
      sort: { rating: -1 },
    });
  } else {
    result = await vendorProfileRepository.findPaginated(filter, {
      page: Number(page),
      limit: Number(limit),
      sort: { rating: -1 },
    });
  }

  // Get menu counts for each vendor
  const vendorIds = result.data.map(v => v._id);
  const menuCounts = await menuItemRepository.model.aggregate([
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

export async function getVendor(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;

  const vendor = await vendorProfileRepository.findById(id);
  if (!vendor || !vendor.isApproved) {
    throw ApiError.notFound('Vendor not found');
  }

  res.json({ success: true, data: vendor });
}

export async function getVendorMenu(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const { category, dietType } = req.query;

  const vendor = await vendorProfileRepository.findById(id);
  if (!vendor || !vendor.isApproved) {
    throw ApiError.notFound('Vendor not found');
  }

  const filter: any = {};
  if (category) filter.category = category;
  if (dietType) filter.dietType = dietType;

  const items = await menuItemRepository.findAvailableByVendorId(id);

  // Apply filters manually since findAvailableByVendorId doesn't support them
  const filteredItems = items.filter(item => {
    if (category && item.category !== category) return false;
    if (dietType && item.dietType !== dietType) return false;
    return true;
  });

  // Group by category
  const categorized = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof filteredItems>);

  res.json({
    success: true,
    data: {
      vendor: { _id: vendor._id, businessName: vendor.businessName, operatingHours: vendor.operatingHours },
      menu: categorized,
      categories: ['breakfast', 'lunch', 'snacks', 'beverages', 'dinner'],
    },
  });
}

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const employeeId = new Types.ObjectId(req.user.sub);
  const { vendorId, items, paymentMethod, specialInstructions, pickupTime } = req.body;
  const vendorObjectId = new Types.ObjectId(vendorId);

  // Validate vendor
  const vendor = await vendorProfileRepository.findById(vendorId);
  if (!vendor || !vendor.isApproved) {
    throw ApiError.notFound('Vendor not found or not approved');
  }

  // Fetch menu items and validate
  const menuItemIds = items.map((i: any) => i.menuItemId);
  const menuItems = await menuItemRepository.model.find({ _id: { $in: menuItemIds }, isAvailable: true });

  if (menuItems.length !== menuItemIds.length) {
    throw ApiError.badRequest('Some menu items are unavailable');
  }

  // Build order items with snapshot pricing
  const orderItems = items.map((item: any) => {
    const menuItem = menuItems.find(m => m._id.toString() === item.menuItemId);
    if (!menuItem) throw ApiError.badRequest(`Menu item ${item.menuItemId} not found`);
    return {
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      dietType: menuItem.dietType,
    };
  });

  const subtotal = orderItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  const qrService = createQRService();
  const orderNumber = await orderRepository.generateOrderNumber();

  const order = await orderRepository.create({
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

export async function listOrders(req: AuthenticatedRequest, res: Response) {
  const employeeId = req.user.sub;
  const { page = 1, limit = 20, status, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const filter: any = { employeeId };
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(String(startDate));
    if (endDate) filter.createdAt.$lte = new Date(String(endDate));
  }

  const result = await orderRepository.findByEmployeeId(employeeId, {
    page: Number(page),
    limit: Number(limit),
    sort: { [String(sortBy)]: sortOrder === 'desc' ? -1 : 1 },
  });

  res.json({ success: true, data: result.data, meta: result.meta });
}

export async function getOrder(req: AuthenticatedRequest, res: Response) {
  const employeeId = req.user.sub;
  const { id } = req.params;

  const order = await orderRepository.findById(id);
  if (!order || order.employeeId.toString() !== employeeId) {
    throw ApiError.notFound('Order not found');
  }

  res.json({ success: true, data: order });
}

export async function dummyUpiPayment(req: AuthenticatedRequest, res: Response) {
  const employeeId = req.user.sub;
  const { id } = req.params;

  const order = await orderRepository.findById(id);
  if (!order || order.employeeId.toString() !== employeeId) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentStatus === 'paid') {
    throw ApiError.badRequest('Order already paid');
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

export async function getOrderQR(req: AuthenticatedRequest, res: Response) {
  const employeeId = req.user.sub;
  const { id } = req.params;

  const order = await orderRepository.findById(id);
  if (!order || order.employeeId.toString() !== employeeId) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentStatus !== 'paid') {
    throw ApiError.badRequest('Payment not completed');
  }

  // Generate fresh QR token
  const qrService = createQRService();
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