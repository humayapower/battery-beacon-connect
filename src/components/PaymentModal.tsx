
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillingService } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  onPaymentSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, customerId, onPaymentSuccess }: PaymentModalProps) => {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'emi' | 'rent' | 'auto'>('auto');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    try {
      const result = await BillingService.processPayment(
        customerId,
        parseFloat(amount),
        paymentType,
        remarks
      );

      if (result.success) {
        toast({
          title: "Payment processed successfully",
          description: `Payment of ₹${amount} has been recorded and distributed.`,
        });
        onPaymentSuccess();
        onClose();
        setAmount('');
        setRemarks('');
      } else {
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
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Payment Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter payment amount"
              required
            />
          </div>

          <div>
            <Label htmlFor="paymentType">Payment Type</Label>
            <Select value={paymentType} onValueChange={(value: 'emi' | 'rent' | 'auto') => setPaymentType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (Smart Distribution)</SelectItem>
                <SelectItem value="emi">EMI Payment Only</SelectItem>
                <SelectItem value="rent">Rent Payment Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Auto distribution pays overdue amounts first, then current dues
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

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Processing...' : 'Record Payment'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
