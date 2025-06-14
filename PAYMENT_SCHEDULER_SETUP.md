# 🚀 Automated Payment Scheduler Setup Guide

This guide will help you set up the automated rental payment scheduling system that:
- ✅ **Generates monthly rent charges** on the 1st of every month with due date on 5th
- ✅ **Marks payments as overdue** after the due date has passed
- ✅ **Provides comprehensive payment analytics** and monitoring

## 📋 Prerequisites

1. **Supabase Project** with your database setup
2. **GitHub Repository** for automated scheduling (if using GitHub Actions)
3. **Admin Access** to the application

## 🛠️ Setup Steps

### Step 1: Deploy Database Functions

Run the migration file to create the necessary database functions:

```sql
-- Run this in your Supabase SQL editor
-- File: supabase/migrations/20250615_create_payment_scheduler.sql
```

This creates:
- `generate_monthly_rent_charges()` - Monthly rent generation
- `update_overdue_status()` - Overdue payment processing  
- `get_monthly_payment_summary()` - Payment analytics

### Step 2: Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Deploy Edge Functions
supabase functions deploy monthly-rent-scheduler
supabase functions deploy overdue-payment-processor
```

### Step 3: Set Environment Variables

In your Supabase project dashboard, go to **Settings > Environment Variables** and set:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Configure Automation (Choose One)

#### Option A: GitHub Actions (Recommended)

1. In your GitHub repository, go to **Settings > Secrets and Variables > Actions**

2. Add these repository secrets:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. The workflow file is already included: `.github/workflows/payment-scheduler.yml`

4. Enable GitHub Actions in your repository settings

#### Option B: External Cron Service

Use services like **cron-job.org** or **Uptime Robot**:

**Monthly Rent Generation:**
- URL: `https://your-project-id.supabase.co/functions/v1/monthly-rent-scheduler`
- Method: POST
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
- Schedule: 1st of every month at 9:00 AM

**Overdue Processing:**
- URL: `https://your-project-id.supabase.co/functions/v1/overdue-payment-processor`  
- Method: POST
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
- Schedule: Daily at 10:00 AM

#### Option C: Server Crontab

If you have a server, add to crontab:

```bash
# Monthly rent generation (1st of month at 9 AM)
0 9 1 * * curl -X POST -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" https://your-project-id.supabase.co/functions/v1/monthly-rent-scheduler

# Daily overdue processing (10 AM daily)  
0 10 * * * curl -X POST -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" https://your-project-id.supabase.co/functions/v1/overdue-payment-processor
```

## 🎛️ Admin Dashboard Usage

### Access the Payment Scheduler

1. Login as an admin user
2. Navigate to **Admin Dashboard**
3. Click on **"Scheduler"** in the sidebar menu

### Features Available

**📊 Payment Summary Dashboard:**
- Current month payment statistics
- Active rental customers count
- Overdue payment alerts

**🚀 Manual Execution:**
- Generate monthly rents manually
- Update overdue status manually
- Test Edge Functions

**📈 Real-time Monitoring:**
- View last execution results
- Monitor processing statistics
- Track affected customers

## 🔧 Testing the System

### Manual Testing

1. Go to **Admin Dashboard > Scheduler**
2. Click **"Run Monthly Generation"** to test rent generation
3. Click **"Update Overdue Status"** to test overdue processing
4. Check the results in the dashboard

### Automated Testing

1. Go to your GitHub repository
2. Navigate to **Actions > Automated Payment Scheduler**
3. Click **"Run workflow"** and select function to test

## 📅 How It Works

### Monthly Rent Generation (1st of Month)

1. **System checks** if it's the 1st day of the month
2. **Finds all active rental customers** (`payment_type = 'monthly_rent'`)
3. **Creates rent records** for the current month
4. **Sets due date** to the 5th of the month
5. **Updates customer records** with next due date

### Overdue Processing (Daily)

1. **Identifies rental payments** past due date (after 5th)
2. **Identifies EMI payments** past grace period (5+ days overdue)
3. **Updates payment status** to 'overdue'
4. **Prepares notification data** for follow-up actions

## 🔍 Monitoring & Troubleshooting

### Check Function Logs

In Supabase Dashboard:
1. Go to **Edge Functions**
2. Click on function name
3. View **Logs** tab for execution details

### Verify Database Changes

```sql
-- Check recent rent generation
SELECT * FROM monthly_rents 
WHERE created_at >= CURRENT_DATE 
ORDER BY created_at DESC;

-- Check overdue payments
SELECT * FROM monthly_rents 
WHERE payment_status = 'overdue'
ORDER BY due_date DESC;
```

### Common Issues

**❌ Edge Function Not Found**
- Ensure functions are deployed: `supabase functions deploy`
- Check function names match exactly

**❌ Authentication Error**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check key has proper permissions

**❌ No Rents Generated**
- Verify customers have `payment_type = 'monthly_rent'`
- Check customers have `status = 'active'`
- Ensure `monthly_rent` amount is set

## 🚀 Next Steps

### Enhance the System

1. **Add SMS/Email Notifications** for overdue payments
2. **Implement WhatsApp Integration** for payment reminders
3. **Create Payment Links** for easy online payments
4. **Add Late Fee Calculations** for overdue amounts
5. **Build Customer Portal** for self-service payments

### Analytics & Reporting

1. **Payment Trend Analysis** over time
2. **Customer Payment Behavior** insights
3. **Partner Performance** metrics
4. **Revenue Forecasting** based on schedules

## 📞 Support

If you encounter issues:

1. **Check the logs** in Supabase Dashboard
2. **Test functions manually** using the admin interface
3. **Verify database records** using SQL queries
4. **Review automation setup** (GitHub Actions/Cron)

The system is designed to be robust and self-healing, with comprehensive error handling and detailed logging for troubleshooting.

---

**🎉 Congratulations!** Your automated rental payment scheduling system is now ready to handle monthly rent generation and overdue processing automatically!