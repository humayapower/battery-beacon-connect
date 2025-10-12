# Code Patterns & Examples

This document provides practical code examples and patterns used throughout the Battery Beacon Connect project.

## Table of Contents
1. [Component Patterns](#component-patterns)
2. [Custom Hooks](#custom-hooks)
3. [Form Handling](#form-handling)
4. [Payment Processing](#payment-processing)
5. [Database Queries](#database-queries)
6. [RLS Policies](#rls-policies)
7. [Error Handling](#error-handling)
8. [Loading States](#loading-states)

---

## Component Patterns

### Basic Component Structure

```tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CustomerCardProps {
  customer: Customer;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onEdit,
  onDelete,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{customer.phone}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => onEdit(customer.id)}>Edit</Button>
          <Button variant="destructive" onClick={() => onDelete(customer.id)}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
```

### Modal Component Pattern

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerInput) => Promise<void>;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CustomerInput) => {
    setLoading(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm onSubmit={handleSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  );
};
```

### Table Component Pattern

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BatteryTableProps {
  batteries: Battery[];
  onEdit: (battery: Battery) => void;
  onDelete: (id: string) => void;
}

export const BatteryTable: React.FC<BatteryTableProps> = ({
  batteries,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial Number</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batteries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No batteries found
              </TableCell>
            </TableRow>
          ) : (
            batteries.map((battery) => (
              <TableRow key={battery.id}>
                <TableCell className="font-medium">{battery.serial_number}</TableCell>
                <TableCell>{battery.model}</TableCell>
                <TableCell>{battery.capacity}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(battery.status)}>
                    {battery.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(battery)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(battery.id)}
                        className="text-destructive"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

## Custom Hooks

### Data Fetching Hook with React Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useBatteries = (partnerId?: string) => {
  const queryClient = useQueryClient();

  // Fetch batteries
  const {
    data: batteries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['batteries', partnerId],
    queryFn: async () => {
      let query = supabase
        .from('batteries')
        .select('*')
        .order('created_at', { ascending: false });

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Battery[];
    },
    enabled: !!partnerId || partnerId === undefined, // Run for admin (no partnerId) or specific partner
  });

  // Create battery mutation
  const createBatteryMutation = useMutation({
    mutationFn: async (batteryData: BatteryInput) => {
      const { data, error } = await supabase
        .from('batteries')
        .insert(batteryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      toast.success('Battery created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create battery');
    },
  });

  // Update battery mutation
  const updateBatteryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Battery> }) => {
      const { data, error } = await supabase
        .from('batteries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      toast.success('Battery updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update battery');
    },
  });

  // Delete battery mutation
  const deleteBatteryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('batteries').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batteries'] });
      toast.success('Battery deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete battery');
    },
  });

  return {
    batteries: batteries || [],
    isLoading,
    error,
    createBattery: createBatteryMutation.mutate,
    updateBattery: updateBatteryMutation.mutate,
    deleteBattery: deleteBatteryMutation.mutate,
    isCreating: createBatteryMutation.isPending,
    isUpdating: updateBatteryMutation.isPending,
    isDeleting: deleteBatteryMutation.isPending,
  };
};
```

### Authentication Hook

```typescript
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// Usage in component
const MyComponent = () => {
  const { user, userRole, signIn, signOut } = useAuth();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <Button onClick={signOut}>Sign Out</Button>
    </div>
  );
};
```

---

## Form Handling

### Form with React Hook Form + Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define schema
const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  address: z.string().optional(),
  payment_type: z.enum(['emi', 'monthly_rent', 'purchase']),
  emi_amount: z.number().positive().optional(),
  emi_count: z.number().int().positive().max(60).optional(),
  monthly_rent: z.number().positive().optional(),
  purchase_amount: z.number().positive().optional(),
}).refine(
  (data) => {
    // Conditional validation based on payment type
    if (data.payment_type === 'emi') {
      return data.emi_amount && data.emi_count;
    }
    if (data.payment_type === 'monthly_rent') {
      return data.monthly_rent;
    }
    if (data.payment_type === 'purchase') {
      return data.purchase_amount;
    }
    return true;
  },
  {
    message: 'Required fields missing for selected payment type',
    path: ['payment_type'],
  }
);

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => Promise<void>;
  defaultValues?: Partial<CustomerFormData>;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  defaultValues,
}) => {
  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      payment_type: 'emi',
      ...defaultValues,
    },
  });

  const paymentType = form.watch('payment_type');

  const handleSubmit = async (values: CustomerFormData) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="10 digit number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="monthly_rent">Monthly Rent</SelectItem>
                  <SelectItem value="purchase">One-time Purchase</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Conditional fields based on payment type */}
        {paymentType === 'emi' && (
          <>
            <FormField
              control={form.control}
              name="emi_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>EMI Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter EMI amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emi_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of EMIs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter number of EMIs"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </Form>
  );
};
```

---

## Payment Processing

### Payment Distribution Algorithm

```typescript
import { EMI, MonthlyRent, PaymentStatus } from '@/types/billing';

