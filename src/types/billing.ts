
export type PaymentStatus = 'due' | 'paid' | 'partial' | 'overdue';
export type PaymentMode = 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'card';

export interface EMI {
  id: string;
  customer_id: string;
  emi_number: number;
  total_emi_count: number;
  amount: number;
  due_date: string;
  payment_status: PaymentStatus;
  paid_amount: number;
  remaining_amount: number;
  overdue_days?: number; // Optional - may not exist in all schemas
  assignment_date?: string; // Optional - may not exist in all schemas
  created_at: string;
  updated_at: string;
}

export interface MonthlyRent {
  id: string;
  customer_id: string;
  rent_month: string;
  amount: number;
  due_date: string;
  payment_status: PaymentStatus;
  paid_amount: number;
  remaining_amount: number;
  overdue_days?: number; // Optional - may not exist in all schemas
  is_prorated?: boolean; // Optional - may not exist in all schemas
  prorated_days?: number;
  daily_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentLedger {
  id: string;
  payment_date: string;
  amount_paid: number;
  payment_mode: string;
  payment_type: string;
  running_balance: number;
  reference_number: string;
  remarks: string;
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
  payment_mode: PaymentMode;
  remarks?: string;
}

export interface PaymentCalculationResult {
  emiPayments: Array<{
    emiId: string;
    emiNumber: number;
    amount: number;
    newPaidAmount: number;
    newRemainingAmount: number;
    newStatus: PaymentStatus;
  }>;
  rentPayments: Array<{
    rentId: string;
    rentMonth: string;
    amount: number;
    newPaidAmount: number;
    newRemainingAmount: number;
    newStatus: PaymentStatus;
  }>;
  excessAmount: number;
  totalProcessed: number;
}

export interface Transaction {
  id: string;
  customer_id: string;
  amount: number;
  transaction_type: string;
  payment_status: string;
  transaction_date: string;
  emi_id?: string;
  monthly_rent_id?: string;
  credit_added?: number;
  remarks?: string;
}

export interface BillingDetails {
  emis: EMI[];
  rents: MonthlyRent[];
  credits: CustomerCredit;
  transactions: Transaction[];
  ledger: PaymentLedger[];
  totalPaid: number;
  totalDue: number;
  nextDueDate: string | null;
  overdueAmount: number;
  emiProgress?: {
    paid: number;
    total: number;
    percentage: number;
  };
}
