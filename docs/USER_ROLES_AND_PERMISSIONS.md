# User Roles and Permissions

## Overview

Battery Beacon Connect implements a **hierarchical role-based access control (RBAC)** system with two primary user types: **Admin** and **Partner**. Each role has specific permissions and data access boundaries enforced through database-level Row Level Security (RLS) policies.

## User Hierarchy

```
┌─────────────────────────────────────────┐
│            ADMIN (Superuser)            │
│  • Full system access                   │
│  • Manages all partners                 │
│  • Views all data                       │
│  • System configuration                 │
└─────────────────────────────────────────┘
                  │
                  │ creates & manages
                  ▼
┌─────────────────────────────────────────┐
│           PARTNER (Distributor)         │
│  • Regional operations                  │
│  • Customer management                  │
│  • Payment collection                   │
│  • Limited data access                  │
└─────────────────────────────────────────┘
                  │
                  │ onboards & manages
                  ▼
┌─────────────────────────────────────────┐
│         CUSTOMER (End User)             │
│  • No system access                     │
│  • Managed by partners                  │
│  • Subject of transactions              │
└─────────────────────────────────────────┘
```

---

## 1. ADMIN ROLE

### Overview
Administrators have **unrestricted access** to the entire system. They are responsible for overall system management, partner administration, and business intelligence.

### Access Level: FULL SYSTEM ACCESS

### Capabilities

#### A. Partner Management
- **Create Partners**
  - Add new partner accounts
  - Set credentials (username, password)
  - Assign regional territories
  - Set partner status (active/inactive/suspended)

- **View Partners**
  - List all partners system-wide
  - View partner profiles and statistics
  - See battery counts per partner
  - See customer counts per partner
  - View partner performance metrics

- **Edit Partners**
  - Update partner information
  - Change partner credentials
  - Modify territories
  - Adjust access levels

- **Delete/Suspend Partners**
  - Deactivate partner accounts
  - Suspend operations temporarily
  - Delete partner records (with data cleanup)

#### B. Battery Inventory Management
- **View All Batteries**
  - System-wide battery inventory
  - Battery status across all partners
  - Maintenance history
  - Assignment history

- **Create Batteries**
  - Add new batteries to system
  - Assign to partners initially
  - Set battery specifications
  - Configure warranty information

- **Edit Batteries**
  - Update battery information
  - Change assignments
  - Modify status
  - Record maintenance activities

- **Delete Batteries**
  - Remove batteries from system
  - Archive battery records

- **Battery Analytics**
  - Total batteries in system
  - Available vs. assigned ratio
  - Batteries under maintenance
  - Partner-wise distribution

#### C. Customer Management
- **View All Customers**
  - System-wide customer database
  - Customer payment types
  - Customer status
  - Partner associations

- **Customer Analytics**
  - Total active customers
  - Payment type distribution
  - Overdue customers count
  - Regional customer distribution

- **Customer Operations**
  - View customer billing details
  - Access customer documents
  - View payment history
  - Track customer status changes

#### D. Financial Management
- **Payment Overview**
  - All transactions system-wide
  - Payment status tracking
  - Overdue payment monitoring
  - Revenue analytics

- **Transaction Management**
  - View all transactions
  - Filter by partner/customer
  - Export transaction data
  - Generate financial reports

- **Billing Operations**
  - Monitor EMI schedules
  - Track monthly rent payments
  - View payment distributions
  - Access customer credits

- **Financial Reports**
  - Monthly revenue reports
  - Partner-wise earnings
  - Payment collection rates
  - Overdue analysis

#### E. System Administration
- **Dashboard Access**
  - System-wide statistics
  - Real-time metrics
  - Overdue alerts
  - Recent activity logs

- **Reports & Analytics**
  - Generate custom reports
  - Export data
  - Business intelligence
  - Trend analysis

- **System Configuration**
  - Payment schedules setup
  - Due date configurations
  - Overdue grace periods
  - System settings

- **User Management**
  - View all users (admin + partners)
  - Create admin accounts
  - Manage user permissions
  - Reset credentials

### Dashboard Sections

