
export interface EMI {
  id: string;
  customer_id: string;
  emi_number: number;
  total_emi_count: number;
  amount: number;
  due_date: string;
  payment_status: 'due' | 'paid' | 'partial' | 'overdue';
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export interface MonthlyRent {
  id: string;
  customer_id: string;
  rent_month: string;
  amount: number;
  due_date: string;
  payment_status: 'due' | 'paid' | 'partial' | 'overdue';
  paid_amount: number;
  remaining_amount: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerCredit {
  id: string;
  customer_id: string;
  credit_balance: number;
  updated_at: string;
}

export interface Payment {
  amount: number;
  payment_date: string;
  remarks?: string;
}

export interface BillingDetails {
  emis: EMI[];
  rents: MonthlyRent[];
  credits: CustomerCredit;
  transactions: any[];
  totalPaid: number;
  totalDue: number;
  nextDueDate: string | null;
  emiProgress?: {
    paid: number;
    total: number;
    percentage: number;
  };
}
