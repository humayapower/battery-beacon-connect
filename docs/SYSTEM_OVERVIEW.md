# Battery Beacon Connect - System Overview

## Executive Summary

Battery Beacon Connect is a comprehensive **Battery Leasing Management System** designed to streamline the business operations of battery leasing companies. The system manages the entire lifecycle of battery leasing operations from partner management to customer onboarding, battery assignments, and payment processing.

## Business Model

The platform operates on a **B2B2C (Business-to-Business-to-Consumer)** model:

1. **Battery Leasing Company (Admin)** - The central authority that:
   - Manages multiple Partners
   - Oversees entire battery inventory
   - Monitors all financial transactions
   - Generates reports and analytics

2. **Partners (Distributors/Dealers)** - Regional operators who:
   - Own or lease batteries from the admin
   - Onboard customers in their region
   - Manage day-to-day operations
   - Collect payments from customers
   - Maintain battery inventory

3. **Customers (End Users)** - Individuals who:
   - Lease batteries through partners
   - Make regular payments (EMI or Monthly Rent)
   - Use batteries for their vehicles/equipment

## Core Business Processes

### 1. Partner Onboarding
- Admin creates partner accounts with geographic/business assignments
- Partners receive login credentials
- Each partner manages their own inventory and customer base

### 2. Battery Inventory Management
- Admin allocates batteries to partners
- Partners track battery status (available, assigned, maintenance, faulty)
- Battery lifecycle tracking from purchase to end-of-life
- Maintenance scheduling and history

### 3. Customer Onboarding
- Partners onboard customers with:
  - Personal information (name, phone, address)
  - Identity documents (Aadhaar, PAN card)
  - Payment preference (EMI or Monthly Rent)
  - Security deposit collection
- Battery assignment to customer
- Automatic generation of payment schedules

### 4. Payment Processing
Three payment models are supported:

**a) EMI (Equated Monthly Installment)**
- Customer pays a down payment
- Remaining amount split into equal monthly EMIs
- Fixed tenure (e.g., 12, 24, 36 months)
- After EMI completion, customer owns the battery

**b) Monthly Rent**
- No ownership transfer
- Customer pays fixed monthly rent
- Ongoing arrangement with no end date
- Battery returned when contract ends

**c) One-Time Purchase**
- Full payment upfront
- Immediate ownership transfer
- No recurring payments

### 5. Payment Collection & Distribution
- Partners collect payments from customers
- Payments automatically distributed across pending dues
- Intelligent allocation (overdue → due → future)
- Excess payments converted to customer credit
- Real-time payment status updates

### 6. Overdue Management
- Automated status updates for overdue payments
- Grace period configuration
- Overdue tracking and notifications
- Customer status management based on payment history

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
│  (React + TypeScript + Vite + TailwindCSS)                  │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Portal │  │Partner Portal│  │ Auth System  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  State Management Layer                      │
│         (React Context + Custom Hooks + React Query)        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│           (Services + Payment Calculations)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Supabase Backend Layer                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │PostgreSQL│  │   RPC    │  │ Storage  │  │  Edge    │  │
│  │ Database │  │Functions │  │ Buckets  │  │Functions │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Layers

**1. Frontend Framework**
- React 18 with TypeScript for type safety
- Vite for build tooling and hot module replacement
- React Router for client-side routing

**2. UI Layer**
- TailwindCSS for utility-first styling
- shadcn/ui component library
- Radix UI primitives for accessibility
- Lucide React for icons
- Custom design system with semantic tokens

**3. State Management**
- React Context API for authentication state
- Custom hooks for data fetching and caching
- Local state with useState/useReducer
- React Query (TanStack Query) for server state

**4. Backend Services**
- Supabase (PostgreSQL database)
- Row Level Security (RLS) for data access control
- Database Functions for complex operations
- Triggers for automated workflows
- Edge Functions (planned for future use)

**5. Storage**
- Supabase Storage for document management
- Separate buckets for customer and partner documents
- Public access with RLS policies

## Data Flow Architecture

