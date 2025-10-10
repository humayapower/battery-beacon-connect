# Database Schema Reference

## Tables Overview

### users
Stores admin and partner accounts

### batteries
Battery inventory with assignment tracking

### customers
Customer profiles and payment information

### transactions
Payment transaction records

### emis
EMI schedule and payment tracking

### monthly_rents
Monthly rent charges and payments

### customer_credits
Customer credit balance tracking

## RLS Policies
All tables have Row Level Security enabled with role-based access:
- Admin: Full access
- Partner: Own data only

## Database Functions
- is_admin(user_id) - Check admin role
- is_partner(user_id) - Check partner role
- get_partner_id(user_id) - Get partner ID
- authenticate_user() - Login verification
- generate_monthly_rent_charges() - Automated rent generation
- update_overdue_status() - Automated overdue marking

## Triggers
- update_battery_status - Auto-update battery status
- update_customer_battery_relationship - Sync battery-customer links
- generate_emi_schedule - Auto-create EMI records
- generate_emi_records_after_insert - EMI generation on customer creation
