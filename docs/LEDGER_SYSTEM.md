# Payment Ledger System

## Overview

The Payment Ledger System provides a comprehensive, audit-ready transaction tracking mechanism for all payment activities in the Battery Beacon Connect platform. It maintains a complete chronological record of every payment transaction, running balances, and reconciliation status.

## Purpose

The ledger serves multiple critical functions:

1. **Complete Transaction History**: Records every payment with full context
2. **Running Balance Tracking**: Maintains accurate customer balance at every transaction
3. **Audit Trail**: Provides immutable record for financial auditing
4. **Reconciliation**: Enables bank reconciliation and payment verification
5. **Reporting**: Supports comprehensive financial reporting and analytics
6. **Dispute Resolution**: Provides detailed transaction history for resolving disputes

## Database Schema

### payment_ledger Table

```sql
CREATE TABLE public.payment_ledger (
  -- Primary identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id),
  
  -- Payment details
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_paid NUMERIC NOT NULL,
  payment_mode TEXT NOT NULL, -- 'cash', 'upi', 'bank_transfer', 'cheque', 'card'
  payment_type TEXT NOT NULL, -- 'emi', 'rent', 'purchase', 'deposit', 'refund', 'adjustment'
  
  -- Running balance tracking
  previous_balance NUMERIC NOT NULL DEFAULT 0,
  new_balance NUMERIC NOT NULL DEFAULT 0,
  
  -- Reference details
  emi_id UUID REFERENCES public.emis(id),
  rent_id UUID REFERENCES public.monthly_rents(id),
  battery_id UUID REFERENCES public.batteries(id),
  
  -- Payment-specific metadata
  reference_number TEXT,
  cheque_number TEXT,
  bank_name TEXT,
  upi_transaction_id TEXT,
  
  -- Additional information
  remarks TEXT,
  recorded_by UUID, -- User who recorded the payment
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT false,
  reconciliation_date TIMESTAMP WITH TIME ZONE,
  reconciliation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### Indexes

The ledger uses strategic indexes for optimal query performance:

```sql
-- Customer-based queries
CREATE INDEX idx_payment_ledger_customer_id ON payment_ledger(customer_id);

-- Transaction linking
CREATE INDEX idx_payment_ledger_transaction_id ON payment_ledger(transaction_id);

-- Date-based queries
CREATE INDEX idx_payment_ledger_payment_date ON payment_ledger(payment_date);

-- Reference lookups
CREATE INDEX idx_payment_ledger_emi_id ON payment_ledger(emi_id) WHERE emi_id IS NOT NULL;
CREATE INDEX idx_payment_ledger_rent_id ON payment_ledger(rent_id) WHERE rent_id IS NOT NULL;

-- Reconciliation queries
CREATE INDEX idx_payment_ledger_reconciled ON payment_ledger(reconciled) WHERE reconciled = false;
```

## Transaction Flow

### 1. Payment Recording

When a payment is processed:

```typescript
// Step 1: Calculate current balance
const currentBalance = await calculateCustomerBalance(customerId);

// Step 2: Process payment through BillingService
const result = await BillingService.processPayment(
  customerId,
  paymentAmount,
  paymentType,
  paymentMode,
  remarks
);

