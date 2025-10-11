# Security Best Practices & Implementation Guide

## 🔒 Executive Summary

Battery Beacon Connect implements multiple layers of security to protect sensitive customer data, financial transactions, and system integrity. This document outlines all security measures, best practices, and guidelines for maintaining system security.

## ⚠️ Critical Security Issues

### **Current Security Vulnerabilities**

#### 1. **Password Storage in Public Schema**
**Status**: ⚠️ HIGH PRIORITY - NEEDS MIGRATION

**Current Issue**:
- Password hashes stored in `public.users` table
- Accessible through RLS policies
- Phone numbers exposed in same table

**Recommended Solution**:
```sql
-- Create separate user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'partner');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Migration Steps**:
1. Migrate to Supabase Auth (recommended) or
2. Move password hashes to secure storage
3. Implement `user_roles` table
4. Update all RLS policies
5. Update authentication functions

#### 2. **Custom Authentication System**
**Current Implementation**:
- Username/password authentication
- SHA-256 password hashing (client-side)
- localStorage for session management
- RPC functions for authentication

**Security Concerns**:
- Client-side hashing exposes hash algorithm
- localStorage vulnerable to XSS attacks
- No session timeout mechanism
- No multi-factor authentication

**Recommended Migration Path**:
```typescript
// Migrate to Supabase Auth
import { supabase } from '@/integrations/supabase/client';

// User signup
const { data, error } = await supabase.auth.signUp({
  email: username + '@batterybeacon.local',
  password: password,
  options: {
    data: { role: 'partner', name, phone, address }
  }
});

// User signin
const { data, error } = await supabase.auth.signInWithPassword({
  email: username + '@batterybeacon.local',
  password: password
});

// Check session
const { data: { session } } = await supabase.auth.getSession();
```

## 🛡️ Security Layers

### 1. **Authentication Layer**

#### Current Implementation
```typescript
// src/contexts/AuthContext.tsx
const signIn = async (username: string, password: string) => {
  // Client-side hash (NOT SECURE)
  const hashedPassword = await hashPassword(password);
  
  // RPC call to verify credentials
  const { data, error } = await supabase.rpc('authenticate_user', {
    p_username: username,
    p_password_hash: hashedPassword
  });
};
```

#### Best Practices
- ✅ Never hash passwords on client-side
- ✅ Use server-side authentication
- ✅ Implement session timeout
- ✅ Use HTTPS for all requests
- ✅ Implement rate limiting on login attempts
- ✅ Log all authentication attempts

#### Recommended Implementation
```typescript
// Use Supabase Auth with server-side validation
const signIn = async (username: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: username + '@batterybeacon.local',
    password: password
  });
  
  if (error) throw error;
  
  // Fetch user role from user_roles table
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();
    
  return { user: data.user, role: roleData.role };
};
```

### 2. **Authorization Layer**

#### Row Level Security (RLS) Policies

**Current Policies**:
```sql
-- Partners can only view their own data
CREATE POLICY "Partners can view own batteries"
ON public.batteries
FOR SELECT
USING (partner_id = get_partner_id(auth.uid()) OR is_admin(auth.uid()));

-- Admins can view everything
CREATE POLICY "Admins can view all batteries"
ON public.batteries
FOR SELECT
USING (is_admin(auth.uid()));
```

**Security Functions**:
```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Get partner ID for logged-in user
CREATE OR REPLACE FUNCTION public.get_partner_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE 
    WHEN role = 'partner' THEN id
    ELSE NULL
  END
  FROM public.users
  WHERE id = user_id;
$$;
```

#### Best Practices for RLS
- ✅ Always enable RLS on all tables
- ✅ Use security definer functions to avoid infinite recursion
- ✅ Test policies with different user roles
- ✅ Never use `USING (true)` in production
- ✅ Separate read and write policies
- ✅ Log policy violations

### 3. **Data Protection Layer**

#### Sensitive Data Handling

**Password Storage**:
```sql
-- CURRENT (INSECURE)
CREATE TABLE public.users (
  password_hash TEXT NOT NULL  -- Exposed in public schema
);

-- RECOMMENDED
-- Move to auth.users or separate secure table
-- Never expose password hashes through API
```

**Personal Information**:
```sql
-- Phone numbers, addresses, ID documents
-- Implement field-level encryption for sensitive data

CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$;
```

**Document Storage**:
```sql
-- Supabase Storage with RLS policies
CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'customer-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

### 4. **Input Validation & Sanitization**

#### Form Validation (Zod Schemas)
```typescript
import { z } from 'zod';

// Customer validation schema
const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Invalid characters in name'),
  
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  
  address: z.string()
    .min(10, 'Address too short')
    .max(500, 'Address too long'),
  
  // Prevent SQL injection
  customerId: z.string()
    .regex(/^[A-Z0-9-]+$/, 'Invalid customer ID format')
});

// Validate before database operations
const validatedData = customerSchema.parse(formData);
```

#### SQL Injection Prevention
```typescript
// ❌ NEVER DO THIS
const { data } = await supabase.rpc('raw_query', {
  query: `SELECT * FROM users WHERE username = '${username}'`
});

// ✅ ALWAYS USE PARAMETERIZED QUERIES
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('username', username);  // Properly escaped
```

#### XSS Prevention
```typescript
// ❌ DANGEROUS
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ SAFE - React automatically escapes
<div>{userInput}</div>

// ✅ SANITIZE HTML IF NEEDED
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userInput) 
}} />
```

### 5. **File Upload Security**

#### File Validation
```typescript
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const validateFile = (file: File) => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }
  
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(extension || '')) {
    throw new Error('Invalid file extension');
  }
  
  return true;
};
```

#### Secure File Upload
```typescript
const uploadDocument = async (file: File, customerId: string) => {
  // Validate file
  validateFile(file);
  
  // Generate secure filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const secureFileName = `${customerId}/${timestamp}-${randomString}.${extension}`;
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('customer-documents')
    .upload(secureFileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) throw error;
  return secureFileName;
};
```

#### Storage Bucket Policies
```sql
-- Restrict file access to authorized users
CREATE POLICY "Users can upload own documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'customer-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT customer_id FROM customers WHERE partner_id = auth.uid()
  )
);

CREATE POLICY "Users can view own documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'customer-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT customer_id FROM customers WHERE partner_id = auth.uid()
  )
);
```

### 6. **API Security**

#### Rate Limiting
```typescript
// Implement rate limiting for API endpoints
// Use edge functions with rate limit middleware

const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const checkRateLimit = (userId: string, maxRequests: number = 100) => {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimiter.set(userId, {
      count: 1,
      resetAt: now + 60000 // 1 minute
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
};
```

#### CORS Configuration
```typescript
// Supabase Edge Function CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Always handle OPTIONS requests
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

### 7. **Session Management**

#### Session Security Best Practices
```typescript
// Current implementation (INSECURE)
localStorage.setItem('user', JSON.stringify(userData));

// Recommended implementation
// Use Supabase Auth sessions (httpOnly cookies)
const { data: { session } } = await supabase.auth.getSession();

// Implement session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const checkSessionTimeout = () => {
  const lastActivity = localStorage.getItem('lastActivity');
  if (lastActivity) {
    const elapsed = Date.now() - parseInt(lastActivity);
    if (elapsed > SESSION_TIMEOUT) {
      // Force logout
      signOut();
      return false;
    }
  }
  localStorage.setItem('lastActivity', Date.now().toString());
  return true;
};

