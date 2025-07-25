import { supabase } from '@/integrations/supabase/client';

export class AutoSchedulingService {
  
  /**
   * Automatically schedule EMI payments when an EMI customer is created
   */
  static async scheduleEMIPayments(
    customerId: string,
    totalAmount: number,
    downPayment: number,
    emiCount: number,
    joinDate: string
  ) {
    try {
      console.log('🏦 Scheduling EMI payments for customer:', customerId);
      
      const joinDateObj = new Date(joinDate);
      const emiAmount = (totalAmount - downPayment) / emiCount;
      const emiSchedule = [];
      
      // Generate EMI schedule
      for (let i = 1; i <= emiCount; i++) {
        const dueDate = new Date(joinDateObj);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        emiSchedule.push({
          customer_id: customerId,
          emi_number: i,
          total_emi_count: emiCount,
          amount: emiAmount,
          due_date: dueDate.toISOString().split('T')[0],
          payment_status: 'due',
          paid_amount: 0,
          remaining_amount: emiAmount,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Insert EMI schedule
      const { data, error } = await supabase
        .from('emis')
        .insert(emiSchedule)
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Successfully scheduled ${emiCount} EMI payments`);
      return { success: true, data, count: emiCount };
      
    } catch (error: any) {
      console.error('❌ Error scheduling EMI payments:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Automatically schedule rental payments when a rental customer is created
   */
  static async scheduleRentalPayments(
    customerId: string,
    monthlyRent: number,
    joinDate: string
  ) {
    try {
      console.log('🏠 Scheduling rental payments for customer:', customerId);
      
      const joinDateObj = new Date(joinDate);
      const today = new Date();
      const rentSchedule = [];
      
      // Calculate pro-rated first month rent
      const firstOfNextMonth = new Date(joinDateObj.getFullYear(), joinDateObj.getMonth() + 1, 1);
      
      // Calculate days from joining date to end of current month (not including joining day)
      const daysFromJoiningToNextMonth = Math.ceil((firstOfNextMonth.getTime() - joinDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      // Pro-rated amount: (monthly rent / 30) * number of days
      const proRatedAmount = Math.round((monthlyRent / 30) * daysFromJoiningToNextMonth);
      
      // First pro-rated rent - scheduled for 1st of next month, due on 5th of next month
      const firstRentMonth = firstOfNextMonth.toISOString().split('T')[0].substring(0, 7) + '-01';
      const firstRentDueDate = new Date(joinDateObj.getFullYear(), joinDateObj.getMonth() + 1, 5);
      
      rentSchedule.push({
        customer_id: customerId,
        rent_month: firstRentMonth,
        amount: proRatedAmount,
        due_date: firstRentDueDate.toISOString().split('T')[0],
        payment_status: this.isOverdue(firstRentDueDate) ? 'overdue' : 'due',
        paid_amount: 0,
        remaining_amount: proRatedAmount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Schedule all subsequent months from next month to current month as full monthly rent
      let currentMonth = new Date(firstOfNextMonth);
      currentMonth.setMonth(currentMonth.getMonth() + 1); // Start from the month after the pro-rated month
      
      while (currentMonth <= today) {
        const rentMonth = currentMonth.toISOString().split('T')[0].substring(0, 7) + '-01';
        const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 5); // 5th of each month
        
        rentSchedule.push({
          customer_id: customerId,
          rent_month: rentMonth,
          amount: monthlyRent,
          due_date: dueDate.toISOString().split('T')[0],
          payment_status: this.isOverdue(dueDate) ? 'overdue' : 'due',
          paid_amount: 0,
          remaining_amount: monthlyRent,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        // Move to next month
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
      
      // Insert rental schedule
      const { data, error } = await supabase
        .from('monthly_rents')
        .insert(rentSchedule)
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Successfully scheduled ${rentSchedule.length} rental payments (1 prorated: ₹${proRatedAmount} + ${rentSchedule.length - 1} regular)`);
      return { success: true, data, count: rentSchedule.length, proRatedAmount };
      
    } catch (error: any) {
      console.error('❌ Error scheduling rental payments:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Check if a date is overdue (more than 10 days past due date for rent)
   */
  private static isOverdue(dueDate: Date): boolean {
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 10;
  }
  
  /**
   * Daily status check - runs once per day
   * Checks if it's 1st (schedule new rents) or 5th+ (mark overdue)
   */
  static async performDailyStatusCheck() {
    try {
      const today = new Date();
      const dayOfMonth = today.getDate();
      
      console.log(`📅 Performing daily status check for ${today.toDateString()}`);
      
      let result = { scheduledRents: 0, overduePayments: 0 };
      
      // If it's the 1st of the month, schedule new rents for all rental customers
      if (dayOfMonth === 1) {
        result.scheduledRents = await this.scheduleMonthlyRentsForAllCustomers();
      }
      
      // If it's the 5th or later, mark unpaid rents as overdue
      if (dayOfMonth >= 5) {
        result.overduePayments = await this.markOverduePayments();
      }
      
      console.log(`✅ Daily check completed:`, result);
      return { success: true, ...result };
      
    } catch (error: any) {
      console.error('❌ Error in daily status check:', error);
      return { success: false, error };
    }
  }
  
  /**
   * Schedule monthly rents for all active rental customers (1st of month)
   */
  private static async scheduleMonthlyRentsForAllCustomers(): Promise<number> {
    try {
      const today = new Date();
      const currentMonth = today.toISOString().split('T')[0].substring(0, 7) + '-01';
      const dueDate = new Date(today.getFullYear(), today.getMonth(), 5); // 5th of current month
      
      // Get all active rental customers
      const { data: customers, error: customerError } = await supabase
        .from('customers')
        .select('id, monthly_rent')
        .eq('payment_type', 'monthly_rent')
        .eq('status', 'active');
      
      if (customerError) throw customerError;
      
      if (!customers || customers.length === 0) {
        console.log('📝 No active rental customers found');
        return 0;
      }
      
      const rentSchedule = [];
      
      for (const customer of customers) {
        // Check if rent already exists for current month
        const { data: existingRent } = await supabase
          .from('monthly_rents')
          .select('id')
          .eq('customer_id', customer.id)
          .eq('rent_month', currentMonth)
          .single();
        
        if (!existingRent) {
          rentSchedule.push({
            customer_id: customer.id,
            rent_month: currentMonth,
            amount: customer.monthly_rent,
            due_date: dueDate.toISOString().split('T')[0],
            payment_status: 'due',
            paid_amount: 0,
            remaining_amount: customer.monthly_rent,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }
      
      if (rentSchedule.length > 0) {
        const { error } = await supabase
          .from('monthly_rents')
          .insert(rentSchedule);
        
        if (error) throw error;
      }
      
      console.log(`📅 Scheduled ${rentSchedule.length} new monthly rents`);
      return rentSchedule.length;
      
    } catch (error: any) {
      console.error('❌ Error scheduling monthly rents:', error);
      throw error;
    }
  }
  
  /**
   * Mark overdue payments (5+ days after due date for EMI, 10+ days for rent)
   */
  private static async markOverduePayments(): Promise<number> {
    try {
      const today = new Date();
      const emiOverdueDate = new Date(today);
      emiOverdueDate.setDate(today.getDate() - 5); // 5 days ago for EMI
      
      const rentOverdueDate = new Date(today);
      rentOverdueDate.setDate(today.getDate() - 10); // 10 days ago for rent
      
      // Update overdue rental payments
      const { data: overdueRents, error: rentError } = await supabase
        .from('monthly_rents')
        .update({ 
          payment_status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .lt('due_date', rentOverdueDate.toISOString().split('T')[0])
        .in('payment_status', ['due', 'partial'])
        .gt('remaining_amount', 0)
        .select('id');
      
      if (rentError) throw rentError;
      
      // Update overdue EMI payments
      const { data: overdueEmis, error: emiError } = await supabase
        .from('emis')
        .update({ 
          payment_status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .lt('due_date', emiOverdueDate.toISOString().split('T')[0])
        .in('payment_status', ['due', 'partial'])
        .gt('remaining_amount', 0)
        .select('id');
      
      if (emiError) throw emiError;
      
      const totalOverdue = (overdueRents?.length || 0) + (overdueEmis?.length || 0);
      console.log(`⚠️ Marked ${totalOverdue} payments as overdue`);
      
      return totalOverdue;
      
    } catch (error: any) {
      console.error('❌ Error marking overdue payments:', error);
      throw error;
    }
  }
}
