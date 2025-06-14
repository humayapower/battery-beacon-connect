-- Create a simpler version of payment summary function that works better with Supabase RPC
DROP FUNCTION IF EXISTS get_monthly_payment_summary();
DROP FUNCTION IF EXISTS get_monthly_payment_summary(DATE);

-- Create simple payment summary function without parameters
CREATE OR REPLACE FUNCTION get_monthly_payment_summary()
RETURNS TABLE (
  month_year TEXT,
  total_rent_due NUMERIC,
  total_rent_paid NUMERIC,
  total_rent_overdue NUMERIC,
  total_emi_due NUMERIC,
  total_emi_paid NUMERIC,
  total_emi_overdue NUMERIC,
  active_rental_customers INTEGER,
  active_emi_customers INTEGER,
  overdue_customers INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  month_start DATE;
  current_date_val DATE;
BEGIN
  current_date_val := CURRENT_DATE;
  month_start := DATE_TRUNC('month', current_date_val);
  
  RETURN QUERY
  SELECT 
    TO_CHAR(month_start, 'Mon YYYY')::TEXT as month_year,
    -- Rental stats
    COALESCE((
      SELECT SUM(CASE WHEN mr.payment_status = 'due' THEN mr.remaining_amount ELSE 0 END)
      FROM monthly_rents mr 
      WHERE mr.rent_month = month_start
    ), 0)::NUMERIC as total_rent_due,
    
    COALESCE((
      SELECT SUM(CASE WHEN mr.payment_status = 'paid' THEN mr.amount ELSE mr.paid_amount END)
      FROM monthly_rents mr 
      WHERE mr.rent_month = month_start
    ), 0)::NUMERIC as total_rent_paid,
    
    COALESCE((
      SELECT SUM(CASE WHEN mr.payment_status = 'overdue' THEN mr.remaining_amount ELSE 0 END)
      FROM monthly_rents mr 
      WHERE mr.rent_month = month_start
    ), 0)::NUMERIC as total_rent_overdue,
    
    -- EMI stats for current month
    COALESCE((
      SELECT SUM(CASE WHEN e.payment_status = 'due' THEN e.remaining_amount ELSE 0 END)
      FROM emis e 
      WHERE e.due_date >= month_start 
      AND e.due_date < month_start + INTERVAL '1 month'
    ), 0)::NUMERIC as total_emi_due,
    
    COALESCE((
      SELECT SUM(CASE WHEN e.payment_status = 'paid' THEN e.amount ELSE e.paid_amount END)
      FROM emis e 
      WHERE e.due_date >= month_start 
      AND e.due_date < month_start + INTERVAL '1 month'
    ), 0)::NUMERIC as total_emi_paid,
    
    COALESCE((
      SELECT SUM(CASE WHEN e.payment_status = 'overdue' THEN e.remaining_amount ELSE 0 END)
      FROM emis e 
      WHERE e.due_date >= month_start 
      AND e.due_date < month_start + INTERVAL '1 month'
    ), 0)::NUMERIC as total_emi_overdue,
    
    -- Customer counts
    (
      SELECT COUNT(DISTINCT c.id)::INTEGER
      FROM customers c 
      WHERE c.payment_type = 'monthly_rent' AND c.status = 'active'
    ) as active_rental_customers,
    
    (
      SELECT COUNT(DISTINCT c.id)::INTEGER
      FROM customers c 
      WHERE c.payment_type = 'emi' AND c.status = 'active'
    ) as active_emi_customers,
    
    (
      SELECT COUNT(DISTINCT customer_id)::INTEGER
      FROM (
        SELECT customer_id FROM monthly_rents WHERE payment_status = 'overdue' AND remaining_amount > 0
        UNION
        SELECT customer_id FROM emis WHERE payment_status = 'overdue' AND remaining_amount > 0
      ) overdue_union
    ) as overdue_customers;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_monthly_payment_summary() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_monthly_payment_summary() IS 'Returns comprehensive payment summary for current month - simplified version for RPC calls';