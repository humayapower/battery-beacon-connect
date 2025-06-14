# Automated Payment Scheduling Configuration

This document outlines the automated payment scheduling system for rental customers.

## Overview

The system automatically:
1. **Generates monthly rent charges** on the 1st of every month with due date on the 5th
2. **Marks payments as overdue** after the due date has passed
3. **Sends notifications** for overdue payments (when notification system is implemented)

## Database Functions

### 1. `generate_monthly_rent_charges()`
- **Purpose**: Creates monthly rent records for all active rental customers
- **Schedule**: 1st of every month
- **Due Date**: 5th of the month
- **Returns**: List of processed customers with rent details

### 2. `update_overdue_status()`
- **Purpose**: Updates payment status to 'overdue' for past-due payments
- **Schedule**: Daily (recommended)
- **Grace Period**: 
  - Rental payments: Overdue after 5th of month
  - EMI payments: Overdue 5 days after due date

### 3. `get_monthly_payment_summary()`
- **Purpose**: Provides comprehensive payment analytics
- **Usage**: Dashboard reporting and monitoring

## Edge Functions

### 1. Monthly Rent Scheduler (`/functions/monthly-rent-scheduler`)
- **Endpoint**: `https://[project-id].supabase.co/functions/v1/monthly-rent-scheduler`
- **Method**: POST
- **Authentication**: Service Role Key required
- **Schedule**: 1st of every month at 9:00 AM

### 2. Overdue Payment Processor (`/functions/overdue-payment-processor`)
- **Endpoint**: `https://[project-id].supabase.co/functions/v1/overdue-payment-processor`
- **Method**: POST
- **Authentication**: Service Role Key required
- **Schedule**: Daily at 10:00 AM

## Production Deployment

### Option 1: External Cron Service (Recommended)

Use services like:
- **Uptime Robot** (Free tier available)
- **cron-job.org** (Free)
- **GitHub Actions** (Free for public repos)
- **Vercel Cron** (Free tier)

#### Example GitHub Actions Workflow

Create `.github/workflows/payment-scheduler.yml`:

```yaml
name: Payment Scheduler

on:
  schedule:
    # Monthly rent generation: 9 AM on 1st of every month
    - cron: '0 9 1 * *'
    # Overdue status update: 10 AM daily
    - cron: '0 10 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  monthly-rent:
    if: github.event.schedule == '0 9 1 * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Generate Monthly Rents
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/monthly-rent-scheduler"

  overdue-processor:
    if: github.event.schedule == '0 10 * * *' || github.event_name == 'workflow_dispatch'
    runs-on: ubuntu-latest
    steps:
      - name: Update Overdue Status
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            "${{ secrets.SUPABASE_URL }}/functions/v1/overdue-payment-processor"
```

### Option 2: Supabase Cron Extension

If using Supabase Pro plan with pg_cron extension:

```sql
-- Schedule monthly rent generation (1st of every month at 9 AM)
SELECT cron.schedule(
  'monthly-rent-generation',
  '0 9 1 * *',
  $$SELECT generate_monthly_rent_charges();$$
);

-- Schedule overdue status updates (daily at 10 AM)
SELECT cron.schedule(
  'overdue-status-update',
  '0 10 * * *',
  $$SELECT update_overdue_status();$$
);
```

### Option 3: Server-Side Cron

If you have a server, add to crontab:

```bash
# Monthly rent generation
0 9 1 * * curl -X POST -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" https://your-project.supabase.co/functions/v1/monthly-rent-scheduler

# Daily overdue processing
0 10 * * * curl -X POST -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" https://your-project.supabase.co/functions/v1/overdue-payment-processor
```

## Manual Execution

For testing or manual execution, use the Payment Scheduler component in the admin dashboard:

1. Navigate to Admin Dashboard → Payment Scheduler
2. Use "Run Monthly Generation" button for rent generation
3. Use "Update Overdue Status" button for overdue processing
4. Monitor execution results and payment summaries

## Monitoring and Alerting

### Key Metrics to Monitor:
- Number of rent charges generated monthly
- Number of payments marked overdue
- Total overdue amounts
- Customer payment patterns

### Recommended Alerts:
- When overdue amounts exceed threshold
- When rent generation fails
- When unusual payment patterns detected

## Security Considerations

1. **Service Role Key**: Store securely as environment variable
2. **Edge Function Access**: Protect with proper authentication
3. **Database Permissions**: Functions use SECURITY DEFINER
4. **Audit Logging**: Monitor function execution logs

## Future Enhancements

1. **SMS/Email Notifications**: Send payment reminders
2. **WhatsApp Integration**: Automated payment notifications
3. **Auto-debit Integration**: UPI/Bank account auto-debit
4. **Payment Links**: Generate dynamic payment links
5. **Late Fees**: Automatic late fee calculation
6. **Grace Period Settings**: Configurable grace periods per customer

## Testing

Use the Payment Scheduler component to test functions manually before setting up automation.

## Support

For issues with the payment scheduling system:
1. Check Supabase function logs
2. Verify database function execution
3. Monitor payment status updates
4. Review customer payment histories