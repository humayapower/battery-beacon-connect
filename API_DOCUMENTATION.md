# 📚 API Documentation & Database Guide

## 🎯 Overview

Battery Beacon Connect uses Supabase as its Backend-as-a-Service (BaaS) platform, providing a PostgreSQL database with real-time capabilities, authentication, and storage. This document details the database schema, API endpoints, and backend services.

## 🏗 Database Architecture

### **Database Type**: PostgreSQL with Row Level Security (RLS)
### **Connection**: Supabase Client with auto-generated types
### **Security Model**: Role-based access with RLS policies

## 📊 Database Schema

### 🔸 Core Tables

#### **1. Users Table**
Stores admin and partner user accounts.

```sql
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    address TEXT,
    role TEXT NOT NULL DEFAULT 'partner',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: Full name of the user
- `phone`: Contact phone number
- `username`: Unique login username
- `password_hash`: SHA-256 hashed password
- `address`: Physical address (optional)
- `role`: User role ('admin' or 'partner')
- `created_at`: Account creation timestamp
- `updated_at`: Last modification timestamp

**Usage:**
- Authentication and authorization
- User profile management
- Role-based access control

#### **2. Batteries Table**
Tracks battery inventory and assignments.

```sql
CREATE TABLE public.batteries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    serial_number TEXT NOT NULL UNIQUE,
    model TEXT NOT NULL,
    model_name TEXT,
    capacity TEXT NOT NULL,
    voltage NUMERIC,
    manufacturing_date DATE,
    warranty_period INTEGER,
    warranty_expiry DATE,
    purchase_date DATE,
    last_maintenance DATE,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'available',
    partner_id UUID REFERENCES public.users(id),
    customer_id UUID REFERENCES public.customers(id),
    imei_number TEXT,
    sim_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Status Values:**
- `available`: Ready for assignment
- `assigned`: Currently with a customer
- `maintenance`: Under repair/service
- `faulty`: Needs repair
- `returned`: Returned by customer

**Relationships:**
- `partner_id` → `users.id` (Which partner manages this battery)
- `customer_id` → `customers.id` (Which customer has this battery)

#### **3. Customers Table**
Comprehensive customer information and payment details.

```sql
CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id TEXT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT,
    payment_type TEXT NOT NULL,
    monthly_amount NUMERIC,
    partner_id UUID REFERENCES public.users(id),
    battery_id UUID REFERENCES public.batteries(id),
    join_date DATE DEFAULT CURRENT_DATE,
    last_payment_date DATE,
    status TEXT NOT NULL DEFAULT 'active',
    
    -- Document storage
    customer_photo_url TEXT,
    id_type TEXT,
    aadhaar_front_url TEXT,
    aadhaar_back_url TEXT,
    pan_card_url TEXT,
    
    -- Payment specifics
    total_amount NUMERIC,
    down_payment NUMERIC,
    emi_count INTEGER,
    emi_amount NUMERIC,
    emi_start_date DATE,
    next_due_date DATE,
    security_deposit NUMERIC,
    monthly_rent NUMERIC,
    purchase_amount NUMERIC,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Payment Types:**
- `emi`: Installment-based payments
- `monthly_rent`: Monthly rental charges
- `one_time_purchase`: Full upfront payment

**Document Types:**
- Customer photo
- Aadhaar card (front/back)
- PAN card

#### **4. Transactions Table**
All payment records and financial transactions.

```sql
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    partner_id UUID REFERENCES public.users(id),
    battery_id UUID REFERENCES public.batteries(id),
    transaction_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'partial',
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date DATE,
    
    -- Payment allocation
    emi_id UUID REFERENCES public.emis(id),
    monthly_rent_id UUID REFERENCES public.monthly_rents(id),
    credit_used NUMERIC DEFAULT 0,
    credit_added NUMERIC DEFAULT 0,
    
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Transaction Types:**
- `emi`: EMI payment
- `rent`: Monthly rent payment
- `purchase`: One-time purchase
- `maintenance`: Maintenance fee
- `deposit`: Security deposit

**Payment Status:**
- `paid`: Fully paid
- `partial`: Partially paid
- `due`: Payment due
- `overdue`: Past due date

