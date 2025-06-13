import { PaymentCalculations } from './paymentCalculations';
import { EMI, MonthlyRent } from '@/types/billing';

/**
 * Test utilities for payment logic demonstration
 */
export class PaymentTestUtils {
  
  /**
   * Create sample EMI data for testing
   */
  static createSampleEMIs(customerId: string, assignmentDate: string): EMI[] {
    const emis = PaymentCalculations.generateEMISchedule(
      customerId,
      50000, // Total amount
      10000, // Down payment  
      12,    // 12 EMIs
      assignmentDate
    );

    // Simulate some payments made
    return emis.map((emi, index) => ({
      ...emi,
      id: `emi_${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // First 2 EMIs fully paid, 3rd partially paid
      paid_amount: index === 0 ? emi.amount : index === 1 ? emi.amount : index === 2 ? emi.amount / 2 : 0,
      remaining_amount: index === 0 ? 0 : index === 1 ? 0 : index === 2 ? emi.amount / 2 : emi.amount,
      payment_status: PaymentCalculations.calculateEMIStatus({
        ...emi,
        id: `emi_${index + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_amount: index === 0 ? emi.amount : index === 1 ? emi.amount : index === 2 ? emi.amount / 2 : 0,
        remaining_amount: index === 0 ? 0 : index === 1 ? 0 : index === 2 ? emi.amount / 2 : emi.amount,
      } as EMI),
      overdue_days: PaymentCalculations.calculateEMIOverdueDays(emi.due_date)
    }));
  }

  /**
   * Create sample Rent data for testing
   */
  static createSampleRents(customerId: string, joinDate: string): MonthlyRent[] {
    const rents = PaymentCalculations.generateRentSchedule(
      customerId,
      3000, // Monthly rent
      joinDate,
      6     // 6 months
    );

    // Simulate some payments made
    return rents.map((rent, index) => ({
      ...rent,
      id: `rent_${index + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // First rent fully paid, second partially paid
      paid_amount: index === 0 ? rent.amount : index === 1 ? rent.amount / 3 : 0,
      remaining_amount: index === 0 ? 0 : index === 1 ? (rent.amount * 2) / 3 : rent.amount,
      payment_status: PaymentCalculations.calculateRentStatus({
        ...rent,
        id: `rent_${index + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        paid_amount: index === 0 ? rent.amount : index === 1 ? rent.amount / 3 : 0,
        remaining_amount: index === 0 ? 0 : index === 1 ? (rent.amount * 2) / 3 : rent.amount,
      } as MonthlyRent),
      overdue_days: PaymentCalculations.calculateRentOverdueDays(rent.due_date)
    }));
  }

  /**
   * Test EMI payment distribution
   */
  static testEMIPayment(amount: number): void {
    console.log('=== EMI Payment Test ===');
    const customerId = 'test-customer-1';
    const assignmentDate = '2024-01-01';
    
    const emis = this.createSampleEMIs(customerId, assignmentDate);
    const rents: MonthlyRent[] = [];
    
    console.log('Current EMI Status:');
    emis.forEach(emi => {
      console.log(`EMI ${emi.emi_number}: ₹${emi.remaining_amount} remaining, Status: ${emi.payment_status}`);
    });
    
    const result = PaymentCalculations.distributePayment(amount, emis, rents, 'emi');
    
    console.log(`\nPayment Amount: ₹${amount}`);
    console.log('Payment Distribution:');
    result.emiPayments.forEach(payment => {
      console.log(`EMI ${payment.emiNumber}: ₹${payment.amount} → ${payment.newStatus}`);
    });
    
    if (result.excessAmount > 0) {
      console.log(`Excess Amount (Credit): ₹${result.excessAmount}`);
    }
  }

  /**
   * Test Rent payment distribution
   */
  static testRentPayment(amount: number): void {
    console.log('=== Rent Payment Test ===');
    const customerId = 'test-customer-2';
    const joinDate = '2024-06-01';
    
    const emis: EMI[] = [];
    const rents = this.createSampleRents(customerId, joinDate);
    
    console.log('Current Rent Status:');
    rents.forEach((rent, index) => {
      const month = rent.is_prorated ? 'Pro-rated' : `Month ${index}`;
      console.log(`${month}: ₹${rent.remaining_amount} remaining, Status: ${rent.payment_status}`);
    });
    
    const result = PaymentCalculations.distributePayment(amount, emis, rents, 'rent');
    
    console.log(`\nPayment Amount: ₹${amount}`);
    console.log('Payment Distribution:');
    result.rentPayments.forEach(payment => {
      console.log(`Rent ${payment.rentMonth}: ₹${payment.amount} → ${payment.newStatus}`);
    });
    
    if (result.excessAmount > 0) {
      console.log(`Excess Amount (Credit): ₹${result.excessAmount}`);
    }
  }

  /**
   * Test Auto payment distribution
   */
  static testAutoPayment(amount: number): void {
    console.log('=== Auto Payment Test ===');
    const customerId = 'test-customer-3';
    const assignmentDate = '2024-01-01';
    const joinDate = '2024-06-01';
    
    const emis = this.createSampleEMIs(customerId, assignmentDate);
    const rents = this.createSampleRents(customerId, joinDate);
    
    console.log('Current Status:');
    console.log('EMIs:');
    emis.forEach(emi => {
      console.log(`  EMI ${emi.emi_number}: ₹${emi.remaining_amount} remaining, Status: ${emi.payment_status}`);
    });
    console.log('Rents:');
    rents.forEach((rent, index) => {
      const month = rent.is_prorated ? 'Pro-rated' : `Month ${index}`;
      console.log(`  ${month}: ₹${rent.remaining_amount} remaining, Status: ${rent.payment_status}`);
    });
    
    const result = PaymentCalculations.distributePayment(amount, emis, rents, 'auto');
    
    console.log(`\nPayment Amount: ₹${amount}`);
    console.log('Payment Distribution:');
    
    if (result.emiPayments.length > 0) {
      console.log('EMI Payments:');
      result.emiPayments.forEach(payment => {
        console.log(`  EMI ${payment.emiNumber}: ₹${payment.amount} → ${payment.newStatus}`);
      });
    }
    
    if (result.rentPayments.length > 0) {
      console.log('Rent Payments:');
      result.rentPayments.forEach(payment => {
        console.log(`  Rent ${payment.rentMonth}: ₹${payment.amount} → ${payment.newStatus}`);
      });
    }
    
    if (result.excessAmount > 0) {
      console.log(`Excess Amount (Credit): ₹${result.excessAmount}`);
    }
    
    console.log(`Total Processed: ₹${result.totalProcessed}`);
  }

  /**
   * Run all payment tests
   */
  static runAllTests(): void {
    console.log('🧪 Running Payment Logic Tests\n');
    
    this.testEMIPayment(5000);
    console.log('\n' + '='.repeat(50) + '\n');
    
    this.testRentPayment(4000);
    console.log('\n' + '='.repeat(50) + '\n');
    
    this.testAutoPayment(10000);
    console.log('\n✅ All tests completed!');
  }
}

// Example usage (can be called from browser console):
// PaymentTestUtils.runAllTests();