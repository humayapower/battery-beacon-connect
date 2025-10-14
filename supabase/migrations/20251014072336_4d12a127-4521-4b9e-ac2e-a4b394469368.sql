-- Drop existing conflicting functions and create proper RBAC system
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, user_role);

-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'partner');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table for proper RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create profiles table to store additional user info
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Update batteries policies to use auth.uid() instead of custom users table
DROP POLICY IF EXISTS "Partners can view own batteries" ON public.batteries;
CREATE POLICY "Partners can view own batteries"
  ON public.batteries FOR SELECT
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can insert own batteries" ON public.batteries;
CREATE POLICY "Partners can insert own batteries"
  ON public.batteries FOR INSERT
  WITH CHECK (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can update own batteries" ON public.batteries;
CREATE POLICY "Partners can update own batteries"
  ON public.batteries FOR UPDATE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can delete own batteries" ON public.batteries;
CREATE POLICY "Partners can delete own batteries"
  ON public.batteries FOR DELETE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Update customers policies
DROP POLICY IF EXISTS "Partners can view own customers" ON public.customers;
CREATE POLICY "Partners can view own customers"
  ON public.customers FOR SELECT
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can insert own customers" ON public.customers;
CREATE POLICY "Partners can insert own customers"
  ON public.customers FOR INSERT
  WITH CHECK (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can update own customers" ON public.customers;
CREATE POLICY "Partners can update own customers"
  ON public.customers FOR UPDATE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can delete own customers" ON public.customers;
CREATE POLICY "Partners can delete own customers"
  ON public.customers FOR DELETE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Update transactions policies
DROP POLICY IF EXISTS "Partners can view own transactions" ON public.transactions;
CREATE POLICY "Partners can view own transactions"
  ON public.transactions FOR SELECT
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can insert own transactions" ON public.transactions;
CREATE POLICY "Partners can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can update own transactions" ON public.transactions;
CREATE POLICY "Partners can update own transactions"
  ON public.transactions FOR UPDATE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Partners can delete own transactions" ON public.transactions;
CREATE POLICY "Partners can delete own transactions"
  ON public.transactions FOR DELETE
  USING (partner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Create trigger to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, name, phone, address)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.raw_user_meta_data->>'address'
  );
  
  -- Insert role (default to partner, admin must be set manually)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'partner')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();