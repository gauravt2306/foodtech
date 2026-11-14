import { Types } from 'mongoose';
import { orderRepository } from '../repositories';

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  totalEmployees: number;
  totalOrders: number;
  revenueMTD: number;
  avgOrderValue: number;
}

export interface VendorPerformance {
  vendorId: string;
  businessName: string;
  totalOrders: number;
  revenue: number;
  avgRating: number;
  fulfillmentTimeAvg: number;
}

export interface RevenueBreakdown {
  byVendor: { vendorId: string; businessName: string; revenue: number; orders: number }[];
  byCategory: { category: string; revenue: number; orders: number }[];
  byPaymentMethod: { method: string; revenue: number; orders: number }[];
}

export class AnalyticsService {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalVendors,
      activeVendors,
      totalEmployees,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      orderRepository.model.db?.collection('users').countDocuments({ role: 'vendor' }) ?? 0,
      orderRepository.model.db?.collection('users').countDocuments({ role: 'vendor', isActive: true }) ?? 0,
      orderRepository.model.db?.collection('users').countDocuments({ role: 'employee' }) ?? 0,
      orderRepository.model.countDocuments(),
      orderRepository.model.aggregate([
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: new Date(new Date().setDate(1)) },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' }, avg: { $avg: '$total' } } },
      ]),
    ]);

    const revenueMTD = revenueResult[0]?.total ?? 0;
    const avgOrderValue = revenueResult[0]?.avg ?? 0;

    return {
      totalVendors,
      activeVendors,
      totalEmployees,
      totalOrders,
      revenueMTD,
      avgOrderValue,
    };
  }

  async getOrdersChart(days = 7): Promise<ChartDataPoint[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const result = await orderRepository.model.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dataMap = new Map(result.map(r => [r._id, r.count]));
    const chartData: ChartDataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const label = date.toISOString().slice(0, 10);
      chartData.push({ label, value: dataMap.get(label) ?? 0, date: label });
    }

    return chartData;
  }

  async getRevenueChart(days = 7): Promise<ChartDataPoint[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const result = await orderRepository.model.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dataMap = new Map(result.map(r => [r._id, r.revenue]));
    const chartData: ChartDataPoint[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const label = date.toISOString().slice(0, 10);
      chartData.push({ label, value: dataMap.get(label) ?? 0, date: label });
    }

    return chartData;
  }

  async getTopVendors(limit = 5): Promise<VendorPerformance[]> {
    const result = await orderRepository.model.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: '$vendorId',
          totalOrders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'vendorprofiles',
          localField: '_id',
          foreignField: '_id',
          as: 'vendor',
        },
      },
      { $unwind: '$vendor' },
      {
        $project: {
          vendorId: '$_id',
          businessName: '$vendor.businessName',
          totalOrders: 1,
          revenue: 1,
          avgRating: '$vendor.rating',
        },
      },
    ]);

    return result;
  }

  async getRevenueBreakdown(vendorId?: Types.ObjectId): Promise<RevenueBreakdown> {
    const match: any = { paymentStatus: 'paid' };
    if (vendorId) match.vendorId = vendorId;

    const [byVendor, byCategory, byPaymentMethod] = await Promise.all([
      orderRepository.model.aggregate([
        { $match: match },
        { $group: { _id: '$vendorId', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'vendorprofiles',
            localField: '_id',
            foreignField: '_id',
            as: 'vendor',
          },
        },
        { $unwind: '$vendor' },
        {
          $project: {
            vendorId: '$_id',
            businessName: '$vendor.businessName',
            revenue: 1,
            orders: 1,
          },
        },
      ]),
      orderRepository.model.aggregate([
        { $match: match },
        { $unwind: '$items' },
        { $group: { _id: '$items.dietType', revenue: { $sum: '$items.price' }, orders: { $sum: '$items.quantity' } } },
        { $project: { category: '$_id', revenue: 1, orders: 1 } },
      ]),
      orderRepository.model.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $project: { method: '$_id', revenue: 1, orders: 1 } },
      ]),
    ]);

    return { byVendor, byCategory, byPaymentMethod };
  }

  async getOrderVolumeByHour(): Promise<ChartDataPoint[]> {
    const result = await orderRepository.model.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return result.map(r => ({
      label: `${r._id}:00`,
      value: r.count,
    }));
  }

  async getOrderVolumeByStatus(): Promise<ChartDataPoint[]> {
    const result = await orderRepository.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return result.map(r => ({
      label: r._id,
      value: r.count,
    }));
  }
}

export const analyticsService = new AnalyticsService();