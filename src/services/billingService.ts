import { supabase } from '@/integrations/supabase/client';

export interface PaymentCalculation {
  emiPayments: Array<{
    emiId: string;
    amount: number;
    newPaidAmount: number;
    newRemainingAmount: number;
    newStatus: 'paid' | 'partial' | 'due' | 'overdue';
  }>;
  rentPayments: Array<{
    rentId: string;
    amount: number;
    newPaidAmount: number;
    newRemainingAmount: number;
    newStatus: 'paid' | 'partial' | 'due' | 'overdue';
  }>;
  excessAmount: number;
}

export class BillingService {
  
  static async calculatePaymentDistribution(
    customerId: string,
    paymentAmount: number,
    paymentType: 'emi' | 'rent' | 'auto'
  ): Promise<PaymentCalculation> {
    const result: PaymentCalculation = {
      emiPayments: [],
      rentPayments: [],
      excessAmount: 0
    };

    let remainingAmount = paymentAmount;

    if (paymentType === 'emi' || paymentType === 'auto') {
      // Get unpaid EMIs in order (overdue/partial first, then by due date)
      const { data: emis } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId)
        .neq('payment_status', 'paid')
        .order('payment_status') // overdue/partial first
        .order('due_date');

      if (emis) {
        for (const emi of emis) {
          if (remainingAmount <= 0) break;

          const amountToPay = Math.min(remainingAmount, emi.remaining_amount);
          const newPaidAmount = emi.paid_amount + amountToPay;
          const newRemainingAmount = emi.remaining_amount - amountToPay;
          
          let newStatus: 'paid' | 'partial' | 'due' | 'overdue' = emi.payment_status as 'paid' | 'partial' | 'due' | 'overdue';
          if (newRemainingAmount === 0) {
            newStatus = 'paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'partial';
          }

          result.emiPayments.push({
            emiId: emi.id,
            amount: amountToPay,
            newPaidAmount,
            newRemainingAmount,
            newStatus
          });

          remainingAmount -= amountToPay;
        }
      }
    }

    if (paymentType === 'rent' || (paymentType === 'auto' && remainingAmount > 0)) {
      // Get unpaid rents in order (overdue/partial first, then by due date)
      const { data: rents } = await supabase
        .from('monthly_rents')
        .select('*')
        .eq('customer_id', customerId)
        .neq('payment_status', 'paid')
        .order('payment_status') // overdue/partial first
        .order('due_date');

      if (rents) {
        for (const rent of rents) {
          if (remainingAmount <= 0) break;

          const amountToPay = Math.min(remainingAmount, rent.remaining_amount);
          const newPaidAmount = rent.paid_amount + amountToPay;
          const newRemainingAmount = rent.remaining_amount - amountToPay;
          
          let newStatus: 'paid' | 'partial' | 'due' | 'overdue' = rent.payment_status as 'paid' | 'partial' | 'due' | 'overdue';
          if (newRemainingAmount === 0) {
            newStatus = 'paid';
          } else if (newPaidAmount > 0) {
            newStatus = 'partial';
          }

          result.rentPayments.push({
            rentId: rent.id,
            amount: amountToPay,
            newPaidAmount,
            newRemainingAmount,
            newStatus
          });

          remainingAmount -= amountToPay;
        }
      }
    }

    result.excessAmount = remainingAmount;
    return result;
  }

  static async processPayment(
    customerId: string,
    paymentAmount: number,
    paymentType: 'emi' | 'rent' | 'auto',
    remarks?: string
  ) {
    try {
      // Calculate payment distribution
      const calculation = await this.calculatePaymentDistribution(
        customerId,
        paymentAmount,
        paymentType
      );

      // Process EMI payments
      for (const emiPayment of calculation.emiPayments) {
        await supabase
          .from('emis')
          .update({
            paid_amount: emiPayment.newPaidAmount,
            remaining_amount: emiPayment.newRemainingAmount,
            payment_status: emiPayment.newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', emiPayment.emiId);

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: emiPayment.amount,
            transaction_type: 'emi',
            payment_status: 'paid',
            transaction_date: new Date().toISOString(),
            emi_id: emiPayment.emiId,
            remarks: remarks || `EMI payment - ${emiPayment.newStatus}`
          });
      }

      // Process rent payments
      for (const rentPayment of calculation.rentPayments) {
        await supabase
          .from('monthly_rents')
          .update({
            paid_amount: rentPayment.newPaidAmount,
            remaining_amount: rentPayment.newRemainingAmount,
            payment_status: rentPayment.newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', rentPayment.rentId);

        // Record transaction
        await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: rentPayment.amount,
            transaction_type: 'rent',
            payment_status: 'paid',
            transaction_date: new Date().toISOString(),
            monthly_rent_id: rentPayment.rentId,
            remarks: remarks || `Rent payment - ${rentPayment.newStatus}`
          });
      }

      // Handle excess amount as credit
      if (calculation.excessAmount > 0) {
        const { data: existingCredit } = await supabase
          .from('customer_credits')
          .select('*')
          .eq('customer_id', customerId)
          .single();

        const newCreditBalance = (existingCredit?.credit_balance || 0) + calculation.excessAmount;
        
        await supabase
          .from('customer_credits')
          .upsert({
            customer_id: customerId,
            credit_balance: newCreditBalance,
            updated_at: new Date().toISOString()
          });

        // Record credit transaction
        await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: calculation.excessAmount,
            transaction_type: 'deposit',
            payment_status: 'paid',
            transaction_date: new Date().toISOString(),
            credit_added: calculation.excessAmount,
            remarks: `Credit added from excess payment. ${remarks || ''}`
          });
      }

      return { success: true, calculation };
    } catch (error: any) {
      console.error('Error processing payment:', error);
      return { success: false, error };
    }
  }

  static async generateProRatedRent(customerId: string) {
    try {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (!customer || customer.payment_type !== 'monthly_rent') {
        return { success: false, error: 'Customer not found or not on rent plan' };
      }

      const joinDate = new Date(customer.join_date);
      const nextFirstOfMonth = new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 1);
      const daysInPeriod = Math.ceil((nextFirstOfMonth.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate daily rate based on monthly rent
      let dailyRate = 0;
      if (customer.monthly_rent === 3000) dailyRate = 100;
      else if (customer.monthly_rent === 3600) dailyRate = 120;
      else if (customer.monthly_rent === 4500) dailyRate = 150;
      else dailyRate = customer.monthly_rent / 30; // fallback

      const proRatedAmount = dailyRate * daysInPeriod;

      // Insert pro-rated rent
      await supabase
        .from('monthly_rents')
        .insert({
          customer_id: customerId,
          rent_month: joinDate.toISOString().split('T')[0],
          amount: proRatedAmount,
          due_date: new Date(joinDate.getTime() + (5 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 5 days after join
          remaining_amount: proRatedAmount
        });

      return { success: true };
    } catch (error: any) {
      console.error('Error generating pro-rated rent:', error);
      return { success: false, error };
    }
  }
}