1. **Overview Dashboard**
   - Total customers count
   - Total partners count
   - Total batteries count
   - Overdue customers count
   - Recent payments list
   - Recent customers list
   - Overdue payments alert

2. **Customers Section**
   - Customer table with full data
   - Add/Edit/Delete capabilities
   - Document management
   - Payment history access

3. **Partners Section**
   - Partner table with statistics
   - Create/Edit/Delete partners
   - View partner performance
   - Assign batteries to partners

4. **Batteries Section**
   - Complete battery inventory
   - Status-based filtering
   - Assignment management
   - Maintenance tracking

5. **Payments Section**
   - All transactions
   - Payment processing
   - Overdue management
   - Credit management

6. **Reports Section**
   - Financial reports
   - Partner performance
   - Customer analytics
   - System metrics

7. **Settings Section**
   - System configuration
   - User preferences
   - Payment settings
   - Notification setup

### Database Access (RLS Policies)

```sql
-- USERS TABLE
- Can view all users
- Can insert new users
- Can update any user
- Can delete users

-- BATTERIES TABLE  
- Can view all batteries
- Can insert batteries
- Can update any battery
- Can delete batteries

-- CUSTOMERS TABLE
- Can view all customers
- Can insert customers
- Can update any customer
- Can delete customers

-- TRANSACTIONS TABLE
- Can view all transactions
- Can insert transactions
- Can update any transaction
- Can delete transactions

-- EMIS TABLE
- Can view all EMI records
- Can insert EMIs
- Can update any EMI
- Can delete EMIs

-- MONTHLY_RENTS TABLE
- Can view all rent records
- Can insert rents
- Can update any rent
- Can delete rents

-- CUSTOMER_CREDITS TABLE
- Can view all credit records
- Can insert credits
- Can update any credit
- Can delete credits
```

### Security Functions Available to Admin

```sql
is_admin(user_id) → returns true for admin users
get_partner_id(user_id) → returns NULL for admin (has access to all)
```

---

## 2. PARTNER ROLE

### Overview
Partners are **regional operators** or **distributors** who manage their own subset of batteries and customers. They have restricted access limited to their own data.

### Access Level: SCOPED TO OWN DATA

### Capabilities

#### A. Own Profile Management
- **View Own Profile**
  - Personal information
  - Contact details
  - Business address

- **Update Own Information**
  - Change name, phone, address
  - Cannot change username
  - Cannot change role
  - Cannot change password (requires admin)

#### B. Battery Management (Own Batteries)
- **View Own Batteries**
  - Batteries assigned to this partner
  - Battery status (available/assigned/maintenance)
  - Battery specifications
  - Maintenance history

- **Add Batteries**
  - Register new batteries under own account
  - Set battery specifications
  - Configure initial status

- **Update Own Batteries**
  - Change battery status
  - Record maintenance activities
  - Update location
  - Modify specifications

- **Delete Own Batteries**
  - Remove batteries from inventory
  - Only unassigned batteries

- **Assign Batteries**
  - Assign available batteries to customers
  - Transfer batteries between customers
  - Return batteries from customers

#### C. Customer Management (Own Customers)
- **View Own Customers**
  - List of customers onboarded by this partner
  - Customer profiles and documents
  - Customer payment information
  - Customer status

- **Add Customers**
  - Onboard new customers
  - Upload customer documents
  - Select payment type
  - Assign batteries
  - Generate payment schedules

- **Update Own Customers**
  - Modify customer information
  - Change battery assignments
  - Update payment details
  - Change customer status

- **Delete Own Customers**
  - Remove customer records (if no outstanding payments)
  - Archive customer data

- **Customer Billing**
  - View customer billing details
  - Access EMI schedules
  - View monthly rent schedules
  - Check payment history
  - Monitor customer credits

#### D. Transaction Management (Own Transactions)
- **View Own Transactions**
  - All transactions related to own customers
  - Payment history
  - Payment status
  - Transaction details

- **Record Payments**
  - Process customer payments
  - Allocate payments to EMIs/rents
  - Handle excess payments
  - Add payment remarks

- **Update Transactions**
  - Modify transaction details
  - Update payment status
  - Add/edit remarks

