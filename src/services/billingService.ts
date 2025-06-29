import { supabase } from '@/integrations/supabase/client';
import { PaymentCalculations } from '@/utils/paymentCalculations';
import { 
  EMI, 
  MonthlyRent, 
  PaymentLedger, 
  PaymentMode, 
  PaymentStatus, 
  PaymentCalculationResult 
} from '@/types/billing';

export class BillingService {
  
  static async calculatePaymentDistribution(
    customerId: string,
    paymentAmount: number,
    paymentType: 'emi' | 'rent' | 'auto'
  ): Promise<PaymentCalculationResult> {
    // Get unpaid EMIs and rents
    const { data: emis } = await supabase
      .from('emis')
      .select('*')
      .eq('customer_id', customerId)
      .neq('payment_status', 'paid');

    const { data: rents } = await supabase
      .from('monthly_rents')
      .select('*')
      .eq('customer_id', customerId)
      .neq('payment_status', 'paid');

    // Type cast the payment status to ensure compatibility
    const typedEmis: EMI[] = (emis || []).map(emi => ({
      ...emi,
      payment_status: emi.payment_status as PaymentStatus
    }));

    const typedRents: MonthlyRent[] = (rents || []).map(rent => ({
      ...rent,
      payment_status: rent.payment_status as PaymentStatus
    }));

    return PaymentCalculations.distributePayment(
      paymentAmount,
      typedEmis,
      typedRents,
      paymentType
    );
  }

  static async processPayment(
    customerId: string,
    paymentAmount: number,
    paymentType: 'emi' | 'rent' | 'auto',
    paymentMode: PaymentMode = 'cash',
    remarks?: string,
    customPaymentDate?: string
  ) {
    console.log('🚀 Starting payment processing:', {
      customerId,
      paymentAmount,
      paymentType,
      paymentMode,
      remarks,
      customPaymentDate
    });

    try {
      // Calculate payment distribution
      console.log('💰 Calculating payment distribution...');
      const calculation = await this.calculatePaymentDistribution(
        customerId,
        paymentAmount,
        paymentType
      );

      console.log('📊 Payment distribution calculated:', calculation);

      if (calculation.emiPayments.length === 0 && calculation.rentPayments.length === 0 && calculation.excessAmount === 0) {
        console.warn('⚠️ No payment distribution calculated - might indicate no pending dues');
        return { 
          success: false, 
          error: new Error('No pending dues found for this customer') 
        };
      }

      // Use custom payment date if provided, otherwise use current date
      const paymentDate = customPaymentDate ? new Date(customPaymentDate + 'T00:00:00Z').toISOString() : new Date().toISOString();
      const transactionIds: string[] = [];

      console.log(`📅 Processing payment on: ${paymentDate}`);

      // Process EMI payments - fixed unused variable issue
      for (const emiPayment of calculation.emiPayments) {
        console.log('Processing EMI payment:', emiPayment);

        // Update EMI record
        const { data: updateResult, error: updateError } = await supabase
          .from('emis')
          .update({
            paid_amount: emiPayment.newPaidAmount,
            remaining_amount: emiPayment.newRemainingAmount,
            payment_status: emiPayment.newStatus,
            updated_at: paymentDate
          })
          .eq('id', emiPayment.emiId)
          .select();

        console.log('EMI update result:', updateResult);
        if (updateError) {
          console.error('EMI update error:', updateError);
          throw updateError;
        }

        // Record transaction
        const { data: transaction } = await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: emiPayment.amount,
            transaction_type: 'emi',
            payment_status: 'paid',
            transaction_date: paymentDate,
            emi_id: emiPayment.emiId,
            remarks: remarks || `EMI ${emiPayment.emiNumber} payment - ${emiPayment.newStatus}`
          })
          .select('id')
          .single();

        if (transaction) {
          transactionIds.push(transaction.id);
        }
      }