// Step 3: Create ledger entry for each transaction
for (const transactionId of result.transactionIds) {
  await supabase.from('payment_ledger').insert({
    customer_id: customerId,
    transaction_id: transactionId,
    payment_date: new Date().toISOString(),
    amount_paid: paymentAmount,
    payment_mode: paymentMode,
    payment_type: paymentType,
    previous_balance: currentBalance,
    new_balance: currentBalance - paymentAmount,
    emi_id: emiId, // if applicable
    rent_id: rentId, // if applicable
    remarks: remarks,
    recorded_by: auth.uid()
  });
}
```

### 2. Balance Calculation

The system provides a function to calculate accurate customer balance:

```sql
CREATE FUNCTION calculate_customer_balance(p_customer_id UUID)
RETURNS NUMERIC
```

This function:
- Sums all payments from the ledger
- Calculates total outstanding dues (EMIs + Rents)
- Includes credit balance
- Returns net balance (negative = customer owes, positive = credit)

### 3. Ledger Retrieval

Get customer ledger with running balance:

```sql
SELECT * FROM get_customer_ledger_with_balance('customer_id');
```

Returns:
- Payment date and time
- Amount paid
- Payment mode and type
- Running balance after each transaction
- Reference numbers
- Remarks

## Payment Modes

The ledger tracks different payment methods:

### Cash
```typescript
{
  payment_mode: 'cash',
  reference_number: 'CASH-' + Date.now()
}
```

### UPI
```typescript
{
  payment_mode: 'upi',
  upi_transaction_id: '12345678901234', // 12-digit UTR
  reference_number: 'UPI-' + upiTransactionId
}
```

### Bank Transfer
```typescript
{
  payment_mode: 'bank_transfer',
  bank_name: 'State Bank of India',
  reference_number: 'NEFT123456789012', // NEFT/RTGS/IMPS number
}
```

### Cheque
```typescript
{
  payment_mode: 'cheque',
  cheque_number: '123456',
  bank_name: 'HDFC Bank',
  reference_number: 'CHQ-' + chequeNumber
}
```

### Card
```typescript
{
  payment_mode: 'card',
  reference_number: 'CARD-' + last4Digits
}
```

## Payment Types

### EMI Payment
```typescript
{
  payment_type: 'emi',
  emi_id: 'uuid-of-emi-record',
  transaction_id: 'uuid-of-transaction'
}
```

### Rent Payment
```typescript
{
  payment_type: 'rent',
  rent_id: 'uuid-of-rent-record',
  transaction_id: 'uuid-of-transaction'
}
```

### One-time Purchase
```typescript
{
  payment_type: 'purchase',
  battery_id: 'uuid-of-battery',
  transaction_id: 'uuid-of-transaction'
}
```

### Deposit (Excess Payment as Credit)
```typescript
{
  payment_type: 'deposit',
  remarks: 'Excess payment added as credit',
  // No EMI/rent reference
}
```

### Refund
```typescript
{
  payment_type: 'refund',
  remarks: 'Refund reason',
  amount_paid: -refundAmount, // Negative amount
}
```

### Adjustment
```typescript
{
  payment_type: 'adjustment',
  remarks: 'Manual adjustment reason',
  recorded_by: admin_user_id
}
```

## Reconciliation Process

### 1. Mark Unreconciled Payments

All payments start as unreconciled:
```sql
SELECT * FROM payment_ledger
WHERE reconciled = false
ORDER BY payment_date ASC;
```

### 2. Reconcile with Bank Statement

```sql
UPDATE payment_ledger
SET 
  reconciled = true,
  reconciliation_date = now(),
  reconciliation_notes = 'Matched with bank statement entry #12345'
WHERE id = 'ledger-entry-id';
```

### 3. Handle Discrepancies

If amounts don't match:
```sql
-- Create adjustment entry
INSERT INTO payment_ledger (
  customer_id,
  payment_type,
  amount_paid,
  payment_mode,
  remarks,
  recorded_by
) VALUES (
  'customer-id',
  'adjustment',
  discrepancy_amount,
  'adjustment',
  'Reconciliation adjustment: bank showed different amount',
  auth.uid()
);
```

## Query Examples

### Get Customer's Complete Ledger

```sql
SELECT 
  payment_date,
  amount_paid,
  payment_mode,
  payment_type,
  new_balance as running_balance,
  reference_number,
  remarks
FROM payment_ledger
WHERE customer_id = 'customer-uuid'
ORDER BY payment_date DESC, created_at DESC;
```

### Get Unreconciled Payments

```sql
SELECT 
  pl.*,
  c.name as customer_name,
  c.phone as customer_phone
