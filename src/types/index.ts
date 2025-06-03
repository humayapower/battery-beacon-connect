
export interface Partner {
  id: string;
  name: string;
  phone: string;
  username: string;
  address?: string;
  created_at: string;
  updated_at: string;
  battery_count?: number;
  customer_count?: number;
}

export interface Battery {
  id: string;
  serial_number: string;
  model: string;
  capacity: string;
  voltage?: number;
  manufacturing_date?: string;
  warranty_period?: number;
  warranty_expiry?: string;
  purchase_date?: string;
  last_maintenance?: string;
  location?: string;
  status: 'available' | 'assigned' | 'maintenance';
  partner_id?: string;
  customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  payment_type: 'emi' | 'monthly_rent' | 'one_time_purchase';
  monthly_amount?: number;
  partner_id?: string;
  battery_id?: string;
  join_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  customer_id: string;
  partner_id?: string;
  battery_id?: string;
  transaction_type: 'emi' | 'rent' | 'purchase' | 'maintenance' | 'deposit';
  amount: number;
  payment_status: 'paid' | 'partial' | 'due' | 'overdue';
  transaction_date: string;
  due_date?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  username: string;
  address?: string;
  role: 'admin' | 'partner';
}
