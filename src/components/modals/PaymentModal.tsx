
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BillingService } from '@/services/billingService';
import { PaymentMode, PaymentCalculationResult } from '@/types/billing';
import { useToast } from '@/hooks/use-toast';
import { Calculator, CreditCard, Banknote, Smartphone, Building, Receipt } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, customerId, onPaymentSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [paymentType] = useState<'emi' | 'rent' | 'auto'>('auto'); // Always auto (smart distribution)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // Today's date by default
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [calculation, setCalculation] = useState<PaymentCalculationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Calculate payment distribution
  const handleCalculate = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    console.log('🧮 Calculating payment distribution for:', {
      customerId,
      amount: parseFloat(amount),
      paymentType
    });

    setLoading(true);
    try {
      const result = await BillingService.calculatePaymentDistribution(
        customerId,
        parseFloat(amount),
        paymentType
      );
      console.log('📊 Calculation result:', result);
      setCalculation(result);
      setShowPreview(true);
      
      if (result.emiPayments.length === 0 && result.rentPayments.length === 0) {
        toast({
          title: "No pending dues",
          description: "This customer has no pending EMI or rent payments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Calculation error:', error);
      toast({
        title: "Error calculating payment",
        description: error instanceof Error ? error.message : "Could not calculate payment distribution",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    console.log('Processing payment:', {
      customerId,
      amount: parseFloat(amount),
      paymentType,
      paymentMode,
      remarks
    });

    setLoading(true);
    try {
      const result = await BillingService.processPayment(
        customerId,
        parseFloat(amount),
        paymentType,
        paymentMode,
        remarks,
        paymentDate
      );

      console.log('Payment result:', result);

      if (result.success) {
        toast({
          title: "Payment processed successfully",
          description: `Payment of ₹${amount} has been recorded and distributed.`,
        });
        
        // Call success callback to refresh data
        console.log('Calling onPaymentSuccess callback');
        onPaymentSuccess();
        
        // Close modal and reset form
        onClose();
        resetForm();
      } else {
        console.error('Payment failed:', result.error);
        toast({
          title: "Error processing payment",
          description: result.error?.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Error processing payment",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setRemarks('');
    setCalculation(null);
    setShowPreview(false);
    setPaymentMode('cash');
    setPaymentDate(new Date().toISOString().split('T')[0]); // Reset to today
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPaymentModeIcon = (mode: PaymentMode) => {
    switch (mode) {
      case 'cash': return <Banknote className="w-4 h-4" />;
      case 'upi': return <Smartphone className="w-4 h-4" />;
      case 'bank_transfer': return <Building className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'cheque': return <Receipt className="w-4 h-4" />;
      default: return <Banknote className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Payment Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="amount">Payment Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setShowPreview(false);
                  setCalculation(null);
                }}
                placeholder="Enter payment amount"
                required
              />
            </div>

            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={(value: PaymentMode) => setPaymentMode(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4" />
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value="upi">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      UPI
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                  <SelectItem value="card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Card
                    </div>
                  </SelectItem>
                  <SelectItem value="cheque">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      Cheque
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Can't select future dates
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Date when payment was received
              </p>
            </div>
          </div>

          {/* Smart Distribution Info */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Smart Distribution Enabled</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Payment will be automatically distributed to overdue amounts first, then current dues (EMI → Rent → Credit)
            </p>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any notes about this payment"
              rows={3}
            />
          </div>

          {/* Calculate Button */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCalculate}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Preview Distribution
            </Button>
          </div>

          {/* Payment Distribution Preview */}
          {showPreview && calculation && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Payment Distribution Preview
                </h3>
                
                <div className="space-y-3">
                  {calculation.emiPayments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">EMI Payments</h4>
                      {calculation.emiPayments.map((emi, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <span className="text-sm">EMI {emi.emiNumber}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(emi.amount)}</div>
                            <Badge variant={emi.newStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {emi.newStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {calculation.rentPayments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Rent Payments</h4>
                      {calculation.rentPayments.map((rent, index: number) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-slate-800 rounded-lg border">
                          <span className="text-sm">Rent - {rent.rentMonth}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatCurrency(rent.amount)}</div>
                            <Badge variant={rent.newStatus === 'paid' ? 'default' : 'secondary'} className="text-xs">
                              {rent.newStatus}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {calculation.excessAmount > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-orange-700 dark:text-orange-300">Credit Balance Added</span>
                        <span className="font-medium text-orange-700 dark:text-orange-300">
                          {formatCurrency(calculation.excessAmount)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Processed</span>
                      <span className="font-bold text-lg">{formatCurrency(calculation.totalProcessed)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Button 
                type="submit"
                disabled={loading || !amount || parseFloat(amount) <= 0} 
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
                onClose();
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