#### **5. EMIs Table**
EMI schedule and payment tracking.

```sql
CREATE TABLE public.emis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    emi_number INTEGER NOT NULL,
    total_emi_count INTEGER NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'due',
    paid_amount NUMERIC DEFAULT 0,
    remaining_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **6. Monthly Rents Table**
Monthly rental charge tracking.

```sql
CREATE TABLE public.monthly_rents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id),
    rent_month DATE NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'due',
    paid_amount NUMERIC DEFAULT 0,
    remaining_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **7. Customer Credits Table**
Customer credit balance tracking.

```sql
CREATE TABLE public.customer_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL UNIQUE REFERENCES public.customers(id),
    credit_balance NUMERIC DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔧 Database Functions

### **1. Authentication Function**
```sql
CREATE OR REPLACE FUNCTION public.authenticate_user(
    p_username TEXT, 
    p_password_hash TEXT
)
RETURNS TABLE(id UUID, name TEXT, phone TEXT, username TEXT, address TEXT, role TEXT)
```

**Purpose**: Secure user authentication
**Parameters**: Username and hashed password
**Returns**: User details if authentication successful

### **2. Partner Statistics Function**
```sql
CREATE OR REPLACE FUNCTION public.get_partners_with_counts()
RETURNS TABLE(
    id UUID, 
    name TEXT, 
    phone TEXT, 
    username TEXT, 
    address TEXT, 
    created_at TIMESTAMP WITH TIME ZONE, 
    updated_at TIMESTAMP WITH TIME ZONE, 
    battery_count BIGINT, 
    customer_count BIGINT
)
```

**Purpose**: Get partner data with associated counts
**Returns**: Partner details with battery and customer counts

### **3. Monthly Rent Generation**
```sql
CREATE OR REPLACE FUNCTION public.generate_monthly_rent_charges()
RETURNS VOID
```

**Purpose**: Automatically generate monthly rent charges
**Schedule**: Runs on 1st of every month
**Logic**: Creates rent records for all active rental customers

### **4. Overdue Status Update**
```sql
CREATE OR REPLACE FUNCTION public.update_overdue_status()
RETURNS VOID
```

**Purpose**: Update payment status to 'overdue'
**Schedule**: Runs daily
**Logic**: Marks payments as overdue after due date

### **5. EMI Generation Trigger**
```sql
CREATE OR REPLACE FUNCTION public.generate_emi_records_after_insert()
RETURNS TRIGGER
```

**Purpose**: Auto-generate EMI schedule when customer added
**Trigger**: After INSERT on customers table
**Logic**: Creates EMI entries based on customer payment type

## 🔐 Row Level Security (RLS) Policies

### **Battery Policies**
```sql
-- Allow all operations on batteries (for demo purposes)
CREATE POLICY "Allow all operations on batteries" 
ON public.batteries 
FOR ALL 
USING (true);
```

### **Transaction Policies**
```sql
-- Allow all operations on transactions (for demo purposes)
CREATE POLICY "Allow all operations on transactions" 
ON public.transactions 
FOR ALL 
USING (true);
```

### **Customer Policies**
```sql
-- Allow all operations on customers (for demo purposes)
CREATE POLICY "Allow all operations on customers" 
ON public.customers 
FOR ALL 
USING (true);
```

> **Note**: Current policies are permissive for demo purposes. In production, implement role-based policies.

## 🔄 API Integration Layer

### **Supabase Client Configuration**
```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mloblwqwsefhossgwvzt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "[anon_key]";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
```

### **Custom Hooks for API Operations**

#### **Battery Operations** (`useBatteries.ts`)
```typescript
// Get all batteries
const { data: batteries } = await supabase
  .from('batteries')
  .select('*, partner:users(name)')
  .order('created_at', { ascending: false });

// Add new battery
const { data, error } = await supabase
  .from('batteries')
  .insert([batteryData]);

// Update battery status
const { error } = await supabase
  .from('batteries')
  .update({ status: 'assigned', customer_id: customerId })
  .eq('id', batteryId);