- **Transaction Reports**
  - Filter transactions by date
  - Filter by payment type
  - Export transaction data

#### E. Payment Operations
- **Process EMI Payments**
  - Record EMI installments
  - Update EMI status
  - Handle partial payments
  - Mark EMIs as paid

- **Process Rent Payments**
  - Record monthly rent
  - Update rent status
  - Handle pro-rated rents
  - Process partial payments

- **Credit Management**
  - View customer credits
  - Apply credits to payments
  - Add credits from excess payments

- **Overdue Tracking**
  - View overdue customers
  - Overdue amount tracking
  - Payment reminder tracking

### Dashboard Sections

1. **Overview Dashboard**
   - Assigned batteries count
   - Active customers count
   - Monthly revenue
   - Battery status breakdown
   - Quick actions

2. **My Batteries Section**
   - Battery inventory table
   - Add/Edit batteries
   - Status management
   - Maintenance tracking

3. **Customers Section**
   - Customer list table
   - Add/Edit customers
   - Document uploads
   - Billing access

4. **Transactions Section**
   - Transaction history
   - Payment processing
   - Payment records
   - Export capabilities

### Database Access (RLS Policies)

```sql
-- USERS TABLE
- Can view own profile only
- Can update own profile (limited fields)
- Cannot insert users
- Cannot delete users

-- BATTERIES TABLE  
- Can view only batteries where partner_id = own ID
- Can insert batteries with partner_id = own ID
- Can update only own batteries
- Can delete only own batteries

-- CUSTOMERS TABLE
- Can view only customers where partner_id = own ID
- Can insert customers with partner_id = own ID
- Can update only own customers
- Can delete only own customers

-- TRANSACTIONS TABLE
- Can view only transactions where partner_id = own ID
- Can insert transactions with partner_id = own ID
- Can update only own transactions
- Can delete only own transactions

-- EMIS TABLE
- Can view EMIs for own customers only
- Can insert EMIs for own customers
- Can update EMIs for own customers
- Can delete EMIs for own customers

-- MONTHLY_RENTS TABLE
- Can view rents for own customers only
- Can insert rents for own customers
- Can update rents for own customers
- Can delete rents for own customers

-- CUSTOMER_CREDITS TABLE
- Can view credits for own customers only
- Can insert credits for own customers
- Can update credits for own customers
- Can delete credits for own customers
```

### Security Functions Available to Partner

```sql
is_partner(user_id) → returns true for partner users
get_partner_id(user_id) → returns own partner ID
```

### Restrictions

Partners **CANNOT**:
- View other partners' data
- Access other partners' customers
- See other partners' transactions
- View system-wide statistics
- Create or manage other partners
- Access admin settings
- Change system configurations
- View admin dashboard
- Access reports section
- Manage user accounts

---

## 3. CUSTOMER (No System Access)

### Overview
Customers are **end users** who lease batteries but do not have direct system access. They are managed entirely by their assigned partner.

### Access Level: NONE (No Login)

### Customer Data Stored

- **Personal Information**
  - Full name
  - Phone number
  - Address
  - Email (optional)

- **Identity Documents**
  - Customer photo
  - Aadhaar card (front & back)
  - PAN card
  - ID type selection

- **Payment Information**
  - Payment type (EMI/Monthly Rent/One-time Purchase)
  - Total amount
  - Down payment
  - EMI count and amount
  - Monthly rent amount
  - Security deposit
  - Join date
  - Last payment date
  - Next due date

- **Battery Assignment**
  - Assigned battery ID
  - Assignment date
  - Battery model and specs

- **Financial Records**
  - EMI schedule
  - Monthly rent records
  - Transaction history
  - Credit balance
  - Payment ledger

### Customer States

1. **Active**: Currently leasing a battery, payments on track
2. **Inactive**: No longer leasing, contract ended
3. **Suspended**: Account suspended due to non-payment

### Customer Management (by Partner)

Partners can perform all operations on behalf of customers:
- Make payments
- View billing details
- Update profile information
- Change battery assignments
- Check payment history
- Monitor credit balance

---

## Permission Matrix

