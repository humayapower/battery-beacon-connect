
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, Users, DollarSign, AlertTriangle, CheckCircle, PlayCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useBilling } from '@/hooks/useBilling';
import { AnimatedCard } from '@/components/ui/animated-components';

interface PaymentSummary {
  month_year: string;
  total_rent_due: number;
  total_rent_paid: number;
  total_rent_overdue: number;
  total_emi_due: number;
  total_emi_paid: number;
  total_emi_overdue: number;
  active_rental_customers: number;
  active_emi_customers: number;
  overdue_customers: number;
}

interface SchedulerResult {
  processedCount?: number;
  errorCount?: number;
  message?: string;
  overdueRentsCount?: number;
  overdueEmisCount?: number;
  affectedCustomersCount?: number;
}

const PaymentScheduler = () => {
  const [loading, setLoading] = useState(false);
  const [overdueLoading, setOverdueLoading] = useState(false);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [lastRunResults, setLastRunResults] = useState<SchedulerResult | null>(null);
  const [isAutoScheduleEnabled, setIsAutoScheduleEnabled] = useState(false);
  const [edgeFunctionsDeployed, setEdgeFunctionsDeployed] = useState(false);
  const { toast } = useToast();
  const { generateMonthlyRents, updateOverdueStatus, getPaymentSummary } = useBilling();

  useEffect(() => {
    loadPaymentSummary();
    checkEdgeFunctionDeployment();
  }, []);

  const checkEdgeFunctionDeployment = async () => {
    try {
      // Try a simple call to check if functions are deployed
      const { error } = await supabase.functions.invoke('monthly-rent-scheduler', {
        method: 'GET' // Use GET instead of OPTIONS
      });
      
      // If no error or specific function not found error, consider it deployed
      if (!error || !error.message?.includes('Failed to send a request')) {
        setEdgeFunctionsDeployed(true);
      }
    } catch (error) {
      // Functions not deployed - keep as false
      setEdgeFunctionsDeployed(false);
    }
  };

  const loadPaymentSummary = async () => {
    try {
      const result = await getPaymentSummary();
      if (result.success && result.data) {
        setSummary(result.data);
      }
    } catch (error: any) {
      console.error('Error loading payment summary:', error);
      toast({
        title: "Error loading payment summary",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGenerateMonthlyRents = async () => {
    setLoading(true);
    try {
      const result = await generateMonthlyRents();
      
      if (result?.success) {
        setLastRunResults({
          processedCount: result.processedCount,
          message: `Successfully generated ${result.processedCount} monthly rent charges`
        });

        // Refresh summary
        await loadPaymentSummary();
      }
    } catch (error: any) {
      console.error('Error generating monthly rents:', error);
      toast({
        title: "Error generating monthly rents",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOverdueStatus = async () => {
    setOverdueLoading(true);
    try {
      const result = await updateOverdueStatus();
      
      if (result?.success) {
        setLastRunResults({
          overdueRentsCount: result.overdue_rents_count,
          overdueEmisCount: result.overdue_emis_count,
          affectedCustomersCount: result.affected_customers_count,
          message: `Updated ${result.overdue_rents_count} rents and ${result.overdue_emis_count} EMIs to overdue status`
        });

        // Refresh summary
        await loadPaymentSummary();
      }
    } catch (error: any) {
      console.error('Error updating overdue status:', error);
      toast({
        title: "Error updating overdue status",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOverdueLoading(false);
    }
  };

  const testEdgeFunction = async (functionName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(functionName);
      
      if (error) throw error;

      toast({
        title: `${functionName} executed`,
        description: data?.message || "Function executed successfully",
      });

      console.log(`${functionName} result:`, data);
      
      // Refresh summary after Edge Function execution
      await loadPaymentSummary();
      
    } catch (error: any) {
      console.error(`Error testing ${functionName}:`, error);
      
      // Check if it's a deployment issue
      if (error.message?.includes('Failed to send a request') || error.message?.includes('not found')) {
        toast({
          title: `Edge Function not deployed`,
          description: `${functionName} needs to be deployed to Supabase. Use the database functions instead for testing.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: `Error testing ${functionName}`,
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const today = new Date();
  const isFirstOfMonth = today.getDate() === 1;
  const isAfterFifth = today.getDate() > 5;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            💰 Payment Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Automated rental payment scheduling and overdue management
          </p>
        </div>
      </div>

      {/* Current Month Summary */}
      {summary && (
        <AnimatedCard className="glass-card border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {summary.month_year} Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.active_rental_customers}</div>
                <div className="text-sm text-gray-600">Rental Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">₹{summary.total_rent_paid.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Rent Collected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">₹{summary.total_rent_due.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Rent Due</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.overdue_customers}</div>
                <div className="text-sm text-gray-600">Overdue Customers</div>
              </div>
            </div>

            {summary.total_rent_overdue > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  ₹{summary.total_rent_overdue.toLocaleString()} in overdue rental payments requiring attention.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </AnimatedCard>
      )}

      {/* Scheduler Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedCard className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              Monthly Rent Generation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Schedule:</span>
              <Badge variant={isFirstOfMonth ? "default" : "secondary"}>
                1st of every month
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Due Date:</span>
              <Badge variant="outline">5th of month</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Next Run:</span>
              <span className="text-sm font-medium">
                {isFirstOfMonth ? "Today!" : `${new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleDateString()}`}
              </span>
            </div>

            <Button
              onClick={handleGenerateMonthlyRents}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {loading ? "Generating..." : (isFirstOfMonth ? "Run Monthly Generation" : "Test Monthly Generation")}
            </Button>

            {isFirstOfMonth && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Today is the 1st! Monthly rent generation should be run now.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </AnimatedCard>

        <AnimatedCard className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Overdue Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Schedule:</span>
              <Badge variant="secondary">Daily</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rent Overdue:</span>
              <Badge variant="outline">After 5th</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <Badge variant={isAfterFifth ? "destructive" : "default"}>
                {isAfterFifth ? "Overdue Period" : "Grace Period"}
              </Badge>
            </div>

            <Button
              onClick={handleUpdateOverdueStatus}
              disabled={overdueLoading}
              className="w-full bg-orange-600 hover:bg-orange-700"
            >
              <Clock className="w-4 h-4 mr-2" />
              {overdueLoading ? "Updating..." : "Update Overdue Status"}
            </Button>

            {isAfterFifth && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Payments past due date (5th) should be marked overdue.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </AnimatedCard>
      </div>

      {/* Last Run Results */}
      {lastRunResults && (
        <AnimatedCard className="glass-card border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Last Execution Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{lastRunResults.message}</p>
              
              {lastRunResults.processedCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Processed Customers:</span>
                  <Badge variant="default">{lastRunResults.processedCount}</Badge>
                </div>
              )}

              {lastRunResults.overdueRentsCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overdue Rents:</span>
                  <Badge variant="destructive">{lastRunResults.overdueRentsCount}</Badge>
                </div>
              )}

              {lastRunResults.overdueEmisCount !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overdue EMIs:</span>
                  <Badge variant="destructive">{lastRunResults.overdueEmisCount}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </AnimatedCard>
      )}

      {/* Edge Functions Testing */}
      <AnimatedCard className="glass-card border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Edge Functions (Production Automation)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!edgeFunctionsDeployed && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Edge Functions Not Deployed:</strong> Deploy the Edge Functions to Supabase first:
                  <br />• <code>supabase functions deploy monthly-rent-scheduler</code>
                  <br />• <code>supabase functions deploy overdue-payment-processor</code>
                </AlertDescription>
              </Alert>
            )}
            
            {edgeFunctionsDeployed && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Edge Functions Deployed:</strong> Functions are ready for testing and production use.
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              Test the Edge Functions that will run automatically in production via cron jobs.
              Use the database function buttons above for immediate testing.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => testEdgeFunction('monthly-rent-scheduler')}
                variant="outline"
                className="w-full"
                disabled={!edgeFunctionsDeployed}
              >
                Test Monthly Scheduler
                <Badge 
                  variant={edgeFunctionsDeployed ? "default" : "secondary"} 
                  className="ml-2 text-xs"
                >
                  {edgeFunctionsDeployed ? "Ready" : "Not Deployed"}
                </Badge>
              </Button>
              
              <Button
                onClick={() => testEdgeFunction('overdue-payment-processor')}
                variant="outline"
                className="w-full"
                disabled={!edgeFunctionsDeployed}
              >
                Test Overdue Processor
                <Badge 
                  variant={edgeFunctionsDeployed ? "default" : "secondary"} 
                  className="ml-2 text-xs"
                >
                  {edgeFunctionsDeployed ? "Ready" : "Not Deployed"}
                </Badge>
              </Button>
            </div>

            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Production Setup Required:</strong> After deploying, configure cron jobs:
                <br />• Monthly Scheduler: 0 9 1 * * (9 AM on 1st of every month)
                <br />• Overdue Processor: 0 10 * * * (10 AM daily)
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </AnimatedCard>
    </div>
  );
};

export default PaymentScheduler;
