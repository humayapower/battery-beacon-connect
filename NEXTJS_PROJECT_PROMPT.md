# Complete Battery Rental Management System - Next.js Implementation Prompt

## Project Overview
Create a comprehensive battery rental management system using Next.js, TypeScript, Tailwind CSS, and Supabase. This is a multi-tenant SaaS platform for managing battery rentals with role-based access control, automated billing, and document management.

## Core Requirements

### 1. Technology Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Supabase (Database, Authentication, Storage, Edge Functions)
- **UI Components**: Shadcn/ui components
- **State Management**: React Query/TanStack Query
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

### 2. Database Schema Design

#### Core Tables:
```sql
-- Users table for authentication and roles
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'partner')),
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partners management (subset of users with role 'partner')
-- Batteries inventory management
CREATE TABLE batteries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  model_name TEXT,
  capacity TEXT NOT NULL,
  voltage NUMERIC,
  imei_number TEXT,
  sim_number TEXT,
  manufacturing_date DATE,
  warranty_period INTEGER,
  warranty_expiry DATE,
  purchase_date DATE,
  last_maintenance DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance')),
  partner_id UUID REFERENCES users(id),
  customer_id UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customers with flexible payment options
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id TEXT, -- Custom ID for tracking
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  partner_id UUID REFERENCES users(id),
  battery_id UUID REFERENCES batteries(id),
  payment_type TEXT NOT NULL CHECK (payment_type IN ('emi', 'monthly_rent', 'full_payment')),
  
  -- EMI specific fields
  total_amount NUMERIC,
  down_payment NUMERIC,
  emi_count INTEGER,
  emi_amount NUMERIC,
  emi_start_date DATE,
  next_due_date DATE,
  
  -- Monthly rent specific
  security_deposit NUMERIC,
  monthly_rent NUMERIC,
  
  -- Purchase specific
  purchase_amount NUMERIC,
  
  -- Common fields
  join_date DATE DEFAULT CURRENT_DATE,
  last_payment_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  
  -- Document storage
  customer_photo_url TEXT,
  id_type TEXT,
  aadhaar_front_url TEXT,
  aadhaar_back_url TEXT,
  pan_card_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- EMI tracking for installment payments
CREATE TABLE emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  emi_number INTEGER NOT NULL,
  total_emi_count INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'due' CHECK (payment_status IN ('due', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Monthly rent tracking
CREATE TABLE monthly_rents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  rent_month DATE NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'due' CHECK (payment_status IN ('due', 'partial', 'paid', 'overdue')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transaction history for all payments
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) NOT NULL,
  partner_id UUID REFERENCES users(id),
  battery_id UUID REFERENCES batteries(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('emi_payment', 'rent_payment', 'full_payment', 'deposit', 'refund')),
  amount NUMERIC NOT NULL,
  payment_status TEXT DEFAULT 'partial' CHECK (payment_status IN ('partial', 'completed', 'failed')),
  transaction_date TIMESTAMPTZ DEFAULT now(),
  due_date DATE,
  emi_id UUID REFERENCES emis(id),
  monthly_rent_id UUID REFERENCES monthly_rents(id),
  credit_used NUMERIC DEFAULT 0,
  credit_added NUMERIC DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Customer credit management
CREATE TABLE customer_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) UNIQUE NOT NULL,
  credit_balance NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3. Authentication & Authorization

#### Custom Authentication System:
- Username/password based authentication (not email-based)
- Role-based access control (Admin, Partner)
- Session management with localStorage
- Password hashing with SHA-256 or bcrypt
- Automatic session persistence

#### Key Features:
- Admin can manage everything (partners, batteries, customers, billing)
- Partners can only manage their assigned batteries and customers
- Secure authentication functions in Supabase
- Protected routes based on user roles

### 4. Core Features Implementation

#### A. Dashboard Views
**Admin Dashboard:**
- Overview metrics (total batteries, partners, customers, revenue)
- Recent transactions
- Overdue payments alerts
- Partner performance statistics
- Quick action buttons

**Partner Dashboard:**
- Personal metrics (assigned batteries, customers, earnings)
- Customer payment status
- Battery availability
- Due payment notifications

#### B. Battery Management
- Complete CRUD operations
- Serial number tracking with uniqueness
- Status management (Available, Assigned, Maintenance)
- Partner assignment functionality
- Warranty and maintenance tracking
- Advanced filtering and search

#### C. Customer Management
- Customer registration with document upload
- Flexible payment type selection (EMI, Monthly Rent, Full Payment)
- Battery assignment workflow
- Payment history tracking
- Document management (Aadhaar, PAN, Photos)
- Customer profile management

#### D. Billing & Payment System
**EMI Management:**
- Automatic EMI schedule generation
- Partial payment support
- Overdue tracking and penalties
- Payment history with credit adjustments

**Monthly Rent Management:**
- Recurring rent generation
- Security deposit handling
- Late payment tracking

**Transaction System:**
- Complete payment history
- Credit system for overpayments
- Multiple payment methods support
- Receipt generation

#### E. File Upload & Document Management
- Supabase Storage integration
- Document categories (customer photos, ID proofs)
- File type validation
- Secure file access with RLS policies
- Image optimization and compression

### 5. Automated Systems

#### A. Payment Scheduler (Edge Functions)
```typescript
// Monthly rent auto-generation
// Overdue payment processing
// EMI due date notifications
// Automated status updates
```

#### B. Database Functions
- EMI schedule generation triggers
- Payment status updates
- Battery status automation
- Customer-battery relationship management

### 6. UI/UX Requirements

#### A. Design System
- Custom Tailwind configuration with semantic tokens
- HSL color system for theme consistency
- Responsive design for all screen sizes
- Dark/light mode support
- Professional color palette with gradients

#### B. Component Library
- Reusable UI components based on Shadcn/ui
- Custom variants for different states
- Consistent spacing and typography
- Loading states and error handling
- Toast notifications for user feedback

#### C. Data Tables
- Advanced filtering and sorting
- Pagination with customizable page sizes
- Search functionality
- Export capabilities
- Responsive card views for mobile

### 7. Technical Implementation

#### A. App Structure (Next.js App Router)
```
app/
├── (auth)/
│   └── login/
├── (dashboard)/
│   ├── admin/
│   │   ├── partners/
│   │   ├── batteries/
│   │   ├── customers/
│   │   └── billing/
│   └── partner/
│       ├── batteries/
│       ├── customers/
│       └── billing/
├── api/
└── globals.css
```

#### B. State Management
- React Query for server state
- Context API for authentication
- Local state with useState/useReducer
- Form state with React Hook Form

#### C. Data Fetching
- Server-side rendering where appropriate
- Client-side data fetching with React Query
- Optimistic updates for better UX
- Error boundaries for graceful error handling

### 8. Advanced Features

#### A. Reporting System
- Revenue analytics
- Partner performance reports
- Customer payment trends
- Overdue payment reports
- Exportable reports (PDF/Excel)

#### B. Notification System
- Payment due reminders
- Overdue payment alerts
- Battery maintenance notifications
- System announcements

#### C. Search & Filtering
- Global search across all entities
- Advanced filters with multiple criteria
- Saved filter presets
- Real-time search results

### 9. Security Requirements

#### A. Row Level Security (RLS)
- Partner isolation (partners see only their data)
- Admin full access
- Secure file access
- API endpoint protection

#### B. Data Validation
- Input sanitization
- File upload restrictions
- SQL injection prevention
- XSS protection

### 10. Performance Optimizations

#### A. Database
- Proper indexing on frequently queried columns
- Optimized queries with joins
- Pagination for large datasets
- Database connection pooling

#### B. Frontend
- Image optimization
- Code splitting
- Lazy loading
- Caching strategies
- Bundle size optimization

### 11. Deployment & DevOps

#### A. Environment Setup
- Development, staging, production environments
- Environment variable management
- Database migrations
- CI/CD pipeline setup

#### B. Monitoring
- Error tracking
- Performance monitoring
- User analytics
- Database query monitoring

## Implementation Priority

### Phase 1: Core Infrastructure
1. Next.js setup with TypeScript and Tailwind
2. Supabase integration and database schema
3. Authentication system
4. Basic routing and layout

### Phase 2: User Management
1. User registration and login
2. Role-based access control
3. Partner management (Admin only)
4. User profile management

### Phase 3: Inventory Management
1. Battery CRUD operations
2. Battery status management
3. Assignment workflows
4. Search and filtering

### Phase 4: Customer Management
1. Customer registration
2. Document upload functionality
3. Payment type selection
4. Customer-battery assignment

### Phase 5: Billing System
1. EMI calculation and scheduling
2. Monthly rent management
3. Payment processing
4. Transaction history

### Phase 6: Advanced Features
1. Automated payment scheduling
2. Reporting and analytics
3. Notification system
4. Advanced search and filtering

### Phase 7: Optimization & Polish
1. Performance optimization
2. Security audit
3. UI/UX improvements
4. Testing and bug fixes

## Deliverables Expected

1. **Complete Next.js Application** with all features
2. **Supabase Database** with proper schema and RLS policies
3. **Edge Functions** for automated processes
4. **Comprehensive Documentation** 
5. **Deployment Guide**
6. **User Manual** for different roles
7. **API Documentation**
8. **Security Implementation Report**

## Success Criteria

- Seamless role-based access control
- Automated billing and payment tracking
- Responsive design across all devices
- Sub-2 second page load times
- 99.9% uptime capability
- Secure document management
- Comprehensive reporting capabilities
- Intuitive user experience for non-technical users

This system should handle hundreds of partners, thousands of batteries, and tens of thousands of customers with optimal performance and security.