| Feature | Admin | Partner | Customer |
|---------|-------|---------|----------|
| **Authentication** |
| Login to system | ✅ | ✅ | ❌ |
| View own profile | ✅ | ✅ | ❌ |
| Update own profile | ✅ | ⚠️ (limited) | ❌ |
| **Partner Management** |
| View all partners | ✅ | ❌ | ❌ |
| Create partners | ✅ | ❌ | ❌ |
| Edit partners | ✅ | ❌ | ❌ |
| Delete partners | ✅ | ❌ | ❌ |
| **Battery Management** |
| View all batteries | ✅ | ⚠️ (own only) | ❌ |
| Add batteries | ✅ | ⚠️ (own only) | ❌ |
| Edit batteries | ✅ | ⚠️ (own only) | ❌ |
| Delete batteries | ✅ | ⚠️ (own only) | ❌ |
| Assign batteries | ✅ | ⚠️ (own only) | ❌ |
| **Customer Management** |
| View all customers | ✅ | ⚠️ (own only) | ❌ |
| Add customers | ✅ | ⚠️ (own only) | ❌ |
| Edit customers | ✅ | ⚠️ (own only) | ❌ |
| Delete customers | ✅ | ⚠️ (own only) | ❌ |
| Upload documents | ✅ | ⚠️ (own only) | ❌ |
| **Transaction Management** |
| View all transactions | ✅ | ⚠️ (own only) | ❌ |
| Process payments | ✅ | ⚠️ (own only) | ❌ |
| Edit transactions | ✅ | ⚠️ (own only) | ❌ |
| Delete transactions | ✅ | ⚠️ (own only) | ❌ |
| **Billing Operations** |
| View EMI schedules | ✅ | ⚠️ (own customers) | ❌ |
| View rent schedules | ✅ | ⚠️ (own customers) | ❌ |
| Manage credits | ✅ | ⚠️ (own customers) | ❌ |
| **Reports & Analytics** |
| System-wide reports | ✅ | ❌ | ❌ |
| Own data reports | ✅ | ✅ | ❌ |
| Export data | ✅ | ⚠️ (own only) | ❌ |
| **System Settings** |
| Configure system | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ |
| Set payment rules | ✅ | ❌ | ❌ |

Legend:
- ✅ Full Access
- ⚠️ Restricted Access (scoped to own data)
- ❌ No Access

---

## Row Level Security (RLS) Implementation

### RLS Policy Structure

All tables use RLS policies with the following pattern:

```sql
-- Pattern for SELECT policies
CREATE POLICY "Role can view scope" 
ON table_name 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  (partner_id = get_partner_id(auth.uid()))
);

-- Pattern for INSERT policies
CREATE POLICY "Role can insert scope" 
ON table_name 
FOR INSERT 
WITH CHECK (
  is_admin(auth.uid()) OR 
  (partner_id = get_partner_id(auth.uid()))
);

-- Pattern for UPDATE policies
CREATE POLICY "Role can update scope" 
ON table_name 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  (partner_id = get_partner_id(auth.uid()))
);

-- Pattern for DELETE policies
CREATE POLICY "Role can delete scope" 
ON table_name 
FOR DELETE 
USING (
  is_admin(auth.uid()) OR 
  (partner_id = get_partner_id(auth.uid()))
);
```

### Security Helper Functions

```sql
-- Check if user is admin
CREATE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Check if user is partner
CREATE FUNCTION is_partner(user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id AND role = 'partner'
  );
$$;

-- Get partner ID for user
CREATE FUNCTION get_partner_id(user_id UUID)
RETURNS UUID
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN role = 'partner' THEN id
    ELSE NULL
  END
  FROM users
  WHERE id = user_id;
$$;
```

---

## Future Role Extensions

### Planned Additional Roles

1. **Manager Role**
   - Mid-level access between admin and partner
   - Regional oversight
   - Report generation
   - No system configuration access

2. **Accountant Role**
   - Read-only financial access
   - Report generation
   - Transaction verification
   - No data modification

3. **Support Role**
   - Customer support access
   - Read-only customer data
   - Transaction inquiry
   - No modification rights

4. **Customer Portal** (Future)
   - Self-service payment
   - View own billing
   - Download invoices
   - Payment history
