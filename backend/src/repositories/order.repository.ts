import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { Order, IOrder } from '../models/Order';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderFilter {
  vendorId?: Types.ObjectId;
  employeeId?: Types.ObjectId;
  status?: OrderStatus;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface KanbanOrders {
  pending: IOrder[];
  confirmed: IOrder[];
  preparing: IOrder[];
  ready: IOrder[];
  completed: IOrder[];
}

export class OrderRepository extends BaseRepository<IOrder> {
  constructor() {
    super(Order);
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return this.model.findOne({ orderNumber }).exec();
  }

  async findByVendorId(
    vendorId: string | Types.ObjectId,
    filter: Partial<OrderFilter> = {},
    options?: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    const query: any = { vendorId };
    if (filter.status) query.status = filter.status;
    if (filter.paymentStatus) query.paymentStatus = filter.paymentStatus;
    if (filter.dateFrom || filter.dateTo) {
      query.createdAt = {};
      if (filter.dateFrom) query.createdAt.$gte = filter.dateFrom;
      if (filter.dateTo) query.createdAt.$lte = filter.dateTo;
    }
    return this.findPaginated(query, { ...options, sort: { createdAt: -1 } });
  }

  async findByEmployeeId(
    employeeId: string | Types.ObjectId,
    options?: PaginationOptions
  ): Promise<PaginatedResult<IOrder>> {
    return this.findPaginated({ employeeId }, { ...options, sort: { createdAt: -1 } });
  }

  async getKanbanOrders(vendorId: string | Types.ObjectId): Promise<KanbanOrders> {
    const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const orders = await this.find({ vendorId, status: { $in: statuses } });

    const result: KanbanOrders = {
      pending: [],
      confirmed: [],
      preparing: [],
      ready: [],
      completed: [],
    };

    for (const order of orders) {
      if (order.status in result) {
        (result as any)[order.status].push(order);
      }
    }

    return result;
  }

  async updateStatus(
    orderId: string | Types.ObjectId,
    status: OrderStatus,
    vendorId?: Types.ObjectId
  ): Promise<IOrder | null> {
    const query: any = { _id: orderId };
    if (vendorId) query.vendorId = vendorId;
    return this.model.findOneAndUpdate(query, { status }, { new: true, runValidators: true }).exec();
  }

  async handoff(
    orderId: string | Types.ObjectId,
    qrToken: string,
    vendorId: Types.ObjectId,
    vendorUserId: Types.ObjectId
  ): Promise<IOrder | null> {
    const order = await this.model.findOne({ _id: orderId, vendorId, qrCodeData: qrToken }).exec();
    if (!order) return null;
    if (order.status === 'completed' || order.status === 'cancelled') return null;

    order.status = 'completed';
    order.handoffAt = new Date();
    order.handoffBy = vendorUserId;
    return order.save();
  }

  async getAnalytics(vendorId?: Types.ObjectId, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const match: any = {};
    if (vendorId) match.vendorId = vendorId;
    if (dateFrom || dateTo) {
      match.createdAt = {};
      if (dateFrom) match.createdAt.$gte = dateFrom;
      if (dateTo) match.createdAt.$lte = dateTo;
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

  async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.count({ createdAt: { $gte: new Date(date.setHours(0, 0, 0, 0)) } });
    const sequence = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }
}

export const orderRepository = new OrderRepository();