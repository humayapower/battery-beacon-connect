import { EMI, MonthlyRent, PaymentStatus, PaymentCalculationResult } from '@/types/billing';

export class PaymentCalculations {
  
  /**
   * Calculate next due date based on joining date and current date
   */
  static calculateNextDueDate(joinDate: string): string {
    const join = new Date(joinDate);
    const today = new Date();
    
    const joinDay = join.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Create a date with join day in current month
    let nextDue = new Date(currentYear, currentMonth, joinDay);
    
    // If the date has already passed this month, move to next month
    if (nextDue <= today) {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }
    
    return nextDue.toISOString().split('T')[0];
  }
  
  /**
   * EMI Logic Implementation
   */
  static calculateEMIStatus(emi: EMI): PaymentStatus {
    const today = new Date();
    const dueDate = new Date(emi.due_date);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (emi.remaining_amount === 0) {
      return 'paid';
    } else if (emi.paid_amount > 0 && emi.remaining_amount > 0) {
      return daysDiff > 5 ? 'overdue' : 'partial';
    } else if (daysDiff > 5) {
      return 'overdue';
    } else {
      return 'due';
    }
  }

  static calculateEMIOverdueDays(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const daysDiff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff - 5); // Overdue after 5 days
  }

  static generateEMISchedule(
    customerId: string,
    totalAmount: number,
    downPayment: number,
    emiCount: number,
    joinDate: string
  ): Omit<EMI, 'id' | 'created_at' | 'updated_at'>[] {
    const remainingAmount = totalAmount - downPayment;
    const emiAmount = Math.round(remainingAmount / emiCount);
    const schedule: Omit<EMI, 'id' | 'created_at' | 'updated_at'>[] = [];

    const joinDateObj = new Date(joinDate);

    for (let i = 1; i <= emiCount; i++) {
      const dueDate = new Date(joinDateObj);
      dueDate.setMonth(dueDate.getMonth() + i);

      // Adjust for last EMI to handle rounding differences
      const amount = i === emiCount ? 
        remainingAmount - (emiAmount * (emiCount - 1)) : 
        emiAmount;

      schedule.push({
        customer_id: customerId,
        emi_number: i,
        total_emi_count: emiCount,
        amount,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status: 'due',
        paid_amount: 0,
        remaining_amount: amount
      });
    }

    return schedule;
  }

  /**
   * Rent Logic Implementation
   */
  static calculateRentStatus(rent: MonthlyRent): PaymentStatus {
    const today = new Date();
    const dueDate = new Date(rent.due_date);
    const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (rent.remaining_amount === 0) {
      return 'paid';
    } else if (rent.paid_amount > 0 && rent.remaining_amount > 0) {
      return daysDiff > 10 ? 'overdue' : 'partial';
    } else if (daysDiff > 10) {
      return 'overdue';
    } else {
      return 'due';
    }
  }

  static calculateRentOverdueDays(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const daysDiff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysDiff - 10); // Overdue after 10 days
  }

  static calculateProRatedRent(
    monthlyRent: number,
    joinDate: string
  ): { amount: number; days: number; dailyRate: number } {
    const join = new Date(joinDate);
    const nextFirstOfMonth = new Date(join.getFullYear(), join.getMonth() + 1, 1);
    const days = Math.ceil((nextFirstOfMonth.getTime() - join.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate daily rate based on monthly rent
    let dailyRate = 0;
    if (monthlyRent === 3000) dailyRate = 100;
    else if (monthlyRent === 3600) dailyRate = 120;
    else if (monthlyRent === 4500) dailyRate = 150;
    else dailyRate = Math.round(monthlyRent / 30); // fallback

    const amount = dailyRate * days;

    return { amount, days, dailyRate };
  }

  static generateRentSchedule(
    customerId: string,
    monthlyRent: number,
    joinDate: string,
    months: number = 12
  ): Omit<MonthlyRent, 'id' | 'created_at' | 'updated_at'>[] {
    const schedule: Omit<MonthlyRent, 'id' | 'created_at' | 'updated_at'>[] = [];
    const join = new Date(joinDate);

    // First pro-rated rent
    const proRated = this.calculateProRatedRent(monthlyRent, joinDate);
    const firstDueDate = new Date(join);
    firstDueDate.setDate(join.getDate() + 5); // Due 5 days after joining

    schedule.push({
      customer_id: customerId,
      rent_month: join.toISOString().split('T')[0],
      amount: proRated.amount,
      due_date: firstDueDate.toISOString().split('T')[0],
      payment_status: 'due',
      paid_amount: 0,
      remaining_amount: proRated.amount
    });

    // Regular monthly rents
    for (let i = 1; i <= months; i++) {
      const rentMonth = new Date(join.getFullYear(), join.getMonth() + i, 1);
      const dueDate = new Date(rentMonth.getFullYear(), rentMonth.getMonth(), 1);

      schedule.push({
        customer_id: customerId,
        rent_month: rentMonth.toISOString().split('T')[0],
        amount: monthlyRent,
        due_date: dueDate.toISOString().split('T')[0],
        payment_status: 'due',
        paid_amount: 0,
        remaining_amount: monthlyRent
      });
    }

    return schedule;
  }

  /**
   * Payment Distribution Logic
   */
  static distributePayment(
    amount: number,
    emis: EMI[],
    rents: MonthlyRent[],
    paymentType: 'emi' | 'rent' | 'auto'
  ): PaymentCalculationResult {
    const result: PaymentCalculationResult = {
      emiPayments: [],
      rentPayments: [],
      excessAmount: 0,
      totalProcessed: 0
    };

    let remainingAmount = amount;

    // Sort items by priority: overdue/partial first, then by due date
    const sortedEmis = [...emis]
      .filter(emi => emi.remaining_amount > 0)
      .sort((a, b) => {
        // Overdue and partial payments first
        const aIsUrgent = a.payment_status === 'overdue' || a.payment_status === 'partial';
        const bIsUrgent = b.payment_status === 'overdue' || a.payment_status === 'partial';
        
        if (aIsUrgent && !bIsUrgent) return -1;
        if (!aIsUrgent && bIsUrgent) return 1;
        
        // Then by due date
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

    const sortedRents = [...rents]
      .filter(rent => rent.remaining_amount > 0)
      .sort((a, b) => {
        // Overdue and partial payments first
        const aIsUrgent = a.payment_status === 'overdue' || a.payment_status === 'partial';
        const bIsUrgent = b.payment_status === 'overdue' || a.payment_status === 'partial';
        
        if (aIsUrgent && !bIsUrgent) return -1;
        if (!aIsUrgent && bIsUrgent) return 1;
        
        // Then by due date
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });

    // Process EMI payments
    if (paymentType === 'emi' || paymentType === 'auto') {
      for (const emi of sortedEmis) {
        if (remainingAmount <= 0) break;

        const amountToPay = Math.min(remainingAmount, emi.remaining_amount);
        const newPaidAmount = emi.paid_amount + amountToPay;
        const newRemainingAmount = emi.remaining_amount - amountToPay;
        
        let newStatus: PaymentStatus = emi.payment_status;
        if (newRemainingAmount === 0) {
          newStatus = 'paid';
        } else if (newPaidAmount > 0) {
          newStatus = this.calculateEMIStatus({
            ...emi,
            paid_amount: newPaidAmount,
            remaining_amount: newRemainingAmount
          });
        }

        result.emiPayments.push({
          emiId: emi.id,
          emiNumber: emi.emi_number,
          amount: amountToPay,
          newPaidAmount,
          newRemainingAmount,
          newStatus
        });

        remainingAmount -= amountToPay;
      }
    }

    // Process Rent payments (if rent type or auto with remaining amount)
    if (paymentType === 'rent' || (paymentType === 'auto' && remainingAmount > 0)) {
      for (const rent of sortedRents) {
        if (remainingAmount <= 0) break;

        const amountToPay = Math.min(remainingAmount, rent.remaining_amount);
        const newPaidAmount = rent.paid_amount + amountToPay;
        const newRemainingAmount = rent.remaining_amount - amountToPay;
        
        let newStatus: PaymentStatus = rent.payment_status;
        if (newRemainingAmount === 0) {
          newStatus = 'paid';
        } else if (newPaidAmount > 0) {
          newStatus = this.calculateRentStatus({
            ...rent,
            paid_amount: newPaidAmount,
            remaining_amount: newRemainingAmount
          });
        }

        result.rentPayments.push({
          rentId: rent.id,
          rentMonth: rent.rent_month,
          amount: amountToPay,
          newPaidAmount,
          newRemainingAmount,
          newStatus
        });

        remainingAmount -= amountToPay;
      }
    }

    result.excessAmount = remainingAmount;
    result.totalProcessed = amount - remainingAmount;

    return result;
  }

  /**
   * Utility functions
   */
  static calculateNextDueDateFromSchedule(emis: EMI[], rents: MonthlyRent[]): string | null {
    const allDueDates: string[] = [];

    // Get due dates from unpaid EMIs
    emis.forEach(emi => {
      if (emi.remaining_amount > 0) {
        allDueDates.push(emi.due_date);
      }
    });

    // Get due dates from unpaid rents
    rents.forEach(rent => {
      if (rent.remaining_amount > 0) {
        allDueDates.push(rent.due_date);
      }
    });

    if (allDueDates.length === 0) return null;

    // Return the earliest due date
    return allDueDates.sort()[0];
  }

  static calculateTotalOutstanding(emis: EMI[], rents: MonthlyRent[]): number {
    const emiTotal = emis.reduce((sum, emi) => sum + emi.remaining_amount, 0);
    const rentTotal = rents.reduce((sum, rent) => sum + rent.remaining_amount, 0);
    return emiTotal + rentTotal;
  }

  static calculateOverdueAmount(emis: EMI[], rents: MonthlyRent[]): number {
    const today = new Date();
    
    const overdueEMIs = emis.filter(emi => {
      const dueDate = new Date(emi.due_date);
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 5 && emi.remaining_amount > 0;
    });

    const overdueRents = rents.filter(rent => {
      const dueDate = new Date(rent.due_date);
      const daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 10 && rent.remaining_amount > 0;
    });

    const emiOverdue = overdueEMIs.reduce((sum, emi) => sum + emi.remaining_amount, 0);
    const rentOverdue = overdueRents.reduce((sum, rent) => sum + rent.remaining_amount, 0);
    
    return emiOverdue + rentOverdue;
  }

  static calculateTotalPaid(emis: EMI[], rents: MonthlyRent[]): number {
    const emiPaid = emis.reduce((sum, emi) => sum + emi.paid_amount, 0);
    const rentPaid = rents.reduce((sum, rent) => sum + rent.paid_amount, 0);
    return emiPaid + rentPaid;
  }
}
