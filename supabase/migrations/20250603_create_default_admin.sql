
-- Create default admin user
-- Password: admin123 (hashed)
INSERT INTO public.local_auth (
  username,
  password_hash,
  full_name,
  phone,
  role
) VALUES (
  'admin',
  'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d', -- SHA-256 hash of 'admin123'
  'System Administrator',
  '+1234567890',
  'admin'
) ON CONFLICT (username) DO NOTHING;
