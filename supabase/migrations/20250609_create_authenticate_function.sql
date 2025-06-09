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
    la.id,
    la.full_name as name,
    la.phone,
    la.username,
    la.address,
    la.role
  FROM public.local_auth la
  WHERE la.username = p_username 
    AND la.password_hash = p_password_hash;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_user(TEXT, TEXT) TO authenticated;