export class PaymentCalculations {
  /**
   * Distributes payment amount across unpaid EMIs and rents
   */
  static distributePayment(
    paymentAmount: number,
    emis: EMI[],
    rents: MonthlyRent[],
    paymentType: 'emi' | 'rent' | 'auto'
  ): PaymentCalculationResult {
    let remainingAmount = paymentAmount;
    const emiPayments: EMIPayment[] = [];
    const rentPayments: RentPayment[] = [];

    // Priority order: overdue -> due -> partial
    const sortedEmis = this.sortByPriority(emis);
    const sortedRents = this.sortByPriority(rents);

    // Process based on payment type
    if (paymentType === 'emi' || paymentType === 'auto') {
      for (const emi of sortedEmis) {
        if (remainingAmount <= 0) break;

        const paymentForThis = Math.min(remainingAmount, emi.remaining_amount);
        const newPaidAmount = emi.paid_amount + paymentForThis;
        const newRemainingAmount = emi.remaining_amount - paymentForThis;
        const newStatus = this.calculatePaymentStatus(
          newRemainingAmount,
          emi.amount,
          emi.due_date
        );

        emiPayments.push({
          emiId: emi.id,
          emiNumber: emi.emi_number,
          amount: paymentForThis,
          previousPaidAmount: emi.paid_amount,
          newPaidAmount,
          newRemainingAmount,
          previousStatus: emi.payment_status,
          newStatus,
        });

        remainingAmount -= paymentForThis;
      }
    }

    if (paymentType === 'rent' || paymentType === 'auto') {
      for (const rent of sortedRents) {
        if (remainingAmount <= 0) break;

        const paymentForThis = Math.min(remainingAmount, rent.remaining_amount);
        const newPaidAmount = rent.paid_amount + paymentForThis;
        const newRemainingAmount = rent.remaining_amount - paymentForThis;
        const newStatus = this.calculatePaymentStatus(
          newRemainingAmount,
          rent.amount,
          rent.due_date
        );

        rentPayments.push({
          rentId: rent.id,
          rentMonth: rent.rent_month,
          amount: paymentForThis,
          previousPaidAmount: rent.paid_amount,
          newPaidAmount,
          newRemainingAmount,
          previousStatus: rent.payment_status,
          newStatus,
        });

        remainingAmount -= paymentForThis;
      }
    }

    return {
      emiPayments,
      rentPayments,
      excessAmount: remainingAmount,
      totalDistributed: paymentAmount - remainingAmount,
    };
  }

