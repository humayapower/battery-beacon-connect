import { BillingService } from '@/services/billingService';
import { supabase } from '@/integrations/supabase/client';

export class PaymentTest {
  
  /**
   * Test EMI payment processing with existing database schema
   */
  static async testEMIPayment(customerId: string, paymentAmount: number) {
    console.log('🧪 Testing EMI payment processing...');
    console.log('Customer ID:', customerId);
    console.log('Payment Amount:', paymentAmount);
    
    // Step 1: Check current EMI status
    console.log('\n📋 Step 1: Checking current EMI status...');
    const { data: emisBefore, error: emisError } = await supabase
      .from('emis')
      .select('*')
      .eq('customer_id', customerId)
      .order('emi_number');
    
    if (emisError) {
      console.error('❌ Error fetching EMIs:', emisError);
      return false;
    }
    
    if (!emisBefore || emisBefore.length === 0) {
      console.log('⚠️ No EMIs found for this customer');
      return false;
    }
    
    console.log('✅ Found EMIs:', emisBefore.length);
    emisBefore.forEach(emi => {
      console.log(`EMI ${emi.emi_number}: Status=${emi.payment_status}, Paid=₹${emi.paid_amount}, Remaining=₹${emi.remaining_amount}`);
    });
    
    // Step 2: Calculate payment distribution
    console.log('\n💰 Step 2: Calculating payment distribution...');
    try {
      const calculation = await BillingService.calculatePaymentDistribution(
        customerId,
        paymentAmount,
        'emi'
      );
      
      console.log('📊 Calculation result:', calculation);
      
      if (calculation.emiPayments.length === 0) {
        console.log('⚠️ No EMI payments calculated - all EMIs might be paid');
        return false;
      }
      
      // Step 3: Process the payment
      console.log('\n🚀 Step 3: Processing payment...');
      const result = await BillingService.processPayment(
        customerId,
        paymentAmount,
        'emi',
        'cash',
        'Test payment'
      );
      
      console.log('Payment result:', result);
      
      if (!result.success) {
        console.error('❌ Payment processing failed:', result.error);
        return false;
      }
      
      // Step 4: Verify EMI updates
      console.log('\n✅ Step 4: Verifying EMI updates...');
      const { data: emisAfter } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId)
        .order('emi_number');
      
      console.log('📋 EMIs after payment:');
      emisAfter?.forEach(emi => {
        console.log(`EMI ${emi.emi_number}: Status=${emi.payment_status}, Paid=₹${emi.paid_amount}, Remaining=₹${emi.remaining_amount}`);
      });
      
      // Step 5: Check transactions
      console.log('\n📈 Step 5: Checking transactions...');
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false })
        .limit(5);
      
      console.log('Recent transactions:');
      transactions?.forEach(txn => {
        console.log(`${txn.transaction_date}: ₹${txn.amount} - ${txn.transaction_type} - ${txn.payment_status}`);
      });
      
      console.log('\n🎉 Test completed successfully!');
      return true;
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  }
  
  /**
   * Check database schema compatibility
   */
  static async checkSchema() {
    console.log('🔍 Checking database schema...');
    
    // Check EMI table structure
    const { data: emiSample } = await supabase
      .from('emis')
      .select('*')
      .limit(1);
    
    if (emiSample && emiSample.length > 0) {
      console.log('✅ EMI table structure:', Object.keys(emiSample[0]));
    } else {
      console.log('⚠️ EMI table is empty or doesn\'t exist');
    }
    
    // Check required columns
    const requiredColumns = ['id', 'customer_id', 'emi_number', 'amount', 'due_date', 'payment_status', 'paid_amount', 'remaining_amount'];
    if (emiSample && emiSample.length > 0) {
      const actualColumns = Object.keys(emiSample[0]);
      const missingColumns = requiredColumns.filter(col => !actualColumns.includes(col));
      
      if (missingColumns.length === 0) {
        console.log('✅ All required columns present');
      } else {
        console.log('❌ Missing columns:', missingColumns);
      }
    }
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  (window as any).PaymentTest = PaymentTest;
}