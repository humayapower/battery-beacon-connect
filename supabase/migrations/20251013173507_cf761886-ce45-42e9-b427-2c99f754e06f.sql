-- Create payment_ledger table for comprehensive transaction tracking
CREATE TABLE IF NOT EXISTS public.payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount_paid NUMERIC NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('cash', 'upi', 'bank_transfer', 'cheque', 'card')),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('emi', 'rent', 'purchase', 'deposit', 'refund', 'adjustment')),
  
  -- Running balance tracking
  previous_balance NUMERIC NOT NULL DEFAULT 0,
  new_balance NUMERIC NOT NULL DEFAULT 0,
  
  -- Reference details
  emi_id UUID REFERENCES public.emis(id) ON DELETE SET NULL,
  rent_id UUID REFERENCES public.monthly_rents(id) ON DELETE SET NULL,
  battery_id UUID REFERENCES public.batteries(id) ON DELETE SET NULL,
  
  -- Payment specific details
  reference_number TEXT,
  cheque_number TEXT,
  bank_name TEXT,
  upi_transaction_id TEXT,
  
  -- Additional metadata
  remarks TEXT,
  recorded_by UUID,
  reconciled BOOLEAN DEFAULT false,
  reconciliation_date TIMESTAMP WITH TIME ZONE,
  reconciliation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_ledger
CREATE POLICY "Partners can view own customer ledger entries"
ON public.payment_ledger
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Partners can insert own customer ledger entries"
ON public.payment_ledger
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Partners can update own customer ledger entries"
ON public.payment_ledger
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Partners can delete own customer ledger entries"
ON public.payment_ledger
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.customers c
    WHERE c.id = payment_ledger.customer_id
    AND (c.partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()))
  )
);

-- Create indexes for better query performance
CREATE INDEX idx_payment_ledger_customer_id ON public.payment_ledger(customer_id);
CREATE INDEX idx_payment_ledger_transaction_id ON public.payment_ledger(transaction_id);
CREATE INDEX idx_payment_ledger_payment_date ON public.payment_ledger(payment_date);
CREATE INDEX idx_payment_ledger_emi_id ON public.payment_ledger(emi_id) WHERE emi_id IS NOT NULL;
CREATE INDEX idx_payment_ledger_rent_id ON public.payment_ledger(rent_id) WHERE rent_id IS NOT NULL;
CREATE INDEX idx_payment_ledger_reconciled ON public.payment_ledger(reconciled) WHERE reconciled = false;

-- Create function to calculate running balance
CREATE OR REPLACE FUNCTION public.calculate_customer_balance(p_customer_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_paid NUMERIC;
  v_total_due NUMERIC;
  v_credit_balance NUMERIC;
BEGIN
  -- Calculate total paid from ledger
  SELECT COALESCE(SUM(amount_paid), 0)
  INTO v_total_paid
  FROM public.payment_ledger
  WHERE customer_id = p_customer_id
  AND payment_type IN ('emi', 'rent', 'purchase');
  
  -- Calculate total due (EMIs + Rents)
  SELECT COALESCE(SUM(remaining_amount), 0)
  INTO v_total_due
  FROM (
    SELECT remaining_amount FROM public.emis WHERE customer_id = p_customer_id
    UNION ALL
    SELECT remaining_amount FROM public.monthly_rents WHERE customer_id = p_customer_id
  ) AS combined_dues;
  
  -- Get credit balance
  SELECT COALESCE(credit_balance, 0)
  INTO v_credit_balance
  FROM public.customer_credits
  WHERE customer_id = p_customer_id;
  
  -- Return net balance (negative = customer owes, positive = credit)
  RETURN v_credit_balance - v_total_due;
END;
$$;

-- Create trigger to update timestamps
CREATE OR REPLACE FUNCTION public.update_payment_ledger_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_payment_ledger_updated_at
BEFORE UPDATE ON public.payment_ledger
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_ledger_timestamp();

-- Create function to get customer ledger with running balance
CREATE OR REPLACE FUNCTION public.get_customer_ledger_with_balance(p_customer_id UUID)
RETURNS TABLE (
  id UUID,
  payment_date TIMESTAMP WITH TIME ZONE,
  amount_paid NUMERIC,
  payment_mode TEXT,
  payment_type TEXT,
  running_balance NUMERIC,
  reference_number TEXT,
  remarks TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pl.id,
    pl.payment_date,
    pl.amount_paid,
    pl.payment_mode,
    pl.payment_type,
    pl.new_balance as running_balance,
    pl.reference_number,
    pl.remarks
  FROM public.payment_ledger pl
  WHERE pl.customer_id = p_customer_id
  ORDER BY pl.payment_date DESC, pl.created_at DESC;
END;
$$;