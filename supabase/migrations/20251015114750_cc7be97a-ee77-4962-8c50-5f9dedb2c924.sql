-- Update get_partners_with_counts to work with new auth system
DROP FUNCTION IF EXISTS public.get_partners_with_counts();

CREATE OR REPLACE FUNCTION public.get_partners_with_counts()
RETURNS TABLE(
  id UUID,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  battery_count BIGINT,
  customer_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.phone,
    p.address,
    p.created_at,
    p.updated_at,
    COALESCE(b.battery_count, 0) as battery_count,
    COALESCE(c.customer_count, 0) as customer_count
  FROM public.profiles p
  INNER JOIN public.user_roles ur ON p.id = ur.user_id
  LEFT JOIN (
    SELECT partner_id, COUNT(*) as battery_count
    FROM public.batteries
    WHERE partner_id IS NOT NULL
    GROUP BY partner_id
  ) b ON p.id = b.partner_id
  LEFT JOIN (
    SELECT partner_id, COUNT(*) as customer_count
    FROM public.customers
    WHERE partner_id IS NOT NULL
    GROUP BY partner_id
  ) c ON p.id = c.partner_id
  WHERE ur.role = 'partner'
  ORDER BY p.created_at DESC;
END;
$$;