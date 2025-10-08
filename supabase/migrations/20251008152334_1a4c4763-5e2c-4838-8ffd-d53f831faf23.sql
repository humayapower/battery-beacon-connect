-- Enable RLS on all tables that don't have it
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_rents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_credits ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive policies on customers, batteries, and transactions
DROP POLICY IF EXISTS "Allow all operations on customers" ON public.customers;
DROP POLICY IF EXISTS "Allow all operations on batteries" ON public.batteries;
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;

-- Create a security definer function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create a security definer function to check if a user is a partner
CREATE OR REPLACE FUNCTION public.is_partner(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id AND role = 'partner'
  );
$$;

-- Create a security definer function to get user's partner_id (returns user_id if they're a partner)
CREATE OR REPLACE FUNCTION public.get_partner_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN role = 'partner' THEN id
    ELSE NULL
  END
  FROM public.users
  WHERE id = user_id;
$$;

-- RLS Policies for users table
-- Users can only view their own data
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Only admins can insert new users (partners)
CREATE POLICY "Admins can insert users"
  ON public.users
  FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Users can update their own data, admins can update all
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid() OR public.is_admin(auth.uid()));

-- Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON public.users
  FOR DELETE
  USING (public.is_admin(auth.uid()));

-- RLS Policies for customers table
-- Partners can view their own customers, admins can view all
CREATE POLICY "Partners can view own customers"
  ON public.customers
  FOR SELECT
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can insert customers for themselves, admins can insert for anyone
CREATE POLICY "Partners can insert own customers"
  ON public.customers
  FOR INSERT
  WITH CHECK (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can update their own customers, admins can update all
CREATE POLICY "Partners can update own customers"
  ON public.customers
  FOR UPDATE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can delete their own customers, admins can delete all
CREATE POLICY "Partners can delete own customers"
  ON public.customers
  FOR DELETE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for batteries table
-- Partners can view their own batteries, admins can view all
CREATE POLICY "Partners can view own batteries"
  ON public.batteries
  FOR SELECT
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can insert batteries for themselves, admins can insert for anyone
CREATE POLICY "Partners can insert own batteries"
  ON public.batteries
  FOR INSERT
  WITH CHECK (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can update their own batteries, admins can update all
CREATE POLICY "Partners can update own batteries"
  ON public.batteries
  FOR UPDATE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can delete their own batteries, admins can delete all
CREATE POLICY "Partners can delete own batteries"
  ON public.batteries
  FOR DELETE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for transactions table
-- Partners can view transactions for their customers, admins can view all
CREATE POLICY "Partners can view own transactions"
  ON public.transactions
  FOR SELECT
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can insert transactions for their customers, admins can insert for anyone
CREATE POLICY "Partners can insert own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can update their own transactions, admins can update all
CREATE POLICY "Partners can update own transactions"
  ON public.transactions
  FOR UPDATE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- Partners can delete their own transactions, admins can delete all
CREATE POLICY "Partners can delete own transactions"
  ON public.transactions
  FOR DELETE
  USING (
    partner_id = public.get_partner_id(auth.uid()) 
    OR public.is_admin(auth.uid())
  );

-- RLS Policies for emis table
-- Partners can view EMIs for their customers, admins can view all
CREATE POLICY "Partners can view own customer emis"
  ON public.emis
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = emis.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can insert EMIs for their customers, admins can insert for anyone
CREATE POLICY "Partners can insert own customer emis"
  ON public.emis
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = emis.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can update EMIs for their customers, admins can update all
CREATE POLICY "Partners can update own customer emis"
  ON public.emis
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = emis.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can delete EMIs for their customers, admins can delete all
CREATE POLICY "Partners can delete own customer emis"
  ON public.emis
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = emis.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- RLS Policies for monthly_rents table
-- Partners can view rents for their customers, admins can view all
CREATE POLICY "Partners can view own customer rents"
  ON public.monthly_rents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = monthly_rents.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can insert rents for their customers, admins can insert for anyone
CREATE POLICY "Partners can insert own customer rents"
  ON public.monthly_rents
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = monthly_rents.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can update rents for their customers, admins can update all
CREATE POLICY "Partners can update own customer rents"
  ON public.monthly_rents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = monthly_rents.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can delete rents for their customers, admins can delete all
CREATE POLICY "Partners can delete own customer rents"
  ON public.monthly_rents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = monthly_rents.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- RLS Policies for customer_credits table
-- Partners can view credits for their customers, admins can view all
CREATE POLICY "Partners can view own customer credits"
  ON public.customer_credits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_credits.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can insert credits for their customers, admins can insert for anyone
CREATE POLICY "Partners can insert own customer credits"
  ON public.customer_credits
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_credits.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can update credits for their customers, admins can update all
CREATE POLICY "Partners can update own customer credits"
  ON public.customer_credits
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_credits.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );

-- Partners can delete credits for their customers, admins can delete all
CREATE POLICY "Partners can delete own customer credits"
  ON public.customer_credits
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = customer_credits.customer_id 
      AND (c.partner_id = public.get_partner_id(auth.uid()) OR public.is_admin(auth.uid()))
    )
  );