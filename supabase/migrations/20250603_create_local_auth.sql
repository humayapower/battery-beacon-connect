
-- Create a table for local authentication
CREATE TABLE public.local_auth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  address TEXT,
  additional_details TEXT,
  role TEXT NOT NULL DEFAULT 'partner',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.local_auth ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated sessions
CREATE POLICY "Allow read access for local auth" 
  ON public.local_auth 
  FOR SELECT 
  USING (true);

-- Allow insert for new registrations
CREATE POLICY "Allow insert for local auth" 
  ON public.local_auth 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_local_auth_username ON public.local_auth(username);
CREATE INDEX idx_local_auth_phone ON public.local_auth(phone);
