// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'store';
  store?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order Types
export interface Order {
  id: string;
  order_code: string;
  customer_phone: string;
  employee_name?: string;
  store?: string;
  product_name?: string;
  price?: number;
  order_note?: string;
  order_date: string;
  
  // Shipment info
  shipment_status?: string;
  representative_number?: string;
  representative_note?: string;
  shipping_company?: string;
  
  // Client status
  client_status?: string;
  client_note?: string;
  call_attempts?: number;
  more_than_5_attempts?: boolean;
  
  // Return info
  return_status?: string;
  admin_alert?: string;
  admin_note?: string;
  
  // Calculated
  delivered?: 'yes' | 'no';
  filter?: 'yes' | 'no';
  delivery_filter?: string;
  dashboard_filter?: string;
  
  created_at: string;
  updated_at: string;
}

// Delivery Types
export interface Delivery {
  id: string;
  order_code: string;
  customer_phone: string;
  store?: string;
  delivery_date: string;
  created_at: string;
}

// Follow Up Types
export interface FollowUp {
  id: string;
  order_id?: string;
  order_code: string;
  customer_phone?: string;
  store?: string;
  employee_name?: string;
  status: 'pending' | 'completed' | 'cancelled';
  follow_up_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUpOrder extends FollowUp {}

// Stats Types
export interface EmployeeStats {
  name: string;
  total_orders: number;
  delivered_count: number;
  not_delivered_count: number;
  delivery_percentage: number;
}

export interface StoreStats {
  store: string;
  total_orders: number;
  delivered_count: number;
  not_delivered_count: number;
  delivery_percentage: number;
}

// Dashboard Types
export interface AdminDashboardData {
  totalOrders: number;
  employeeCount: number;
  storeCount: number;
  deliveredCount: number;
  cancelledCount: number;
  noAnswerCount: number;
  employees: EmployeeStats[];
  stores: StoreStats[];
  clientStatuses: { status: string; count: number; percentage: number }[];
  shipmentStatuses: { status: string; count: number; percentage: number }[];
}
