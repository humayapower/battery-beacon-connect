# Development Workflow & Best Practices

## 🎯 Overview

This guide outlines the complete development workflow for Battery Beacon Connect, including setup, coding standards, testing procedures, and deployment processes.

## 🚀 Getting Started

### Prerequisites

**Required Software**:
- Node.js 18+ or Bun runtime
- Git
- VS Code (recommended) or any modern code editor
- Supabase CLI (optional but recommended)

**Required Accounts**:
- Supabase account with project access
- GitHub account (for version control)
- Lovable platform account (for deployment)

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/your-org/battery-beacon-connect.git
cd battery-beacon-connect

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
# or
bun dev
```

### Environment Variables

```env
# .env file
VITE_SUPABASE_URL=https://mloblwqwsefhossgwvzt.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# For edge functions (not used in frontend)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ Security Note**: Never commit `.env` files to version control!

## 📁 Project Structure Understanding

```
battery-beacon-connect/
├── docs/                       # Documentation
├── public/                     # Static assets
├── src/
│   ├── components/            # React components
│   │   ├── features/         # Feature-specific components
│   │   ├── layout/           # Layout components
│   │   ├── modals/           # Modal dialogs
│   │   ├── providers/        # Context providers
│   │   ├── shared/           # Shared components
│   │   └── ui/               # Base UI components
│   ├── contexts/             # React contexts
│   ├── hooks/                # Custom hooks
│   ├── integrations/         # External integrations
│   ├── lib/                  # Utility libraries
│   ├── pages/                # Page components
│   ├── services/             # Business logic services
│   ├── styles/               # CSS files
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── supabase/
│   ├── functions/            # Edge functions
│   └── migrations/           # Database migrations
└── ... configuration files
```

## 💻 Development Standards

### Code Style & Formatting

#### TypeScript Best Practices

```typescript
// ✅ GOOD: Use proper types
interface Customer {
  id: string;
  name: string;
  phone: string;
  paymentType: 'emi' | 'monthly_rent' | 'one_time_purchase';
}

const addCustomer = async (customer: Customer): Promise<void> => {
  // Implementation
};

// ❌ BAD: Using 'any'
const addCustomer = async (customer: any) => {
  // Implementation
};

// ✅ GOOD: Use enums for constants
enum PaymentStatus {
  DUE = 'due',
  PAID = 'paid',
  OVERDUE = 'overdue',
  PARTIAL = 'partial'
}

// ❌ BAD: Magic strings
const status = 'due';
```

#### Component Structure

```typescript
// ✅ GOOD: Well-structured component
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCustomers } from '@/hooks/useCustomers';

interface CustomerTableProps {
  partnerId?: string;
  onCustomerClick?: (customerId: string) => void;
}

export const CustomerTable = ({ partnerId, onCustomerClick }: CustomerTableProps) => {
  // 1. Hooks
  const { customers, loading, error } = useCustomers(partnerId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 2. Effects
  useEffect(() => {
    // Side effects here
  }, []);

  // 3. Event handlers
  const handleCustomerClick = (id: string) => {
    setSelectedId(id);
    onCustomerClick?.(id);
  };

  // 4. Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!customers.length) return <EmptyState />;

  // 5. Render
  return (
    <div className="space-y-4">
      {/* Component JSX */}
    </div>
  );
};
```

#### Naming Conventions

```typescript
// Components: PascalCase
export const CustomerProfile = () => {};

// Hooks: camelCase with 'use' prefix
export const useCustomerData = () => {};

// Utilities: camelCase
export const formatCurrency = (amount: number) => {};

// Constants: UPPER_SNAKE_CASE
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Types/Interfaces: PascalCase
export interface CustomerData {}
export type PaymentType = 'emi' | 'monthly_rent';

// Files: kebab-case
// customer-table.tsx
// use-customer-data.ts
// format-currency.ts
```

### Git Workflow

#### Branch Strategy

```bash
main                    # Production-ready code
  └── development      # Integration branch
        └── feature/customer-payment-history
        └── fix/battery-status-update
        └── hotfix/security-patch
```

#### Commit Message Convention

```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     # New feature
fix:      # Bug fix
docs:     # Documentation changes
style:    # Code style changes (formatting, no logic change)
refactor: # Code refactoring
test:     # Adding or updating tests
chore:    # Maintenance tasks

# Examples:
feat(customer): add payment history modal
fix(battery): correct status update trigger
docs(api): update authentication documentation
refactor(hooks): optimize useCustomers performance
```

