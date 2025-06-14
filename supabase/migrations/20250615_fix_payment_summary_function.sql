-- Fix the payment summary function to work with RPC calls
-- Drop the existing function and recreate with proper parameter handling

DROP FUNCTION IF EXISTS get_monthly_payment_summary(DATE);

-- Create overloaded versions - one with parameter, one without
CREATE OR REPLACE FUNCTION get_monthly_payment_summary()
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
BEGIN
  -- Call the version with parameter using current date
  RETURN QUERY SELECT * FROM get_monthly_payment_summary(CURRENT_DATE);
END;
$$;

-- Create the version with parameter
CREATE OR REPLACE FUNCTION get_monthly_payment_summary(target_month DATE)
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
  rent_due DECIMAL := 0;
  rent_paid DECIMAL := 0;
  rent_overdue DECIMAL := 0;
  emi_due DECIMAL := 0;
  emi_paid DECIMAL := 0;
  emi_overdue DECIMAL := 0;
  rental_customers INTEGER := 0;
  emi_customers INTEGER := 0;
  overdue_count INTEGER := 0;
BEGIN
  month_start := DATE_TRUNC('month', target_month);
  month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';
  
  -- Get rental payment summary for the month
  SELECT 
    COALESCE(SUM(CASE WHEN mr.payment_status = 'due' THEN mr.remaining_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN mr.payment_status = 'paid' THEN mr.amount ELSE mr.paid_amount END), 0),
    COALESCE(SUM(CASE WHEN mr.payment_status = 'overdue' THEN mr.remaining_amount ELSE 0 END), 0)
  INTO rent_due, rent_paid, rent_overdue
  FROM monthly_rents mr
  WHERE mr.rent_month = month_start;
  
  -- Get EMI payment summary for payments due in this month
  SELECT 
    COALESCE(SUM(CASE WHEN e.payment_status = 'due' THEN e.remaining_amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN e.payment_status = 'paid' THEN e.amount ELSE e.paid_amount END), 0),
    COALESCE(SUM(CASE WHEN e.payment_status = 'overdue' THEN e.remaining_amount ELSE 0 END), 0)
  INTO emi_due, emi_paid, emi_overdue
  FROM emis e 
  WHERE e.due_date BETWEEN month_start AND month_end;
  
  -- Get customer counts
  SELECT COUNT(DISTINCT c.id) INTO rental_customers
  FROM customers c 
  WHERE c.payment_type = 'monthly_rent' AND c.status = 'active';
  
  SELECT COUNT(DISTINCT c.id) INTO emi_customers
  FROM customers c 
  WHERE c.payment_type = 'emi' AND c.status = 'active';
  
  -- Get overdue customers count
  SELECT COUNT(DISTINCT customer_id) INTO overdue_count
  FROM (
    SELECT customer_id FROM monthly_rents WHERE payment_status = 'overdue' AND remaining_amount > 0
    UNION
    SELECT customer_id FROM emis WHERE payment_status = 'overdue' AND remaining_amount > 0
  ) overdue_customers_union;
  
  -- Return the results
  month_year := TO_CHAR(month_start, 'Mon YYYY');
  total_rent_due := rent_due;
  total_rent_paid := rent_paid;
  total_rent_overdue := rent_overdue;
  total_emi_due := emi_due;
  total_emi_paid := emi_paid;
  total_emi_overdue := emi_overdue;
  active_rental_customers := rental_customers;
  active_emi_customers := emi_customers;
  overdue_customers := overdue_count;
  
  RETURN NEXT;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_monthly_payment_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_payment_summary(DATE) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_monthly_payment_summary() IS 'Returns comprehensive payment summary for current month';
COMMENT ON FUNCTION get_monthly_payment_summary(DATE) IS 'Returns comprehensive payment summary for specified month';