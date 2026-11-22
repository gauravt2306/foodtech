export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export const ORDER_STATUS: { value: OrderStatus; label: string; color: string; bgColor: string; variant: 'veg' | 'nonveg' | 'vegan' | 'gf' | 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled'; description: string }[] = [
  { value: 'pending', label: 'Pending', color: '#F59E0B', bgColor: '#FEF3C7', variant: 'pending', description: 'Order placed, awaiting confirmation' },
  { value: 'confirmed', label: 'Confirmed', color: '#3B82F6', bgColor: '#DBEAFE', variant: 'confirmed', description: 'Vendor confirmed the order' },
  { value: 'preparing', label: 'Preparing', color: '#8B5CF6', bgColor: '#F3E8FF', variant: 'preparing', description: 'Food is being prepared' },
  { value: 'ready', label: 'Ready for Pickup', color: '#22C55E', bgColor: '#DCFCE7', variant: 'ready', description: 'Order is ready at the counter' },
  { value: 'completed', label: 'Completed', color: '#64748B', bgColor: '#F1F5F9', variant: 'completed', description: 'Order handed over to customer' },
  { value: 'cancelled', label: 'Cancelled', color: '#EF4444', bgColor: '#FEF2F2', variant: 'cancelled', description: 'Order was cancelled' },
];

export const VENDOR_KANBAN_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

export const EMPLOYEE_STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export const STATUS_FLOW: Record<OrderStatus, { next: OrderStatus | null; nextLabel: string }> = {
  pending: { next: 'confirmed', nextLabel: 'Confirm' },
  confirmed: { next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { next: 'ready', nextLabel: 'Mark Ready' },
  ready: { next: 'completed', nextLabel: 'Complete' },
  completed: { next: null, nextLabel: '' },
  cancelled: { next: null, nextLabel: '' },
};

export function getNextStatus(status: OrderStatus): OrderStatus | null {
  return STATUS_FLOW[status]?.next ?? null;
}

export function getNextStatusLabel(status: OrderStatus): string {
  return STATUS_FLOW[status]?.nextLabel ?? '';
}

export function getStatusConfig(status: OrderStatus) {
  const info = ORDER_STATUS.find(s => s.value === status) || ORDER_STATUS[0];
  return {
    label: info.label,
    color: info.color,
    bgColor: info.bgColor,
    variant: info.variant,
  };
}

export function getStatusInfo(status: OrderStatus) {
  return ORDER_STATUS.find(s => s.value === status) || ORDER_STATUS[0];
}

export function getStatusColor(status: OrderStatus): string {
  return getStatusInfo(status).color;
}

export function getStatusLabel(status: OrderStatus): string {
  return getStatusInfo(status).label;
}

export function canTransitionFromTo(from: OrderStatus, to: OrderStatus): boolean {
  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['ready', 'cancelled'],
    ready: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };
  return validTransitions[from]?.includes(to) ?? false;
}