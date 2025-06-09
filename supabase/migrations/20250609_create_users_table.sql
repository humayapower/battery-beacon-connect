-- Create users table that matches the expected structure
CREATE TABLE IF NOT EXISTS public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  address TEXT,
  role TEXT NOT NULL DEFAULT 'partner',
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated sessions
CREATE POLICY "Allow read access for users" 
  ON public.users 
  FOR SELECT 
  USING (true);

-- Allow insert for new registrations
CREATE POLICY "Allow insert for users" 
  ON public.users 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- Insert the default admin user
INSERT INTO public.users (
  username,
  password_hash,
  name,
  phone,
  role
) VALUES (
  'admin',
  'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', -- SHA-256 hash of 'admin123'
  'System Administrator',
  '+1234567890',
  'admin'
) ON CONFLICT (username) DO NOTHING;

-- Update the authenticate_user function to use the users table
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_username TEXT,
  p_password_hash TEXT
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  username TEXT,
  address TEXT,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.phone,
    u.username,
    u.address,
    u.role
  FROM public.users u
  WHERE u.username = p_username 
    AND u.password_hash = p_password_hash;
END;
$$;