  /**
   * Sorts payments by priority: overdue -> due -> partial
   */
  private static sortByPriority<T extends { payment_status: PaymentStatus; due_date: string }>(
    items: T[]
  ): T[] {
    return [...items].sort((a, b) => {
      // Priority order
      const priorityOrder: Record<PaymentStatus, number> = {
        overdue: 1,
        due: 2,
        partial: 3,
        paid: 4,
      };

      const priorityDiff = priorityOrder[a.payment_status] - priorityOrder[b.payment_status];
      if (priorityDiff !== 0) return priorityDiff;

      // Within same priority, sort by due date (earliest first)
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  }

  /**
   * Calculates payment status based on remaining amount and due date
   */
  private static calculatePaymentStatus(
    remainingAmount: number,
    totalAmount: number,
    dueDate: string
  ): PaymentStatus {
    if (remainingAmount <= 0) {
      return 'paid';
    }

    const today = new Date();
    const due = new Date(dueDate);

    if (remainingAmount >= totalAmount) {
      return due < today ? 'overdue' : 'due';
    }

    // Partial payment
    return due < today ? 'overdue' : 'partial';
  }
}
```

### Processing Payment with BillingService

```typescript
// In component
const handlePayment = async () => {
  const paymentData = {
    customerId: customer.id,
    paymentAmount: form.getValues('amount'),
    paymentType: form.getValues('type'),
    paymentMode: form.getValues('mode'),
    remarks: form.getValues('remarks'),
    customPaymentDate: form.getValues('date'),
  };

  const result = await BillingService.processPayment(
    paymentData.customerId,
    paymentData.paymentAmount,
    paymentData.paymentType,
    paymentData.paymentMode,
    paymentData.remarks,
    paymentData.customPaymentDate
  );

  if (result.success) {
    toast.success('Payment processed successfully');
    // Invalidate relevant queries
    queryClient.invalidateQueries(['customer', customerId]);
    queryClient.invalidateQueries(['transactions']);
    queryClient.invalidateQueries(['emis']);
    queryClient.invalidateQueries(['rents']);
    onClose();
  } else {
    toast.error(result.error?.message || 'Payment processing failed');
  }
};
```

---

## Database Queries

### Basic CRUD Operations

```typescript
// Create
const createCustomer = async (customerData: CustomerInput) => {
  const { data, error } = await supabase
    .from('customers')
    .insert(customerData)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Read
const getCustomer = async (customerId: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error) throw error;
  return data;
};

// Update
const updateCustomer = async (customerId: string, updates: Partial<Customer>) => {
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete
const deleteCustomer = async (customerId: string) => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (error) throw error;
};
```

### Complex Queries with Joins

```typescript
// Fetch customer with related data
const getCustomerWithDetails = async (customerId: string) => {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      battery:batteries(*),
      partner:users!customers_partner_id_fkey(*),
      emis:emis(*),
      monthly_rents:monthly_rents(*),
      customer_credits:customer_credits(*)
    `)
    .eq('id', customerId)
    .single();

  if (error) throw error;
  return data;
};

// Get all customers with pending payments
const getCustomersWithOverdue = async (partnerId?: string) => {
  let query = supabase
    .from('customers')
    .select(`
      *,
      emis!inner(*)
    `)
    .eq('emis.payment_status', 'overdue');

  if (partnerId) {
    query = query.eq('partner_id', partnerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
};
```

### Using RPC Functions

```typescript
// Authenticate user
const authenticateUser = async (username: string, passwordHash: string) => {
  const { data, error } = await supabase.rpc('authenticate_user', {
    p_username: username,
    p_password_hash: passwordHash,
  });

  if (error) throw error;
  return data;
};

// Get partners with counts
const getPartnersWithCounts = async () => {
  const { data, error } = await supabase.rpc('get_partners_with_counts');

  if (error) throw error;
  return data;
};

// Generate monthly rent charges
const generateMonthlyRentCharges = async () => {
  const { data, error } = await supabase.rpc('generate_monthly_rent_charges');

  if (error) throw error;
  return data;
};
```

---

## RLS Policies

### Policy Examples with Explanation

```sql
-- Policy: Partners can view only their own customers
-- This ensures data isolation between partners
CREATE POLICY "Partners can view own customers"
ON customers FOR SELECT
USING (
  partner_id = get_partner_id(auth.uid())  -- Matches partner's ID
  OR is_admin(auth.uid())                   -- OR user is admin
);

-- Policy: Partners can insert customers with their own ID
-- Prevents partners from creating customers for other partners
CREATE POLICY "Partners can insert own customers"
ON customers FOR INSERT
WITH CHECK (
  partner_id = get_partner_id(auth.uid())
  OR is_admin(auth.uid())
);

-- Policy: Partners can update only their own customers
-- Combination of USING and WITH CHECK for update operations
CREATE POLICY "Partners can update own customers"
ON customers FOR UPDATE
USING (
  partner_id = get_partner_id(auth.uid())  -- Can only update if they own it
  OR is_admin(auth.uid())
)
WITH CHECK (
  partner_id = get_partner_id(auth.uid())  -- Updated data must still belong to them
  OR is_admin(auth.uid())
);
```

### Security Definer Functions

```sql
-- Function to check if user is admin
-- SECURITY DEFINER bypasses RLS for this function
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Function to get partner ID
CREATE OR REPLACE FUNCTION public.get_partner_id(user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN role = 'partner' THEN id
    ELSE NULL
  END
  FROM public.users
  WHERE id = user_id;
$$;
```

---

## Error Handling

### Try-Catch Pattern

```typescript
const createCustomerWithErrorHandling = async (customerData: CustomerInput) => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert(customerData)
      .select()
      .single();

    if (error) {
      // Handle Supabase error
      console.error('Supabase error:', error);
      
      // Customize error message based on error code
      if (error.code === '23505') {
        throw new Error('Customer with this phone number already exists');
      }
      
      if (error.code === '23503') {
        throw new Error('Invalid battery or partner reference');
      }
      
      throw new Error(error.message);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Type guard for Error objects
    const message = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return { 
      success: false, 
      error: { message } 
    };
  }
};
```

### Error Boundary Component

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              <p className="mb-4">{this.state.error?.message}</p>
              <Button onClick={this.handleReset}>Try again</Button>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Loading States

### Skeleton Loading Pattern

```tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const CustomerCardSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

// Usage in component
const CustomerList = () => {
  const { customers, isLoading } = useCustomers();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CustomerCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {customers.map((customer) => (
        <CustomerCard key={customer.id} customer={customer} />
      ))}
    </div>
  );
};
```

### Loading Spinner with Suspense

```tsx
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MainContent />
    </Suspense>
  );
};
```

---

These code patterns demonstrate best practices used throughout the Battery Beacon Connect project. They emphasize type safety, error handling, user feedback, and clean code architecture.