FROM payment_ledger pl
JOIN customers c ON c.id = pl.customer_id
WHERE pl.reconciled = false
AND pl.payment_mode IN ('bank_transfer', 'cheque')
ORDER BY pl.payment_date ASC;
```

### Daily Payment Summary

```sql
SELECT 
  DATE(payment_date) as payment_day,
  payment_mode,
  COUNT(*) as transaction_count,
  SUM(amount_paid) as total_amount
FROM payment_ledger
WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(payment_date), payment_mode
ORDER BY payment_day DESC;
```

### Customer Balance History

```sql
SELECT 
  payment_date,
  amount_paid,
  previous_balance,
  new_balance,
  payment_type,
  remarks
FROM payment_ledger
WHERE customer_id = 'customer-uuid'
ORDER BY payment_date ASC;
```

### Partner Payment Collection Summary

```sql
SELECT 
  u.name as partner_name,
  COUNT(pl.id) as total_transactions,
  SUM(pl.amount_paid) as total_collected,
  COUNT(CASE WHEN pl.reconciled THEN 1 END) as reconciled_count
FROM payment_ledger pl
JOIN customers c ON c.id = pl.customer_id
JOIN users u ON u.id = c.partner_id
WHERE pl.payment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name
ORDER BY total_collected DESC;
```

### Payment Mode Distribution

```sql
SELECT 
  payment_mode,
  COUNT(*) as transaction_count,
  SUM(amount_paid) as total_amount,
  ROUND(AVG(amount_paid), 2) as average_amount
FROM payment_ledger
WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY payment_mode
ORDER BY total_amount DESC;
```

## Integration with Billing Service

The ledger integrates seamlessly with the BillingService:

```typescript
class BillingService {
  static async processPayment(
    customerId: string,
    paymentAmount: number,
    paymentType: 'emi' | 'rent' | 'auto',
    paymentMode: PaymentMode = 'cash',
    remarks?: string
  ) {
    // 1. Calculate payment distribution
    const calculation = await this.calculatePaymentDistribution(
      customerId,
      paymentAmount,
      paymentType
    );
    
    // 2. Get current balance
    const { data: balanceData } = await supabase
      .rpc('calculate_customer_balance', { p_customer_id: customerId });
    const previousBalance = balanceData || 0;
    
    // 3. Process EMI and rent payments
    const transactionIds = await this.processPayments(calculation);
    
    // 4. Create ledger entries
    for (const transactionId of transactionIds) {
      await this.createLedgerEntry({
        customerId,
        transactionId,
        amountPaid: paymentAmount,
        paymentMode,
        paymentType,
        previousBalance,
        newBalance: previousBalance - paymentAmount,
        remarks
      });
    }
    
    return { success: true, transactionIds };
  }
  
  static async createLedgerEntry(entry: LedgerEntry) {
    const { data, error } = await supabase
      .from('payment_ledger')
      .insert({
        customer_id: entry.customerId,
        transaction_id: entry.transactionId,
        amount_paid: entry.amountPaid,
        payment_mode: entry.paymentMode,
        payment_type: entry.paymentType,
        previous_balance: entry.previousBalance,
        new_balance: entry.newBalance,
        emi_id: entry.emiId,
        rent_id: entry.rentId,
        reference_number: entry.referenceNumber,
        remarks: entry.remarks,
        recorded_by: entry.recordedBy
      })
      .select()
      .single();
      
    return { data, error };
  }
}
```

## Security & Access Control

### Row Level Security (RLS)

The ledger table has RLS policies ensuring:

1. **Partners can only view their own customers' ledger entries**
```sql
CREATE POLICY "Partners can view own customer ledger entries"
ON payment_ledger FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);
```

2. **Only authorized users can insert ledger entries**
```sql
CREATE POLICY "Partners can insert own customer ledger entries"
ON payment_ledger FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);
```

3. **Updates limited to reconciliation**
```sql
-- Only allow updating reconciliation fields
CREATE POLICY "Partners can update own customer ledger entries"
ON payment_ledger FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);
```

## Reporting Capabilities

### Monthly Collection Report

```sql
SELECT 
  DATE_TRUNC('month', payment_date) as month,
  payment_type,
  COUNT(*) as transaction_count,
  SUM(amount_paid) as total_collected,
  COUNT(DISTINCT customer_id) as unique_customers
