-- Create authenticate_user function
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

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;