import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentTestUtils } from '@/utils/paymentTestUtils';
import { BillingService } from '@/services/billingService';

/**
 * Debug component to test payment logic
 * Add this to any page to test payment calculations
 */
export const PaymentDebugger: React.FC = () => {
  const [results, setResults] = useState<string>('');

  const runTests = () => {
    console.clear();
    console.log('🧪 Running Payment Logic Tests');
    
    // Capture console output
    const originalLog = console.log;
    let output = '';
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      output += message + '\n';
      originalLog(...args);
    };
    
    try {
      PaymentTestUtils.runAllTests();
      setResults(output);
    } finally {
      console.log = originalLog;
    }
  };

  const testCalculation = async () => {
    try {
      console.log('Testing payment calculation...');
      const result = await BillingService.calculatePaymentDistribution(
        'test-customer',
        5000,
        'auto'
      );
      console.log('Calculation result:', result);
      setResults(`Calculation Result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
      console.error('Calculation error:', error);
      setResults(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Payment System Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} variant="outline">
            Run Payment Logic Tests
          </Button>
          <Button onClick={testCalculation} variant="outline">
            Test Payment Calculation
          </Button>
          <Button onClick={() => setResults('')} variant="ghost">
            Clear
          </Button>
        </div>
        
        {results && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <pre className="text-sm whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {results}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Instructions:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click "Run Payment Logic Tests" to test EMI and Rent calculations</li>
            <li>Click "Test Payment Calculation" to test the API call</li>
            <li>Open browser console for detailed logs</li>
            <li>This component is for development only</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentDebugger;