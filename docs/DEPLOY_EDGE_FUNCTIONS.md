# 🚀 Edge Functions Deployment Guide

This guide explains how to deploy the payment scheduler Edge Functions to Supabase.

## 📋 Prerequisites

1. **Supabase CLI** installed
2. **Supabase project** set up
3. **Admin access** to your Supabase project

## 🛠️ Deployment Steps

### Step 1: Install Supabase CLI

```bash
# Install via npm (recommended)
npm install -g supabase

# Or via Homebrew (macOS)
brew install supabase/tap/supabase

# Or via Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for authentication.

### Step 3: Link Your Project

```bash
# Replace with your actual project ID
supabase link --project-ref YOUR_PROJECT_ID
```

You can find your project ID in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

### Step 4: Deploy Edge Functions

```bash
# Deploy monthly rent scheduler
supabase functions deploy monthly-rent-scheduler

# Deploy overdue payment processor
supabase functions deploy overdue-payment-processor

# Or deploy all functions at once
supabase functions deploy
```

### Step 5: Set Environment Variables (If Needed)

If your functions need environment variables:

```bash
# Set secrets for Edge Functions
supabase secrets set SOME_SECRET=your_secret_value
```

## 🧪 Testing After Deployment

### Method 1: Admin Dashboard

1. Navigate to **Admin Dashboard > Scheduler**
2. The Edge Function buttons should now be enabled
3. Click **"Test Monthly Scheduler"** or **"Test Overdue Processor"**

### Method 2: Supabase CLI

```bash
# Test monthly scheduler
supabase functions invoke monthly-rent-scheduler

# Test overdue processor
supabase functions invoke overdue-payment-processor
```

### Method 3: Direct HTTP Request

```bash
# Replace with your project URL
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  "https://YOUR_PROJECT_ID.supabase.co/functions/v1/monthly-rent-scheduler"
```

## 📊 Monitoring Edge Functions

### View Logs

```bash
# View logs for a specific function
supabase functions logs monthly-rent-scheduler

# Follow logs in real-time
supabase functions logs monthly-rent-scheduler --follow
```

### Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions**
3. Click on a function to view logs and metrics

## 🔧 Troubleshooting

### Common Issues

**❌ "Failed to deploy" Error**
```bash
# Check if you're logged in
supabase projects list

# Re-link your project
supabase link --project-ref YOUR_PROJECT_ID
```

**❌ "Permission denied" Error**
- Ensure you have admin access to the Supabase project
- Check if you're logged in with the correct account

**❌ "Function not found" Error**
- Verify the function was deployed successfully
- Check function names match exactly

### Verify Deployment

```bash
# List deployed functions
supabase functions list

# Should show:
# - monthly-rent-scheduler
# - overdue-payment-processor
```

## 🔄 Updating Functions

When you make changes to the Edge Functions:

```bash
# Redeploy specific function
supabase functions deploy monthly-rent-scheduler

# Redeploy all functions
supabase functions deploy
```

## 🎯 Alternative Testing (Without Edge Functions)

If you prefer not to deploy Edge Functions yet, you can still test the system:

### Use Database Functions Directly

The admin dashboard provides buttons to test the core database functions:
- **"Run Monthly Generation"** - Tests `generate_monthly_rent_charges()`
- **"Update Overdue Status"** - Tests `update_overdue_status()`

These database functions contain the same logic as the Edge Functions.

### Manual Database Testing

```sql
-- Test monthly rent generation
SELECT * FROM generate_monthly_rent_charges();

-- Test overdue status updates
SELECT * FROM update_overdue_status();

-- Check payment summary
SELECT * FROM get_monthly_payment_summary();
```

## 🚀 Production Automation

Once Edge Functions are deployed, set up automation:

### GitHub Actions (Recommended)

The workflow file `.github/workflows/payment-scheduler.yml` is already configured. Just add these secrets to your GitHub repository:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### External Cron Services

- **cron-job.org** (Free)
- **Uptime Robot** (Free monitoring with webhooks)
- **Vercel Cron** (If using Vercel)

### Example Cron URLs

```
Monthly: https://YOUR_PROJECT_ID.supabase.co/functions/v1/monthly-rent-scheduler
Daily: https://YOUR_PROJECT_ID.supabase.co/functions/v1/overdue-payment-processor
```

## 📞 Support

If you encounter issues:

1. **Check Supabase CLI version**: `supabase --version`
2. **Verify project linking**: `supabase status`
3. **Check function logs**: `supabase functions logs FUNCTION_NAME`
4. **Test database functions first** using the admin dashboard

---

**Note:** The payment scheduler system works perfectly with just the database functions. Edge Functions are only needed for automated production scheduling via cron jobs.