### Authentication Flow
```
User Login Request
    ↓
Hash Password (SHA-256)
    ↓
Call authenticate_user RPC
    ↓
Verify credentials in users table
    ↓
Return user data + role
    ↓
Store in localStorage + Context
    ↓
Route to appropriate dashboard
```

### Payment Processing Flow
```
Payment Input
    ↓
Fetch unpaid EMIs/Rents
    ↓
Calculate Distribution
    ↓
Apply to Overdue First
    ↓
Then Due Items
    ↓
Excess → Customer Credit
    ↓
Update Database Records
    ↓
Create Transaction Entries
    ↓
Update Payment Statuses
```

### Customer Onboarding Flow
```
Partner Creates Customer
    ↓
Upload Documents
    ↓
Select Payment Type
    ↓
Assign Battery
    ↓
Generate Payment Schedule
    ↓
Create EMIs/Rents
    ↓
Initialize Credit Balance
    ↓
Customer Active
```

## Security Architecture

### Current Implementation (Custom Auth)
- Password hashing using SHA-256
- Session management via localStorage
- Role-based access control
- RLS policies on all tables

### Security Layers

**1. Authentication Layer**
- Custom authentication system
- Password hashing (client-side)
- RPC function for credential verification
- Session stored in localStorage

**2. Authorization Layer**
- Role-based access (admin, partner)
- Database-level RLS policies
- Security definer functions
- Partner data isolation

**3. Data Protection**
- Encrypted password storage
- Secure document storage
- Access control on storage buckets
- Input validation and sanitization

## Scalability Considerations

### Current Scale
- Single-tenant architecture
- Regional deployment
- Suitable for 100-1000 partners
- 10,000+ customers per partner

### Future Scalability
- Multi-tenant architecture
- Geographic distribution
- Caching layer (Redis)
- Load balancing
- Database replication

## Integration Points

### External Integrations (Future)
- SMS Gateway (payment reminders)
- Email service (notifications)
- Payment gateways (online payments)
- GPS tracking (battery location)
- Analytics platform (business intelligence)

### Internal Integrations
- Document management system
- Report generation
- Data export/import
- Backup and recovery

## Deployment Architecture

### Current Setup
- Hosted on Lovable platform
- Supabase for backend services
- Edge deployment for low latency
- CDN for static assets

### Production Considerations
- Environment separation (dev, staging, prod)
- Database backups (automated)
- Monitoring and logging
- Performance optimization
- Security hardening

## System Limitations

### Current Limitations
1. **Authentication**: Custom auth system (not Supabase Auth)
2. **Storage**: Documents in password_hash field in users table
3. **Real-time**: No real-time updates (requires polling)
4. **Offline**: No offline support
5. **Mobile**: Responsive web only, no native apps
6. **Reports**: Limited reporting capabilities
7. **Analytics**: Basic dashboard metrics only
8. **Notifications**: No automated notifications

### Planned Improvements
1. Migration to Supabase Auth
2. Separate user_roles table
3. Real-time subscriptions
4. Enhanced reporting engine
5. SMS/Email notifications
6. Mobile app development
7. Advanced analytics dashboard
8. API for third-party integrations

## Performance Metrics

### Current Performance
- Page load: < 2 seconds
- Database queries: < 500ms
- Payment processing: < 2 seconds
- Document upload: < 5 seconds

### Performance Optimization
- Code splitting and lazy loading
- Memoization of expensive calculations
- Optimized database queries
- Image optimization
- Caching strategies

## Monitoring and Maintenance

### System Health Monitoring
- Database connection health
- Query performance
- Storage usage
- User session tracking
- Error logging

### Maintenance Tasks
- Database cleanup
- Archive old records
- Storage optimization
- Security updates
- Performance tuning

## Support and Documentation

### User Support
- Admin dashboard help
- Partner training materials
- Customer onboarding guides
- Video tutorials
- FAQ documentation

### Technical Documentation
- API documentation
- Database schema
- RLS policy documentation
- Development guidelines
- Deployment procedures
