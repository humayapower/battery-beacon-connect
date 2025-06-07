
export interface Partner {
  id: string;
  name: string;
  phone: string;
  username: string;
  address?: string;
  email?: string;
  business_name?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  battery_count?: number;
  customer_count?: number;
}

export interface Battery {
  id: string;
  serial_number: string;
  model: string;
  model_name?: string;
  capacity: string;
  voltage?: number;
  manufacturing_date?: string;
  warranty_period?: number;
  warranty_expiry?: string;
  purchase_date?: string;
  last_maintenance?: string;
  location?: string;
  status: 'available' | 'assigned' | 'maintenance' | 'faulty' | 'returned';
  partner_id?: string;
  customer_id?: string;
  imei_number?: string;
  sim_number?: string;
  created_at: string;
  updated_at: string;
  partner?: {
    name: string;
  };
}

export interface Customer {
  id: string;
  customer_id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  payment_type: 'emi' | 'monthly_rent' | 'one_time_purchase';
  monthly_amount?: number;
  monthly_fee?: number;
  partner_id?: string;
  battery_id?: string;
  join_date?: string;
  last_payment_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  customer_photo_url?: string;
  id_type?: 'aadhaar' | 'pan';
  aadhaar_front_url?: string;
  aadhaar_back_url?: string;
  pan_card_url?: string;
  // New billing fields
  total_amount?: number;
  down_payment?: number;
  emi_count?: number;
  emi_amount?: number;
  security_deposit?: number;
  monthly_rent?: number;
  purchase_amount?: number;
  emi_start_date?: string;
  next_due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  transaction_id?: string;
  customer_id: string;
  partner_id?: string;
  battery_id?: string;
  transaction_type: 'emi' | 'rent' | 'purchase' | 'maintenance' | 'deposit';
  type?: string;
  amount: number;
  payment_status: 'paid' | 'partial' | 'due' | 'overdue';
  status?: string;
  transaction_date: string;
  due_date?: string;
  remarks?: string;
  description?: string;
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
