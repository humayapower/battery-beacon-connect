-- Create function to generate monthly rent charges for all active rental customers
CREATE OR REPLACE FUNCTION generate_monthly_rent_charges()
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  rent_amount DECIMAL,
  due_date DATE,
  rent_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_month DATE;
  due_date_5th DATE;
  customer_record RECORD;
  new_rent_id UUID;
BEGIN
  -- Get current month (1st day)
  current_month := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Calculate due date (5th of current month)
  due_date_5th := current_month + INTERVAL '4 days';
  
  -- Only run on 1st of month
  IF EXTRACT(DAY FROM CURRENT_DATE) != 1 THEN
    RAISE NOTICE 'Not the first day of the month, skipping rent generation';
    RETURN;
  END IF;
  
  -- Process all active rental customers
  FOR customer_record IN 
    SELECT c.id, c.name, c.monthly_rent
    FROM customers c
    WHERE c.payment_type = 'monthly_rent' 
    AND c.status = 'active'
    AND c.monthly_rent > 0
  LOOP
    -- Check if rent already exists for current month
    IF NOT EXISTS (
      SELECT 1 FROM monthly_rents mr 
      WHERE mr.customer_id = customer_record.id 
      AND mr.rent_month = current_month
    ) THEN
      -- Create new monthly rent record
      INSERT INTO monthly_rents (
        customer_id,
        rent_month,
        amount,
        due_date,
        payment_status,
        paid_amount,
        remaining_amount,
        is_prorated,
        created_at,
        updated_at
      ) VALUES (
        customer_record.id,
        current_month,
        customer_record.monthly_rent,
        due_date_5th,
        'due',
        0,
        customer_record.monthly_rent,
        false,
        NOW(),
        NOW()
      ) RETURNING id INTO new_rent_id;
      
      -- Update customer's next due date
      UPDATE customers 
      SET next_due_date = due_date_5th,
          updated_at = NOW()
      WHERE id = customer_record.id;
      
      -- Return the processed customer info
      customer_id := customer_record.id;
      customer_name := customer_record.name;
      rent_amount := customer_record.monthly_rent;
      due_date := due_date_5th;
      rent_id := new_rent_id;
      
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$;

-- Create function to update overdue payment statuses
CREATE OR REPLACE FUNCTION update_overdue_status()
RETURNS TABLE (
  overdue_rents_count INTEGER,
  overdue_emis_count INTEGER,
  affected_customers_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rent_count INTEGER := 0;
  emi_count INTEGER := 0;
  customer_count INTEGER := 0;
  affected_customer_ids UUID[];
BEGIN
  -- Update overdue rental payments (overdue after 5th day of month)
  WITH updated_rents AS (
    UPDATE monthly_rents
    SET payment_status = 'overdue',
        updated_at = NOW()
    WHERE due_date < CURRENT_DATE
    AND payment_status IN ('due', 'partial')
    AND remaining_amount > 0
    RETURNING customer_id
  )
  SELECT COUNT(*), ARRAY_AGG(DISTINCT customer_id)
  INTO rent_count, affected_customer_ids
  FROM updated_rents;
  
  -- Update overdue EMI payments (overdue 5 days after due date)
  WITH updated_emis AS (
    UPDATE emis
    SET payment_status = 'overdue',
        updated_at = NOW()
    WHERE due_date < (CURRENT_DATE - INTERVAL '5 days')
    AND payment_status IN ('due', 'partial')
    AND remaining_amount > 0
    RETURNING customer_id
  )
  SELECT COUNT(*) INTO emi_count FROM updated_emis;
  
  -- Get unique affected customers count
  SELECT COUNT(DISTINCT unnest) INTO customer_count
  FROM unnest(affected_customer_ids);
  
  -- Return results
  overdue_rents_count := rent_count;
  overdue_emis_count := emi_count;
  affected_customers_count := customer_count;
  
  RETURN NEXT;
END;
$$;

-- Create function to get monthly payment summary
CREATE OR REPLACE FUNCTION get_monthly_payment_summary(target_month DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  month_year TEXT,
  total_rent_due DECIMAL,
  total_rent_paid DECIMAL,
  total_rent_overdue DECIMAL,
  total_emi_due DECIMAL,
  total_emi_paid DECIMAL,
  total_emi_overdue DECIMAL,
  active_rental_customers INTEGER,
  active_emi_customers INTEGER,
  overdue_customers INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  month_start DATE;
  month_end DATE;
BEGIN
  month_start := DATE_TRUNC('month', target_month);
  month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';
  
  SELECT 
    TO_CHAR(month_start, 'Mon YYYY'),
    COALESCE(SUM(CASE WHEN mr.payment_status = 'due' THEN mr.remaining_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN mr.payment_status = 'paid' THEN mr.amount ELSE mr.paid_amount END), 0),
    COALESCE(SUM(CASE WHEN mr.payment_status = 'overdue' THEN mr.remaining_amount ELSE 0 END), 0),
    COALESCE((SELECT SUM(CASE WHEN e.payment_status = 'due' THEN e.remaining_amount ELSE 0 END) FROM emis e WHERE e.due_date BETWEEN month_start AND month_end), 0),
    COALESCE((SELECT SUM(CASE WHEN e.payment_status = 'paid' THEN e.amount ELSE e.paid_amount END) FROM emis e WHERE e.due_date BETWEEN month_start AND month_end), 0),
    COALESCE((SELECT SUM(CASE WHEN e.payment_status = 'overdue' THEN e.remaining_amount ELSE 0 END) FROM emis e WHERE e.due_date BETWEEN month_start AND month_end), 0),
    (SELECT COUNT(DISTINCT c.id) FROM customers c WHERE c.payment_type = 'monthly_rent' AND c.status = 'active'),
    (SELECT COUNT(DISTINCT c.id) FROM customers c WHERE c.payment_type = 'emi' AND c.status = 'active'),
    (SELECT COUNT(DISTINCT customer_id) FROM (
      SELECT customer_id FROM monthly_rents WHERE payment_status = 'overdue' AND remaining_amount > 0
      UNION
      SELECT customer_id FROM emis WHERE payment_status = 'overdue' AND remaining_amount > 0
    ) overdue_customers)
  INTO 
    month_year,
    total_rent_due,
    total_rent_paid,
    total_rent_overdue,
    total_emi_due,
    total_emi_paid,
    total_emi_overdue,
    active_rental_customers,
    active_emi_customers,
    overdue_customers
  FROM monthly_rents mr
  WHERE mr.rent_month = month_start;
  
  RETURN NEXT;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION generate_monthly_rent_charges() TO authenticated;
GRANT EXECUTE ON FUNCTION update_overdue_status() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_payment_summary(DATE) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_rents_customer_month ON monthly_rents(customer_id, rent_month);
CREATE INDEX IF NOT EXISTS idx_monthly_rents_due_date_status ON monthly_rents(due_date, payment_status) WHERE remaining_amount > 0;
CREATE INDEX IF NOT EXISTS idx_emis_due_date_status ON emis(due_date, payment_status) WHERE remaining_amount > 0;
CREATE INDEX IF NOT EXISTS idx_customers_payment_type_status ON customers(payment_type, status);

-- Add comment
COMMENT ON FUNCTION generate_monthly_rent_charges() IS 'Automatically generates monthly rent charges for all active rental customers on the 1st of each month with due date on 5th';
COMMENT ON FUNCTION update_overdue_status() IS 'Updates payment status to overdue for rents past due date and EMIs past 5-day grace period';
COMMENT ON FUNCTION get_monthly_payment_summary(DATE) IS 'Returns comprehensive payment summary for a given month including dues, payments, and overdue amounts';