```

#### **Customer Operations** (`useCustomers.ts`)
```typescript
// Get customers with relationships
const { data } = await supabase
  .from('customers')
  .select(`
    *,
    batteries(serial_number, model),
    users(name)
  `)
  .order('created_at', { ascending: false });

// Add new customer
const { data, error } = await supabase
  .from('customers')
  .insert([customerData]);
```

#### **Transaction Operations** (`useTransactions.ts`)
```typescript
// Get transactions with customer details
const { data } = await supabase
  .from('transactions')
  .select(`
    *,
    customers(name, phone)
  `)
  .order('transaction_date', { ascending: false });

// Record payment
const { error } = await supabase
  .from('transactions')
  .insert([transactionData]);
```

## 🗂 File Storage

### **Storage Buckets**

#### **Customer Documents Bucket**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('customer-documents', 'customer-documents', true);

-- Storage policies (permissive for demo)
CREATE POLICY "Allow all access to customer documents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'customer-documents');
```

#### **Partner Documents Bucket**
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('partner-documents', 'partner-documents', true);
```

### **File Upload Implementation**
```typescript
// src/components/shared/FileUpload.tsx
const uploadFile = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('customer-documents')
    .upload(fileName, file);
    
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('customer-documents')
    .getPublicUrl(fileName);
    
  return urlData.publicUrl;
};
```

## ⚡ Edge Functions (Serverless)

### **1. Monthly Rent Scheduler**
**Path**: `supabase/functions/monthly-rent-scheduler/index.ts`

```typescript
// Automated monthly rent generation
Deno.serve(async (req) => {
  try {
    const { data, error } = await supabase
      .rpc('generate_monthly_rent_charges');
      
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, message: 'Monthly rents generated' }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Schedule**: 1st of every month at 9:00 AM
**Purpose**: Generate monthly rent charges for all active rental customers

### **2. Overdue Payment Processor**
**Path**: `supabase/functions/overdue-payment-processor/index.ts`

```typescript
// Daily overdue payment processing
Deno.serve(async (req) => {
  try {
    const { data, error } = await supabase
      .rpc('update_overdue_status');
      
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true, message: 'Overdue status updated' }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

**Schedule**: Daily at 10:00 AM
**Purpose**: Mark payments as overdue after due date

## 🚀 Automated Scheduling

### **GitHub Actions Workflow**
**File**: `.github/workflows/payment-scheduler.yml`

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

## 🔍 Real-time Features

### **Database Subscriptions**
```typescript
// Real-time battery updates
useEffect(() => {
  const channel = supabase
    .channel('batteries-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'batteries' },
      (payload) => {
        // Handle real-time updates
        fetchBatteries();
      }
    )
    .subscribe();
    
  return () => supabase.removeChannel(channel);
}, []);
```

### **Live Data Updates**
- Battery status changes reflect immediately
- Payment records update in real-time
- Customer assignments sync across users
- Overdue status updates automatically

## 📊 Performance Optimizations

### **Database Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_batteries_partner_id ON batteries(partner_id);
CREATE INDEX idx_batteries_customer_id ON batteries(customer_id);
CREATE INDEX idx_customers_partner_id ON customers(partner_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_emis_customer_id ON emis(customer_id);
CREATE INDEX idx_monthly_rents_customer_id ON monthly_rents(customer_id);
```

### **Query Optimization**
- Selective field fetching with `select()`
- Relationship loading with joins
- Pagination for large datasets
- Caching with React Query

### **Data Caching Strategy**
```typescript
// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

## 🔒 Security Implementation

### **Password Security**
```typescript
// Secure password hashing
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
```

### **Input Sanitization**
- All form inputs validated with Zod schemas
- SQL injection prevention through parameterized queries
- XSS prevention with proper escaping

### **Database Security**
- Row Level Security (RLS) enabled
- Role-based access policies
- Secure connection with SSL/TLS

## 📈 Monitoring & Analytics

### **Database Monitoring**
- Query performance tracking
- Connection pool monitoring
- Error rate tracking
- Real-time usage metrics

### **Application Analytics**
- User session tracking
- Feature usage analytics
- Performance monitoring
- Error reporting

---

This comprehensive API documentation provides a complete understanding of the backend architecture, enabling developers to effectively work with the Battery Beacon Connect system.