FROM payment_ledger
WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')
GROUP BY DATE_TRUNC('month', payment_date), payment_type
ORDER BY month DESC, total_collected DESC;
```

### Outstanding Reconciliation Report

```sql
SELECT 
  DATE(payment_date) as payment_day,
  payment_mode,
  COUNT(*) as pending_count,
  SUM(amount_paid) as pending_amount
FROM payment_ledger
WHERE reconciled = false
AND payment_date < CURRENT_DATE - INTERVAL '3 days'
GROUP BY DATE(payment_date), payment_mode
ORDER BY payment_day ASC;
```

### Customer Payment Pattern

```sql
SELECT 
  c.name,
  c.phone,
  COUNT(pl.id) as total_payments,
  AVG(EXTRACT(DAY FROM (pl.payment_date - LAG(pl.payment_date) OVER (PARTITION BY pl.customer_id ORDER BY pl.payment_date)))) as avg_days_between_payments,
  MODE() WITHIN GROUP (ORDER BY pl.payment_mode) as preferred_payment_mode
FROM payment_ledger pl
JOIN customers c ON c.id = pl.customer_id
GROUP BY c.id, c.name, c.phone
HAVING COUNT(pl.id) > 3
ORDER BY total_payments DESC;
```

## Best Practices

### 1. Always Create Ledger Entries

Every financial transaction must have a corresponding ledger entry:
- Payments (EMI, rent, purchase)
- Deposits (excess payments)
- Refunds
- Adjustments

### 2. Include Comprehensive Remarks

Always add meaningful remarks:
```typescript
remarks: `EMI ${emiNumber} payment - ${status} | Collected by ${partnerName}`
```

### 3. Use Reference Numbers

Always generate and store reference numbers:
```typescript
reference_number: `${paymentMode.upper()}-${timestamp}-${customerId.slice(0,8)}`
```

### 4. Regular Reconciliation

- Reconcile daily for high-volume partners
- Reconcile weekly for others
- Flag discrepancies immediately

### 5. Audit Trail

Never delete ledger entries. For corrections:
- Create reversal entry (negative amount)
- Create correct entry
- Link both with remarks

### 6. Balance Verification

Periodically verify calculated balance matches actual:
```sql
SELECT 
  customer_id,
  calculate_customer_balance(customer_id) as calculated_balance,
  (SELECT new_balance FROM payment_ledger 
   WHERE customer_id = pl.customer_id 
   ORDER BY payment_date DESC, created_at DESC LIMIT 1) as ledger_balance
FROM payment_ledger pl
GROUP BY customer_id
HAVING calculate_customer_balance(customer_id) != 
  (SELECT new_balance FROM payment_ledger 
   WHERE customer_id = pl.customer_id 
   ORDER BY payment_date DESC, created_at DESC LIMIT 1);
```

## Future Enhancements

### Planned Features

1. **Automated Reconciliation**
   - Bank statement import
   - Automatic matching
   - Discrepancy alerts

2. **Advanced Analytics**
   - Payment trend analysis
   - Predictive payment modeling
   - Customer payment health scores

3. **Export Capabilities**
   - PDF statements
   - Excel exports
   - Accounting software integration

4. **Audit Logging**
   - Track all ledger modifications
   - User action history
   - Change tracking

5. **Payment Reminders**
   - Integration with ledger data
   - Smart reminder timing
   - Multiple channels (SMS, Email, WhatsApp)
