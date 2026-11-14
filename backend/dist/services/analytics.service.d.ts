import { Types } from 'mongoose';
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
    byVendor: {
        vendorId: string;
        businessName: string;
        revenue: number;
        orders: number;
    }[];
    byCategory: {
        category: string;
        revenue: number;
        orders: number;
    }[];
    byPaymentMethod: {
        method: string;
        revenue: number;
        orders: number;
    }[];
}
export declare class AnalyticsService {
    getDashboardStats(): Promise<DashboardStats>;
    getOrdersChart(days?: number): Promise<ChartDataPoint[]>;
    getRevenueChart(days?: number): Promise<ChartDataPoint[]>;
    getTopVendors(limit?: number): Promise<VendorPerformance[]>;
    getRevenueBreakdown(vendorId?: Types.ObjectId): Promise<RevenueBreakdown>;
    getOrderVolumeByHour(): Promise<ChartDataPoint[]>;
    getOrderVolumeByStatus(): Promise<ChartDataPoint[]>;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=analytics.service.d.ts.map