#### Git Commands

```bash
# Create feature branch
git checkout -b feature/payment-reminder-system

# Stage changes
git add src/components/features/billing/

# Commit with proper message
git commit -m "feat(billing): add payment reminder system"

# Push to remote
git push origin feature/payment-reminder-system

# Create pull request on GitHub
# After review and approval, merge to development
```

### Component Development

#### Creating New Components

```bash
# 1. Determine component category
# - Feature: feature-specific functionality
# - UI: reusable base components
# - Shared: cross-feature shared components
# - Modal: dialog components

# 2. Create component file
touch src/components/features/billing/PaymentHistoryTable.tsx

# 3. Create associated hook (if needed)
touch src/hooks/usePaymentHistory.ts

# 4. Create types (if complex)
touch src/types/payment-history.ts
```

#### Component Template

```typescript
// src/components/features/billing/PaymentHistoryTable.tsx
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Transaction } from '@/types';

interface PaymentHistoryTableProps {
  customerId: string;
  limit?: number;
}

export const PaymentHistoryTable = ({ 
  customerId, 
  limit = 10 
}: PaymentHistoryTableProps) => {
  const { transactions, loading, error } = usePaymentHistory(customerId, limit);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-destructive p-4">Error: {error.message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>Last {limit} transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                <TableCell>{transaction.transaction_type}</TableCell>
                <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                <TableCell>{transaction.payment_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
```

### Custom Hooks Development

#### Hook Template

```typescript
// src/hooks/usePaymentHistory.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Transaction } from '@/types';

export const usePaymentHistory = (customerId: string, limit: number = 10) => {
  return useQuery({
    queryKey: ['payment-history', customerId, limit],
    queryFn: async (): Promise<Transaction[]> => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('customer_id', customerId)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Usage in component
const { data: transactions, isLoading, error } = usePaymentHistory('customer-id');
```

### Database Development

#### Creating Migrations

```sql
-- supabase/migrations/20240110_add_payment_reminders.sql

-- Create payment_reminders table
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Partners can view own reminders"
ON public.payment_reminders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.customers
    WHERE customers.id = payment_reminders.customer_id
    AND (customers.partner_id = auth.uid() OR is_admin(auth.uid()))
  )
);

-- Create index for performance
CREATE INDEX idx_payment_reminders_customer_id 
ON public.payment_reminders(customer_id);

CREATE INDEX idx_payment_reminders_reminder_date 
ON public.payment_reminders(reminder_date);

-- Add comments
COMMENT ON TABLE public.payment_reminders IS 'Stores scheduled payment reminders for customers';
```

#### Testing Migrations Locally

```bash
# Using Supabase CLI
supabase migration new add_payment_reminders
supabase db reset  # Reset local database
supabase migration up  # Apply migrations

# Verify migration
supabase db inspect
```

### Edge Functions Development

#### Creating Edge Functions

```bash
# Create new edge function
mkdir -p supabase/functions/send-payment-reminder
touch supabase/functions/send-payment-reminder/index.ts
```

```typescript
// supabase/functions/send-payment-reminder/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending reminders
    const { data: reminders, error } = await supabase
      .from('payment_reminders')
      .select('*, customers(name, phone)')
      .eq('status', 'pending')
      .lte('reminder_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    // Send reminders (implement your SMS/email logic)
    const results = await Promise.all(
      reminders.map(async (reminder) => {
        // Send reminder logic here
        console.log(`Sending reminder to ${reminder.customers.phone}`);
        
        // Update status
        await supabase
          .from('payment_reminders')
          .update({ status: 'sent' })
          .eq('id', reminder.id);
          
        return { id: reminder.id, status: 'sent' };
      })
    );

    return new Response(
      JSON.stringify({ success: true, sent: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
```

#### Testing Edge Functions Locally

