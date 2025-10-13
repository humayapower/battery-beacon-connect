# Deployment & Operations Guide

## Overview

This guide covers the deployment, configuration, and operational aspects of the Battery Beacon Connect application, including environment setup, database migrations, monitoring, and maintenance procedures.

## Prerequisites

Before deployment, ensure you have:

1. **Supabase Project**
   - Project ID: `mloblwqwsefhossgwvzt`
   - Project URL: `https://mloblwqwsefhossgwvzt.supabase.co`
   - Anon Key (public)
   - Service Role Key (private - for admin operations)

2. **Development Tools**
   - Node.js (v18+ recommended)
   - npm or yarn
   - Git
   - Code editor (VS Code recommended)

3. **Access Credentials**
   - Supabase dashboard access
   - GitHub repository access (if using version control)
   - Domain registrar access (for custom domains)

## Environment Configuration

### Local Development

1. **Clone Repository**
```bash
git clone <repository-url>
cd battery-beacon-connect
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Variables**
Create `.env` file in project root:
```env
VITE_SUPABASE_URL=https://mloblwqwsefhossgwvzt.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Start Development Server**
```bash
npm run dev
```

Application will be available at `http://localhost:5173`

### Production Configuration

1. **Build Optimization**
```bash
npm run build
```

This creates optimized production files in `dist/` directory.

2. **Preview Production Build**
```bash
npm run preview
```

3. **Environment Variables for Production**
- Set through hosting platform (Vercel, Netlify, etc.)
- Never commit `.env` files to repository
- Use platform-specific environment variable management

## Supabase Project Setup

### 1. Database Configuration

#### Run Initial Migrations

All database schema and security policies are managed through SQL migrations in `supabase/migrations/` directory.

**Via Supabase Dashboard:**
1. Go to SQL Editor
2. Copy migration SQL from migration files
3. Execute in order (timestamp-based filenames)

**Via Supabase CLI:**
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref mloblwqwsefhossgwvzt

# Run migrations
supabase db push
```

#### Verify Database Setup

Execute this query to verify tables:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- users
- batteries
- customers
- emis
- monthly_rents
- transactions
- customer_credits
- payment_ledger

### 2. Row Level Security (RLS)

Verify RLS is enabled on all tables:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

### 3. Database Functions

Verify critical functions exist:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION';
```

Expected functions:
- is_admin(uuid)
- is_partner(uuid)
- get_partner_id(uuid)
- authenticate_user(text, text)
- create_user(...)
- get_partners_with_counts()
- generate_monthly_rent_charges()
- update_overdue_status()
- calculate_customer_balance(uuid)
- get_customer_ledger_with_balance(uuid)

### 4. Storage Buckets

Create storage buckets for document uploads:

```sql
-- Customer documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-documents', 'customer-documents', true);

-- Partner documents bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-documents', 'partner-documents', true);
```

**Storage Policies:**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('customer-documents', 'partner-documents'));

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id IN ('customer-documents', 'partner-documents'));
```

### 5. Edge Functions (If Used)

Deploy edge functions from `supabase/functions/`:

```bash
# Deploy specific function
supabase functions deploy monthly-rent-scheduler

supabase functions deploy overdue-payment-processor

# Set function secrets
supabase secrets set SOME_SECRET=value
```

## Automated Jobs Configuration

### Monthly Rent Scheduler

**Function**: Generates monthly rent charges for all active customers.

**Schedule**: Runs on 1st of every month at 00:01 UTC

**Setup via pg_cron:**
```sql
SELECT cron.schedule(
  'generate-monthly-rents',
  '1 0 1 * *',  -- At 00:01 on day 1 of every month
  $$SELECT generate_monthly_rent_charges()$$
);
```

**Manual Execution (for testing):**
```sql
SELECT generate_monthly_rent_charges();
```

### Overdue Payment Processor

**Function**: Updates payment status to 'overdue' for past-due payments.

**Schedule**: Runs daily at 00:30 UTC

**Setup via pg_cron:**
```sql
SELECT cron.schedule(
  'update-overdue-payments',
  '30 0 * * *',  -- At 00:30 every day
  $$SELECT update_overdue_status()$$
);
```

**Manual Execution (for testing):**
```sql
SELECT update_overdue_status();
```

**Verify Cron Jobs:**
```sql
SELECT * FROM cron.job;
```

## Database Backup & Recovery

### Automated Backups

Supabase provides automatic daily backups:
- Access via Dashboard > Settings > Backup
- Point-in-time recovery available (Pro plan)
- Download backups for local storage

### Manual Backup

**Via Supabase CLI:**
```bash
supabase db dump -f backup.sql
```

**Via pg_dump (if direct access):**
```bash
pg_dump -h db.mloblwqwsefhossgwvzt.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql
```

### Recovery Procedure

**From SQL Dump:**
```bash
psql -h db.mloblwqwsefhossgwvzt.supabase.co \
  -U postgres \
  -d postgres \
  -f backup.sql
```

**Point-in-Time Recovery (Pro plan):**
1. Go to Dashboard > Settings > Backup
2. Select recovery point
3. Initiate recovery

## Monitoring & Logging

### Application Monitoring

**Frontend Errors:**
- Monitor browser console
- Implement error boundary
- Use error tracking service (Sentry, LogRocket)

**Network Requests:**
- Use browser DevTools Network tab
- Monitor Supabase request logs
- Track API response times

### Database Monitoring

**Via Supabase Dashboard:**
- Database > Reports
- Monitor query performance
- Check connection pool
- Review slow queries

**Query Monitoring:**
```sql
-- Active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity
WHERE state = 'active';

-- Table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname,
  idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Edge Function Logs

**View in Dashboard:**
- Functions > [Function Name] > Logs

**Via CLI:**
```bash
supabase functions logs monthly-rent-scheduler --tail
```

### Cron Job Logs

```sql
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
```

## Performance Optimization

### Database Optimization

**1. Index Management**
```sql
-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1;

-- Create indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_customers_partner_id 
ON customers(partner_id) WHERE partner_id IS NOT NULL;
```

**2. Query Optimization**
```sql
-- Analyze query performance
EXPLAIN ANALYZE
SELECT * FROM customers WHERE partner_id = 'uuid';

-- Update table statistics
ANALYZE customers;
VACUUM ANALYZE customers;
```

**3. Connection Pooling**
- Configure in Supabase project settings
- Set appropriate pool size (default: 15)
- Monitor connection usage

### Frontend Optimization

**1. Code Splitting**
```typescript
// Lazy load routes
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
```

**2. React Query Caching**
```typescript
// Configure stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

**3. Image Optimization**
- Use WebP format
- Implement lazy loading
- Compress images before upload

**4. Bundle Size**
```bash
# Analyze bundle
npm run build
npm run preview
```

## Security Best Practices

### 1. Environment Variables

**Never commit:**
- `.env` files
- API keys
- Database credentials
- Service role keys

**Use:**
- Environment-specific variables
- Platform secret management
- Encrypted secrets for CI/CD

### 2. Database Security

**RLS Policies:**
- Review regularly
- Test with different user roles
- Audit policy effectiveness

**Function Security:**
```sql
-- Always use SECURITY DEFINER with SET search_path
CREATE FUNCTION my_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Function body
$$;
```

### 3. API Security

**Rate Limiting:**
- Configure in Supabase project settings
- Set appropriate limits per endpoint
- Monitor abuse patterns

**CORS Configuration:**
- Whitelist specific domains
- Avoid using `*` in production

### 4. Authentication

**Password Policies:**
- Minimum length: 8 characters
- Require complexity
- Enable leaked password protection

**Session Management:**
- Set appropriate timeout
- Implement refresh token rotation
- Clear sessions on logout

## Troubleshooting

### Common Issues

**1. RLS Blocking Queries**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'customers';

-- Test as specific user
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid';
SELECT * FROM customers;
RESET ROLE;
```

**2. Slow Queries**
```sql
-- Enable query logging
ALTER DATABASE postgres SET log_min_duration_statement = 1000; -- 1 second

-- Review slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

**3. Connection Issues**
- Check connection pool settings
- Verify network connectivity
- Review firewall rules
- Check database status

**4. Migration Failures**
- Review migration logs
- Check for syntax errors
- Verify table/column existence
- Rollback if necessary

### Debug Mode

**Enable verbose logging:**
```typescript
// In development
if (import.meta.env.DEV) {
  console.log('Supabase client initialized:', supabase);
}
```

**Network debugging:**
```typescript
// Add interceptor
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch:', args);
  const response = await originalFetch(...args);
  console.log('Response:', response);
  return response;
};
```

## Deployment Checklist

### Pre-Deployment

- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Environment variables configured
- [ ] Storage buckets created
- [ ] Edge functions deployed
- [ ] Cron jobs scheduled
- [ ] Backup strategy configured
- [ ] Monitoring enabled
- [ ] Security review completed
- [ ] Performance testing done

### Deployment

- [ ] Build production bundle
- [ ] Deploy to hosting platform
- [ ] Verify environment variables
- [ ] Test critical user flows
- [ ] Monitor error logs
- [ ] Verify automated jobs
- [ ] Test payment processing
- [ ] Check mobile responsiveness

### Post-Deployment

- [ ] Monitor application health
- [ ] Review error logs
- [ ] Check database performance
- [ ] Verify backup completion
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Schedule post-deployment review

## Maintenance Procedures

### Daily

- Review error logs
- Check automated job execution
- Monitor active users
- Verify backup completion

### Weekly

- Review slow queries
- Check database size
- Update dependencies
- Review security alerts

### Monthly

- Analyze user metrics
- Review and optimize queries
- Update documentation
- Security audit
- Backup verification

### Quarterly

- Major dependency updates
- Performance optimization review
- Feature usage analysis
- Infrastructure cost review
- Disaster recovery drill

## Scaling Considerations

### Database Scaling

**Vertical Scaling:**
- Upgrade database instance size
- Increase connection pool
- Add more storage

**Horizontal Scaling:**
- Implement read replicas (Pro plan)
- Use connection pooler
- Cache frequently accessed data

### Application Scaling

**Frontend:**
- CDN for static assets
- Edge caching
- Progressive Web App (PWA)

**Backend:**
- Edge function auto-scaling (automatic)
- Database connection pooling
- Caching layer (Redis/Memcached)

## Support & Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [TailwindCSS Docs](https://tailwindcss.com)

### Community
- Supabase Discord
- GitHub Issues
- Stack Overflow

### Emergency Contacts
- Database Admin: [contact]
- DevOps Team: [contact]
- Security Team: [contact]
- On-call rotation: [schedule]
