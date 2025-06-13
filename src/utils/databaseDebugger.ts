import { supabase } from '@/integrations/supabase/client';

export class DatabaseDebugger {
  
  /**
   * Check if required tables exist and log their structure
   */
  static async checkDatabaseStructure() {
    console.log('🔍 Checking database structure...');
    
    const tables = ['emis', 'monthly_rents', 'transactions', 'payment_ledger', 'customer_credits'];
    
    for (const tableName of tables) {
      try {
        console.log(`\n📋 Checking table: ${tableName}`);
        
        // Try to query the table structure
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Error accessing ${tableName}:`, error);
          
          // Check if it's a "relation does not exist" error
          if (error.message.includes('relation') && error.message.includes('does not exist')) {
            console.log(`💡 Table ${tableName} does not exist. You may need to create it.`);
          }
        } else {
          console.log(`✅ Table ${tableName} exists and is accessible`);
          if (data && data.length > 0) {
            console.log(`📊 Sample data structure:`, Object.keys(data[0]));
          } else {
            console.log(`📊 Table ${tableName} is empty`);
          }
        }
      } catch (err) {
        console.error(`❌ Failed to check ${tableName}:`, err);
      }
    }
  }

  /**
   * Test EMI operations
   */
  static async testEMIOperations(customerId: string) {
    console.log('\n🧪 Testing EMI operations for customer:', customerId);
    
    try {
      // Try to fetch EMIs
      const { data: emis, error: emisError } = await supabase
        .from('emis')
        .select('*')
        .eq('customer_id', customerId);
      
      if (emisError) {
        console.error('❌ Error fetching EMIs:', emisError);
        return false;
      }
      
      console.log(`✅ Found ${emis?.length || 0} EMIs for customer`);
      
      if (emis && emis.length > 0) {
        console.log('📊 EMI structure:', Object.keys(emis[0]));
        console.log('📋 First EMI:', emis[0]);
        
        // Test update operation on first EMI
        const firstEmi = emis[0];
        console.log('\n🔄 Testing EMI update...');
        
        const { data: updateResult, error: updateError } = await supabase
          .from('emis')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', firstEmi.id)
          .select();
        
        if (updateError) {
          console.error('❌ EMI update failed:', updateError);
          return false;
        } else {
          console.log('✅ EMI update successful:', updateResult);
          return true;
        }
      } else {
        console.log('⚠️ No EMIs found for this customer');
        return false;
      }
    } catch (err) {
      console.error('❌ EMI test failed:', err);
      return false;
    }
  }

  /**
   * Create sample EMI data for testing
   */
  static async createSampleEMIData(customerId: string) {
    console.log('\n🏗️ Creating sample EMI data for customer:', customerId);
    
    try {
      const sampleEMIs = [
        {
          customer_id: customerId,
          emi_number: 1,
          total_emi_count: 12,
          amount: 3333,
          due_date: '2024-07-01',
          payment_status: 'partial',
          paid_amount: 1000,
          remaining_amount: 2333,
          assignment_date: '2024-06-01'
        },
        {
          customer_id: customerId,
          emi_number: 2,
          total_emi_count: 12,
          amount: 3333,
          due_date: '2024-08-01',
          payment_status: 'due',
          paid_amount: 0,
          remaining_amount: 3333,
          assignment_date: '2024-06-01'
        },
        {
          customer_id: customerId,
          emi_number: 5,
          total_emi_count: 12,
          amount: 3333,
          due_date: '2024-11-01',
          payment_status: 'partial',
          paid_amount: 1500,
          remaining_amount: 1833,
          assignment_date: '2024-06-01'
        }
      ];

      const { data, error } = await supabase
        .from('emis')
        .insert(sampleEMIs)
        .select();

      if (error) {
        console.error('❌ Failed to create sample EMIs:', error);
        return false;
      } else {
        console.log('✅ Sample EMIs created:', data);
        return true;
      }
    } catch (err) {
      console.error('❌ Sample EMI creation failed:', err);
      return false;
    }
  }

  /**
   * Run complete database diagnostics
   */
  static async runDiagnostics(customerId?: string) {
    console.log('🏥 Starting database diagnostics...');
    
    await this.checkDatabaseStructure();
    
    if (customerId) {
      const emiTestResult = await this.testEMIOperations(customerId);
      
      if (!emiTestResult) {
        console.log('\n💡 Would you like to create sample EMI data? Run:');
        console.log(`DatabaseDebugger.createSampleEMIData('${customerId}')`);
      }
    }
    
    console.log('\n🏁 Diagnostics complete!');
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).DatabaseDebugger = DatabaseDebugger;
}