      // Process rent payments - fixed unused variable issue
      for (const rentPayment of calculation.rentPayments) {
        console.log('Processing rent payment:', rentPayment);

        // Update rent record
        const { data: rentUpdateResult, error: rentUpdateError } = await supabase
          .from('monthly_rents')
          .update({
            paid_amount: rentPayment.newPaidAmount,
            remaining_amount: rentPayment.newRemainingAmount,
            payment_status: rentPayment.newStatus,
            updated_at: paymentDate
          })
          .eq('id', rentPayment.rentId)
          .select();

        console.log('Rent update result:', rentUpdateResult);
        if (rentUpdateError) {
          console.error('Rent update error:', rentUpdateError);
          throw rentUpdateError;
        }

        // Record transaction
        const { data: transaction } = await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: rentPayment.amount,
            transaction_type: 'rent',
            payment_status: 'paid',
            transaction_date: paymentDate,
            monthly_rent_id: rentPayment.rentId,
            remarks: remarks || `Rent payment for ${rentPayment.rentMonth} - ${rentPayment.newStatus}`
          })
          .select('id')
          .single();

        if (transaction) {
          transactionIds.push(transaction.id);
        }
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
            updated_at: paymentDate
          });

        // Record credit transaction
        const { data: creditTransaction } = await supabase
          .from('transactions')
          .insert({
            customer_id: customerId,
            amount: calculation.excessAmount,
            transaction_type: 'deposit',
            payment_status: 'paid',
            transaction_date: paymentDate,
            credit_added: calculation.excessAmount,
            remarks: `Credit added from excess payment. ${remarks || ''}`
          })
          .select('id')
          .single();
      }

      console.log('✅ Payment processing completed successfully');
      return { success: true, calculation, transactionIds };
    } catch (error: unknown) {
      console.error('❌ Error processing payment:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        success: false, 
        error: {
          message: errorMessage,
          details: error
        }
      };
    }
  }

  // Ledger Management - simplified since payment_ledger table doesn't exist
  static async getCustomerLedger(customerId: string): Promise<PaymentLedger[]> {
    // Since payment_ledger table doesn't exist, return empty array
    // This can be extended later if the table is created
    return [];
  }

  // EMI Management
  static async generateEMISchedule(
    customerId: string,
    totalAmount: number,
    downPayment: number,
    emiCount: number,
    assignmentDate: string
  ) {
    try {
      const schedule = PaymentCalculations.generateEMISchedule(
        customerId,
        totalAmount,
        downPayment,
        emiCount,
        assignmentDate
      );

      const { data } = await supabase
        .from('emis')
        .insert(schedule)
        .select();

      return { success: true, data };
    } catch (error: any) {
      console.error('Error generating EMI schedule:', error);
      return { success: false, error };
    }
  }

  // Rent Management
  static async generateRentSchedule(
    customerId: string,
    monthlyRent: number,
    joinDate: string,
    months: number = 12
  ) {
    try {
      const schedule = PaymentCalculations.generateRentSchedule(
        customerId,
        monthlyRent,
        joinDate,
        months
      );

      const { data } = await supabase
        .from('monthly_rents')
        .insert(schedule)
        .select();

      return { success: true, data };
    } catch (error: any) {
      console.error('Error generating rent schedule:', error);
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

      const proRatedData = PaymentCalculations.calculateProRatedRent(
        customer.monthly_rent,
        customer.join_date
      );

      const joinDate = new Date(customer.join_date);
      const dueDate = new Date(joinDate);
      dueDate.setDate(joinDate.getDate() + 5); // Due 5 days after joining

      // Insert pro-rated rent
      const { data } = await supabase
        .from('monthly_rents')
        .insert({
          customer_id: customerId,
          rent_month: joinDate.toISOString().split('T')[0],
          amount: proRatedData.amount,
          due_date: dueDate.toISOString().split('T')[0],
          payment_status: 'due',
          paid_amount: 0,
          remaining_amount: proRatedData.amount,
          is_prorated: true,
          prorated_days: proRatedData.days,
          daily_rate: proRatedData.dailyRate
        })
        .select()
        .single();

      return { success: true, data };
    } catch (error: any) {
      console.error('Error generating pro-rated rent:', error);
      return { success: false, error };
    }
  }

  // Status Updates
  static async updatePaymentStatuses(customerId: string) {
    try {
      // Update EMI statuses
      const { data: emis } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId);

      if (emis) {
        for (const emi of emis) {
          // Type cast for compatibility
          const typedEmi: EMI = {
            ...emi,
            payment_status: emi.payment_status as PaymentStatus
          };
          
          const newStatus = PaymentCalculations.calculateEMIStatus(typedEmi);
          
          if (newStatus !== emi.payment_status) {
            await supabase
              .from('emis')
              .update({
                payment_status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', emi.id);
          }
        }
      }

      // Update rent statuses
      const { data: rents } = await supabase
        .from('monthly_rents')
        .select('*')
        .eq('customer_id', customerId);

      if (rents) {
        for (const rent of rents) {
          // Type cast for compatibility
          const typedRent: MonthlyRent = {
            ...rent,
            payment_status: rent.payment_status as PaymentStatus
          };
          
          const newStatus = PaymentCalculations.calculateRentStatus(typedRent);
          
          if (newStatus !== rent.payment_status) {
            await supabase
              .from('monthly_rents')
              .update({
                payment_status: newStatus,
                updated_at: new Date().toISOString()
              })
              .eq('id', rent.id);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error updating payment statuses:', error);
      return { success: false, error };
    }
  }

  // Summary calculations
  static async getBillingSummary(customerId: string) {
    try {
      const { data: emis } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId);

      const { data: rents } = await supabase
        .from('monthly_rents')
        .select('*')
        .eq('customer_id', customerId);

      const { data: credits } = await supabase
        .from('customer_credits')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false });

      // Type cast EMIs and rents for compatibility
      const typedEmis: EMI[] = (emis || []).map(emi => ({
        ...emi,
        payment_status: emi.payment_status as PaymentStatus
      }));

      const typedRents: MonthlyRent[] = (rents || []).map(rent => ({
        ...rent,
        payment_status: rent.payment_status as PaymentStatus
      }));

      const ledger = await this.getCustomerLedger(customerId);

      const totalPaid = PaymentCalculations.calculateTotalPaid(typedEmis, typedRents);
      const totalDue = PaymentCalculations.calculateTotalOutstanding(typedEmis, typedRents);
      const overdueAmount = PaymentCalculations.calculateOverdueAmount(typedEmis, typedRents);
      const nextDueDate = PaymentCalculations.calculateNextDueDate(typedEmis, typedRents);

      const emiProgress = typedEmis.length > 0 ? {
        paid: typedEmis.filter(e => e.payment_status === 'paid').length,
        total: typedEmis.length,
        percentage: Math.round((typedEmis.filter(e => e.payment_status === 'paid').length / typedEmis.length) * 100)
      } : undefined;

      return {
        success: true,
        data: {
          emis: typedEmis,
          rents: typedRents,
          credits: credits || { credit_balance: 0 },
          transactions: transactions || [],
          ledger,
          totalPaid,
          totalDue,
          overdueAmount,
          nextDueDate,
          emiProgress
        }
      };
    } catch (error: any) {
      console.error('Error getting billing summary:', error);
      return { success: false, error };
    }
  }
}