```bash
# Serve function locally
supabase functions serve send-payment-reminder

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-payment-reminder \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 🧪 Testing Guidelines

### Unit Testing

```typescript
// src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '../formatters';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1000)).toBe('₹1,000.00');
    expect(formatCurrency(1234.56)).toBe('₹1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('₹0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-₹500.00');
  });
});
```

### Integration Testing

```typescript
// src/hooks/__tests__/useCustomers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCustomers } from '../useCustomers';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useCustomers', () => {
  it('fetches customers successfully', async () => {
    const { result } = renderHook(() => useCustomers(), {
      wrapper: createWrapper()
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### Manual Testing Checklist

```markdown
## Feature Testing Checklist

### Customer Management
- [ ] Create new customer with all payment types
- [ ] Upload documents (all formats)
- [ ] Assign battery to customer
- [ ] Edit customer details
- [ ] Delete customer (verify cascade)
- [ ] Search and filter customers
- [ ] View customer profile
- [ ] Test with different user roles

### Payment Processing
- [ ] Record EMI payment (full)
- [ ] Record EMI payment (partial)
- [ ] Record monthly rent payment
- [ ] Apply customer credit
- [ ] Generate credit on overpayment
- [ ] Test payment distribution logic
- [ ] Verify transaction history
- [ ] Check payment status updates

### Battery Management
- [ ] Add new battery
- [ ] Assign battery to partner
- [ ] Assign battery to customer
- [ ] Update battery status
- [ ] Track maintenance dates
- [ ] Filter batteries by status
- [ ] Search batteries

### Security Testing
- [ ] Test RLS policies (admin vs partner)
- [ ] Verify data isolation
- [ ] Test file upload permissions
- [ ] Check authentication flow
- [ ] Test session timeout
- [ ] Verify authorization on all routes
```

## 🐛 Debugging

### Browser DevTools

```typescript
// Add debugging breakpoints
debugger;

// Console logging
console.log('Customer data:', customer);
console.table(transactions);
console.error('Error:', error);

// React DevTools
// Use React DevTools extension to inspect component state
```

### Supabase Logs

```bash
# View edge function logs
supabase functions logs send-payment-reminder

# View database logs
supabase db inspect

# Real-time logs
supabase functions logs --follow
```

### Common Issues & Solutions

```typescript
// Issue: RLS blocking query
// Solution: Check user authentication and policies
const { data, error } = await supabase.from('customers').select('*');
console.log('Auth user:', (await supabase.auth.getUser()).data.user);
console.log('Error:', error);

// Issue: React Query not refetching
// Solution: Invalidate queries
import { useQueryClient } from '@tanstack/react-query';
const queryClient = useQueryClient();
queryClient.invalidateQueries(['customers']);

// Issue: Component not re-rendering
// Solution: Check dependencies in useEffect/useMemo
useEffect(() => {
  fetchData();
}, [customerId]); // Add dependencies
```

## 📦 Build & Deployment

### Local Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build -- --analyze
```

### Pre-deployment Checklist

```markdown
- [ ] All tests passing
- [ ] No console errors in browser
- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Security scan passed
- [ ] Performance audit completed
- [ ] Documentation updated
- [ ] Changelog updated
```

### Deployment Process

```bash
# 1. Ensure on correct branch
git checkout main

# 2. Pull latest changes
git pull origin main

# 3. Build locally to verify
npm run build

# 4. Commit and push
git add .
git commit -m "chore: prepare for deployment"
git push origin main

# 5. Deploy via Lovable platform
# Click "Publish" button in Lovable interface
```

## 📊 Performance Optimization

### Code Splitting

```typescript
// Lazy load pages
import { lazy, Suspense } from 'react';

const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));

// Use in router
<Route path="/reports" element={
  <Suspense fallback={<LoadingSpinner />}>
    <Reports />
  </Suspense>
} />
```

### React Query Optimization

```typescript
// Prefetch data
const queryClient = useQueryClient();
queryClient.prefetchQuery(['customers'], fetchCustomers);

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateCustomer,
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['customers', customerId]);
    const previousData = queryClient.getQueryData(['customers', customerId]);
    queryClient.setQueryData(['customers', customerId], newData);
    return { previousData };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(['customers', customerId], context.previousData);
  },
});
```

### Database Query Optimization

```typescript
// ❌ N+1 query problem
const customers = await supabase.from('customers').select('*');
for (const customer of customers) {
  const { data: battery } = await supabase
    .from('batteries')
    .select('*')
    .eq('id', customer.battery_id)
    .single();
}

// ✅ Use joins
const { data: customers } = await supabase
  .from('customers')
  .select('*, batteries(*)')
  .order('created_at', { ascending: false });
```

## 🎓 Learning Resources

### Documentation
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

### Project-Specific Docs
- See `docs/` folder for comprehensive guides
- Review existing components for patterns
- Check API documentation for database schema

---

**Last Updated**: 2024-01-10
**Maintained by**: Development Team