// Update activity on user interaction
window.addEventListener('click', checkSessionTimeout);
window.addEventListener('keypress', checkSessionTimeout);
```

## 🔍 Security Audit Checklist

### Database Security
- [ ] All tables have RLS enabled
- [ ] RLS policies properly restrict data access
- [ ] No sensitive data in public schema
- [ ] Password hashes not exposed
- [ ] Phone numbers restricted to authorized users
- [ ] Security definer functions used to avoid recursion
- [ ] All foreign keys properly defined
- [ ] Indexes on frequently queried columns
- [ ] No raw SQL queries in application code

### Authentication Security
- [ ] Server-side password hashing
- [ ] Secure session management
- [ ] Session timeout implemented
- [ ] Rate limiting on login attempts
- [ ] Account lockout after failed attempts
- [ ] Password complexity requirements
- [ ] No hardcoded credentials
- [ ] Authentication logs maintained

### Authorization Security
- [ ] Role-based access control implemented
- [ ] Admin privileges properly restricted
- [ ] Partner data isolation enforced
- [ ] API endpoints protected
- [ ] File access restricted by RLS
- [ ] No privilege escalation vulnerabilities

### Input Validation
- [ ] All user inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload validation
- [ ] Proper error messages (no sensitive data leaks)

### Data Protection
- [ ] Sensitive data encrypted
- [ ] HTTPS enforced
- [ ] Secure storage policies
- [ ] Data backup procedures
- [ ] Personal data handling compliant

### API Security
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] API authentication required
- [ ] Request validation
- [ ] Response sanitization

## 🚨 Incident Response Plan

### Security Breach Procedure

1. **Detection**
   - Monitor logs for suspicious activity
   - Set up alerts for unusual patterns
   - Track failed login attempts

2. **Containment**
   - Immediately revoke compromised sessions
   - Block suspicious IP addresses
   - Disable affected user accounts

3. **Investigation**
   - Review access logs
   - Identify breach scope
   - Document all findings

4. **Recovery**
   - Reset affected passwords
   - Update security policies
   - Patch vulnerabilities

5. **Communication**
   - Notify affected users
   - Report to authorities if required
   - Update security documentation

## 📝 Security Development Guidelines

### Code Review Checklist
```markdown
- [ ] No hardcoded credentials or API keys
- [ ] All database queries use parameterized inputs
- [ ] User inputs validated before processing
- [ ] Error messages don't expose sensitive information
- [ ] Authentication required for protected routes
- [ ] Authorization checks before data access
- [ ] File uploads validated and sanitized
- [ ] RLS policies tested for all user roles
- [ ] No console.log statements with sensitive data
- [ ] Dependencies checked for vulnerabilities
```

### Security Testing
```typescript
// Test RLS policies
const testRLSPolicies = async () => {
  // Test as admin
  const adminClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  await adminClient.auth.signInWithPassword({ /* admin creds */ });
  
  // Test as partner
  const partnerClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false }
  });
  await partnerClient.auth.signInWithPassword({ /* partner creds */ });
  
  // Verify data isolation
  const { data: adminData } = await adminClient.from('customers').select('*');
  const { data: partnerData } = await partnerClient.from('customers').select('*');
  
  console.assert(adminData.length > partnerData.length, 'Admin should see more data');
};
```

## 🔐 Encryption Guidelines

### Data at Rest
```sql
-- Enable encryption for sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(pgp_sym_encrypt(phone, current_setting('app.encryption_key')), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrypt when needed
CREATE OR REPLACE FUNCTION decrypt_phone(encrypted_phone TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(decode(encrypted_phone, 'base64'), current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Data in Transit
- Always use HTTPS
- TLS 1.2 or higher
- Secure WebSocket connections
- Certificate pinning for mobile apps

## 📊 Security Monitoring

### Logging Strategy
```typescript
// Log all security-relevant events
const securityLog = async (event: string, userId: string, metadata?: any) => {
  await supabase.from('security_logs').insert({
    event_type: event,
    user_id: userId,
    metadata: metadata,
    ip_address: req.headers.get('x-forwarded-for'),
    user_agent: req.headers.get('user-agent'),
    timestamp: new Date().toISOString()
  });
};

// Examples
await securityLog('login_success', userId);
await securityLog('login_failed', username, { reason: 'invalid_password' });
await securityLog('permission_denied', userId, { resource: 'admin_panel' });
await securityLog('data_export', userId, { table: 'customers', count: 100 });
```

### Alerts Configuration
- Failed login attempts (5+ in 10 minutes)
- Privilege escalation attempts
- Unusual data access patterns
- Large data exports
- Account modifications
- Payment anomalies

## 🎯 Priority Security Improvements

### Immediate (Critical)
1. Migrate passwords from public.users to secure storage
2. Implement user_roles table
3. Update RLS policies to use security definer functions
4. Add session timeout mechanism
5. Implement rate limiting on authentication endpoints

### Short-term (High Priority)
1. Migrate to Supabase Auth
2. Add multi-factor authentication
3. Implement comprehensive logging
4. Add security monitoring dashboard
5. Conduct security audit

### Long-term (Medium Priority)
1. Field-level encryption for sensitive data
2. Advanced threat detection
3. Compliance certifications (ISO 27001, SOC 2)
4. Penetration testing
5. Security training for developers

---

**Last Updated**: 2024-01-10
**Version**: 1.0
**Maintained by**: Development Team