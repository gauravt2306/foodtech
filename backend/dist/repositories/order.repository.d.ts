import { Types } from 'mongoose';
import { BaseRepository, PaginationOptions, PaginatedResult } from './base.repository';
import { IOrder } from '../models/Order';
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
export declare class OrderRepository extends BaseRepository<IOrder> {
    constructor();
    findByOrderNumber(orderNumber: string): Promise<IOrder | null>;
    findByVendorId(vendorId: string | Types.ObjectId, filter?: Partial<OrderFilter>, options?: PaginationOptions): Promise<PaginatedResult<IOrder>>;
    findByEmployeeId(employeeId: string | Types.ObjectId, options?: PaginationOptions): Promise<PaginatedResult<IOrder>>;
    getKanbanOrders(vendorId: string | Types.ObjectId): Promise<KanbanOrders>;
    updateStatus(orderId: string | Types.ObjectId, status: OrderStatus, vendorId?: Types.ObjectId): Promise<IOrder | null>;
    handoff(orderId: string | Types.ObjectId, qrToken: string, vendorId: Types.ObjectId, vendorUserId: Types.ObjectId): Promise<IOrder | null>;
    getAnalytics(vendorId?: Types.ObjectId, dateFrom?: Date, dateTo?: Date): Promise<any>;
    generateOrderNumber(): Promise<string>;
}
export declare const orderRepository: OrderRepository;
//# sourceMappingURL=order.repository.d.ts.map