# Troubleshooting Guide

## 🎯 Overview

This guide provides solutions to common issues encountered while developing, deploying, or using Battery Beacon Connect. Issues are organized by category with symptoms, causes, and solutions.

## 🔍 Quick Diagnosis

### Symptom Checker

**Application won't load**:
- → Check [Startup Issues](#startup-issues)

**Can't log in**:
- → Check [Authentication Issues](#authentication-issues)

**Data not showing**:
- → Check [Database & RLS Issues](#database--rls-issues)

**Files won't upload**:
- → Check [File Upload Issues](#file-upload-issues)

**Payments not processing**:
- → Check [Payment System Issues](#payment-system-issues)

**Automated jobs not running**:
- → Check [Edge Function Issues](#edge-function-issues)

## 🚨 Startup Issues

### Issue: Application won't start

**Symptoms**:
```bash
npm run dev
# Error: Cannot find module...
```

**Causes & Solutions**:

**1. Missing dependencies**
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**2. Port already in use**
```bash
# Error: Port 5173 is already in use

# Solution: Kill process or use different port
lsof -ti:5173 | xargs kill  # Mac/Linux
# or
netstat -ano | findstr :5173  # Windows

# Or change port in vite.config.ts
export default defineConfig({
  server: { port: 3000 }
});
```

**3. Environment variables missing**
```bash
# Error: VITE_SUPABASE_URL is not defined

# Solution: Create .env file
cp .env.example .env
# Add required values:
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Issue: Build fails

**Symptoms**:
```bash
npm run build
# Error: TS2304: Cannot find name 'Customer'
```

**Solutions**:

**1. TypeScript errors**
```bash
# Check for type errors
npx tsc --noEmit

# Common fixes:
# - Import missing types
# - Add type definitions
# - Fix type mismatches
```

**2. Import errors**
```typescript
// ❌ Wrong import path
import { Button } from 'components/ui/button';

// ✅ Correct import path (with @ alias)
import { Button } from '@/components/ui/button';
```

**3. Missing files**
```bash
# Ensure all referenced files exist
# Check case sensitivity in file names
```

## 🔐 Authentication Issues

### Issue: Can't log in

**Symptoms**:
- Login form submits but redirects back
- "Invalid credentials" error
- Infinite loading

**Solutions**:

**1. Check credentials**
```typescript
// Default admin credentials (if seeded):
Username: admin
Password: admin123

// Verify password hashing is working
const testPassword = await hashPassword('admin123');
console.log('Hashed:', testPassword);
```

**2. Check RPC function**
```sql
-- Verify authenticate_user function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'authenticate_user';

-- Test function manually
SELECT * FROM authenticate_user('admin', 'hashed_password');
```

**3. Check localStorage**
```javascript
// Clear localStorage and retry
localStorage.clear();
window.location.reload();

// Check if user data is saved after login
console.log('User:', localStorage.getItem('user'));
```

**4. Network issues**
```typescript
// Check if Supabase is reachable
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', { data, error });
```

### Issue: Session expires immediately

**Symptoms**:
- User logs in successfully
- Redirects to login after page refresh
- User data lost

**Solutions**:

**1. Check localStorage persistence**
```typescript
// Ensure user data is saved
const saveUser = (userData: User) => {
  try {
    localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

// Verify data retrieval
const loadUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to load user:', error);
    return null;
  }
};
```

**2. Check AuthContext**
```typescript
// Verify AuthContext is properly initialized
// In AuthContext.tsx
useEffect(() => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    setUser(JSON.parse(savedUser));
  }
}, []);
```

### Issue: Unauthorized access errors

**Symptoms**:
```javascript
Error: No user authenticated
Error: Unauthorized
```

**Solutions**:

**1. Check auth.uid()**
```sql
-- Test if auth.uid() returns value
SELECT auth.uid();

-- If NULL, user not authenticated in Supabase context
-- Use custom authentication with userId stored in localStorage
```

**2. Verify RLS policies**
```sql
-- Check if policies allow access
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- Test query as specific user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "user-id-here"}';
SELECT * FROM customers;
```

## 🗄️ Database & RLS Issues

### Issue: Data not loading (RLS blocking)

**Symptoms**:
```javascript
// Query returns empty array
const { data } = await supabase.from('customers').select('*');
console.log(data); // []

// Or error
// new row violates row-level security policy
```

**Solutions**:

**1. Check authentication**
```javascript
// Verify user is authenticated
const user = localStorage.getItem('user');
if (!user) {
  console.error('User not authenticated');
}
```

**2. Check RLS policies**
```sql
-- View policies
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- Temporarily disable RLS for testing (DEV ONLY)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- If this works, fix the RLS policies then re-enable
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

**3. Debug RLS functions**
```sql
-- Test security functions
SELECT is_admin('user-id-here');
SELECT get_partner_id('user-id-here');

-- Check if user exists in users table
SELECT * FROM users WHERE id = 'user-id-here';
```

**4. Check authentication context**
```typescript
// Custom auth doesn't use auth.uid()
// RLS policies may need modification
// Use custom session variable or different approach

// Example: Pass user_id in query
const { data } = await supabase.rpc('get_partner_customers', {
  p_partner_id: user.id
});
```

### Issue: Foreign key violations

**Symptoms**:
```javascript
// Error: insert or update on table "customers" violates foreign key constraint
```

**Solutions**:

**1. Check referenced records exist**
```typescript
// Verify partner exists before creating customer
const { data: partner } = await supabase
  .from('users')
  .select('id')
  .eq('id', partnerId)
  .single();

if (!partner) {
  throw new Error('Partner not found');
}
```

**2. Check UUID format**
```typescript
// Ensure proper UUID format
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
```

### Issue: Slow queries

**Symptoms**:
- Pages take long to load
- Tables lag when scrolling
- Search is slow

**Solutions**:

**1. Add indexes**
```sql
-- Add indexes on frequently queried columns
CREATE INDEX idx_customers_partner_id ON customers(partner_id);
CREATE INDEX idx_batteries_status ON batteries(status);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_emis_customer_id ON emis(customer_id);
CREATE INDEX idx_emis_payment_status ON emis(payment_status);
```

**2. Optimize queries**
```typescript
// ❌ Avoid N+1 queries
const customers = await supabase.from('customers').select('*');
for (const customer of customers) {
  const battery = await supabase.from('batteries').select('*').eq('id', customer.battery_id);
}

// ✅ Use joins
const customers = await supabase
  .from('customers')
  .select('*, batteries(*), users(name)')
  .limit(100);
```

**3. Implement pagination**
```typescript
// Paginate large datasets
const PAGE_SIZE = 50;
const { data, count } = await supabase
  .from('customers')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

## 📁 File Upload Issues

### Issue: Files won't upload

**Symptoms**:
```javascript
// Error: Error uploading file
// Error: Permission denied
```

**Solutions**:

**1. Check file size**
```typescript
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

if (file.size > MAX_FILE_SIZE) {
  throw new Error('File too large');
}
```

**2. Check file type**
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

if (!ALLOWED_TYPES.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

**3. Check storage policies**
```sql
-- View storage policies
SELECT * FROM storage.objects WHERE bucket_id = 'customer-documents';

-- Check bucket exists
SELECT * FROM storage.buckets WHERE name = 'customer-documents';

-- Create bucket if missing
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-documents', 'customer-documents', true);
```

**4. Check CORS settings**
```typescript
// If getting CORS errors, verify Supabase configuration
// Go to Supabase Dashboard → Storage → Settings
// Allowed origins should include your domain
```

### Issue: Uploaded files not visible

**Symptoms**:
- File uploads successfully
- URL generated but image doesn't display
- 403 or 404 errors

**Solutions**:

**1. Check bucket is public**
```sql
-- Make bucket public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'customer-documents';
```

**2. Verify file path**
```typescript
// Correct URL format
const { data } = supabase.storage
  .from('customer-documents')
  .getPublicUrl('customer-id/file.jpg');

console.log('Public URL:', data.publicUrl);
```

**3. Check storage policies**
```sql
-- Add SELECT policy for public access
CREATE POLICY "Public access to customer documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-documents');
```

## 💰 Payment System Issues

### Issue: EMI not generating

**Symptoms**:
- Customer created but EMI records missing
- EMI table empty for new customer

**Solutions**:

**1. Check trigger**
```sql
-- Verify trigger exists
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'generate_emi_records_after_insert';

-- Manually trigger EMI generation
SELECT generate_emi_records_after_insert();
```

**2. Check customer data**
```typescript
// Ensure all required fields are set
const customerData = {
  payment_type: 'emi',
  total_amount: 100000,
  down_payment: 20000,
  emi_count: 12,
  emi_amount: 6666.67,
  emi_start_date: '2024-01-15'
};
```

**3. Manual EMI creation**
```typescript
// If automatic generation fails, create manually
const emiSchedule = Array.from({ length: emiCount }, (_, i) => ({
  customer_id: customerId,
  emi_number: i + 1,
  total_emi_count: emiCount,
  amount: emiAmount,
  due_date: addMonths(startDate, i),
  remaining_amount: emiAmount
}));

await supabase.from('emis').insert(emiSchedule);
```

### Issue: Payment not distributing correctly

**Symptoms**:
- Payment recorded but EMI/rent not updated
- Credit not applied
- Wrong amount deducted

**Solutions**:

**1. Check payment distribution logic**
```typescript
// Verify billingService.ts logic
import { distributePayment } from '@/services/billingService';

const result = await distributePayment(customerId, amount);
console.log('Distribution result:', result);
```

**2. Debug step by step**
```typescript
// 1. Check unpaid items
const { data: emis } = await supabase
  .from('emis')
  .select('*')
  .eq('customer_id', customerId)
  .in('payment_status', ['due', 'partial', 'overdue'])
  .order('due_date');

console.log('Unpaid EMIs:', emis);

// 2. Check credit balance
const { data: credit } = await supabase
  .from('customer_credits')
  .select('credit_balance')
  .eq('customer_id', customerId)
  .single();

console.log('Credit balance:', credit);
```

### Issue: Overdue status not updating

**Symptoms**:
- Payments past due date still marked as "due"
- Overdue status not reflecting in dashboard

**Solutions**:

**1. Check edge function**
```bash
# Check if overdue processor is running
# View logs in Supabase Dashboard → Edge Functions
```

**2. Manual status update**
```sql
-- Update overdue EMIs
UPDATE emis 
SET payment_status = 'overdue' 
WHERE due_date < CURRENT_DATE 
AND payment_status IN ('due', 'partial');

-- Update overdue rents
UPDATE monthly_rents 
SET payment_status = 'overdue' 
WHERE due_date < CURRENT_DATE 
AND payment_status IN ('due', 'partial');
```

**3. Check automated scheduling**
```typescript
// Verify AutoSchedulingService is running
// Check localStorage for last run
console.log('Last check:', localStorage.getItem('last_daily_check_date'));

// Force check
localStorage.removeItem('last_daily_check_date');
window.location.reload();
```

## ⚡ Edge Function Issues

### Issue: Edge function not executing

**Symptoms**:
- Function called but no response
- Timeout errors
- 500 errors

**Solutions**:

**1. Check function logs**
```bash
# View logs in Supabase Dashboard
# Or use CLI
supabase functions logs function-name
```

**2. Test function locally**
```bash
# Serve function
supabase functions serve function-name

# Test with curl
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer YOUR_KEY"
```

**3. Check CORS headers**
```typescript
// Ensure CORS headers are included
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

**4. Check environment variables**
```typescript
// Verify env vars are set
console.log('URL:', Deno.env.get('SUPABASE_URL'));
console.log('Key:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Missing');
```

### Issue: Scheduled functions not running

**Symptoms**:
- Monthly rents not generating
- Overdue status not updating automatically

**Solutions**:

**1. Check cron configuration**
```bash
# Verify cron job is set up
# Check .github/workflows/payment-scheduler.yml
# Or Supabase Dashboard → Edge Functions → Cron
```

**2. Manual execution**
```typescript
// Call function manually to test
const { data, error } = await supabase.functions.invoke('monthly-rent-scheduler');
console.log('Result:', data, error);
```

## 🎨 UI/Display Issues

### Issue: Styles not applying

**Symptoms**:
- Components look unstyled
- Tailwind classes not working
- Dark mode not working

**Solutions**:

**1. Check Tailwind configuration**
```typescript
// Verify tailwind.config.ts includes all paths
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ...
}
```

**2. Rebuild Tailwind**
```bash
# Clear cache and rebuild
rm -rf .vite
npm run dev
```

**3. Check CSS imports**
```typescript
// Ensure index.css is imported in main.tsx
import './index.css';
```

**4. Verify HSL colors**
```css
/* Check index.css for proper HSL color definitions */
:root {
  --primary: 222.2 47.4% 11.2%;  /* Must be HSL without 'hsl()' */
}
```

### Issue: Components not rendering

**Symptoms**:
- Blank page
- Components missing
- React errors in console

**Solutions**:

**1. Check console for errors**
```javascript
// Open browser console
// Look for:
// - Import errors
// - Type errors
// - Runtime errors
```

**2. Check component imports**
```typescript
// ❌ Wrong
import { Button } from 'components/ui/button';

// ✅ Correct
import { Button } from '@/components/ui/button';
```

**3. Check React Query setup**
```typescript
// Ensure QueryClientProvider wraps app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

## 📊 Performance Issues

### Issue: Slow page loads

**Solutions**:

**1. Implement lazy loading**
```typescript
import { lazy, Suspense } from 'react';

const Reports = lazy(() => import('./pages/Reports'));

<Suspense fallback={<Loading />}>
  <Reports />
</Suspense>
```

**2. Optimize images**
```typescript
// Use WebP format
// Compress images
// Lazy load images below fold
<img loading="lazy" src="..." />
```

**3. Use React Query caching**
```typescript
// Set appropriate stale and cache times
useQuery({
  queryKey: ['customers'],
  queryFn: fetchCustomers,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## 🆘 Getting Help

### When to ask for help

1. Issue persists after trying solutions here
2. Error messages are unclear
3. Unexpected behavior occurs
4. Security concerns arise

### Information to provide

```markdown
**Issue Description**: 
[Clear description of the problem]

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. Error occurs

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Error Messages**:
```
[Paste error messages]
```

**Environment**:
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]

**Screenshots**:
[If applicable]
```

### Resources

- Project documentation: `docs/` folder
- Supabase docs: https://supabase.com/docs
- React docs: https://react.dev
- TypeScript docs: https://www.typescriptlang.org/docs

---

**Last Updated**: 2024-01-10
**Maintained by**: Development Team