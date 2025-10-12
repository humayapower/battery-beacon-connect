# Technology Stack - Comprehensive Deep Dive

## Table of Contents
1. [Frontend Architecture](#frontend-architecture)
2. [Build System & Development Tools](#build-system--development-tools)
3. [Styling & Design System](#styling--design-system)
4. [UI Component Libraries](#ui-component-libraries)
5. [State Management](#state-management)
6. [Form Management](#form-management)
7. [Routing System](#routing-system)
8. [Backend & Database](#backend--database)
9. [Additional Utilities](#additional-utilities)

---

## Frontend Architecture

### React 18.3.1
**Why React?**
- Component-based architecture promotes reusability
- Virtual DOM for optimal performance
- Large ecosystem and community support
- Mature and production-ready

**React Features Used:**
- **Functional Components**: All components use modern function syntax
- **Hooks Ecosystem**:
  - `useState` - Local component state
  - `useEffect` - Side effects and lifecycle management
  - `useContext` - Global state without prop drilling
  - `useCallback` - Memoized callbacks for performance
  - `useMemo` - Expensive computation memoization
  - `useRef` - DOM references and persisting values
- **Context API**: Used for authentication state (`AuthContext`)
- **Custom Hooks**: Abstracted business logic in hooks like:
  - `useAuth` - Authentication state and methods
  - `useBatteries` - Battery CRUD operations
  - `useCustomers` - Customer management
  - `useBilling` - Payment processing
  - `useTransactions` - Transaction history
  - `useAutoScheduling` - Automated job management

**Component Patterns:**
```tsx
// Composition pattern example
<Dashboard>
  <Sidebar />
  <MainContent>
    <Header />
    <ContentArea />
  </MainContent>
</Dashboard>
```

### TypeScript 5.x
**Configuration** (`tsconfig.json`):
- **Strict Mode Enabled**: Maximum type safety
- **Module System**: ESNext modules with bundler resolution
- **Target**: ES2020 for modern JavaScript features
- **JSX**: react-jsx for automatic JSX runtime
- **Path Aliases**: `@/*` maps to `src/*` for clean imports

**Why TypeScript?**
- Catch errors at compile-time instead of runtime
- Enhanced IDE support with IntelliSense
- Self-documenting code through type definitions
- Better refactoring capabilities
- Interface definitions ensure data structure consistency

**Type System Usage:**
```typescript
// Strict typing for domain objects
interface Customer {
  id: string;
  name: string;
  phone: string;
  payment_type: 'emi' | 'monthly_rent' | 'purchase';
  status: 'active' | 'inactive';
  // ... more fields
}

// Type-safe API responses
type ApiResponse<T> = {
  data: T | null;
  error: Error | null;
};
```

---

## Build System & Development Tools

### Vite 5.x
**Configuration** (`vite.config.ts`):
```typescript
export default defineConfig({
  server: {
    host: "::",  // IPv6 support
    port: 8080,
  },
  plugins: [
    react(),  // React Fast Refresh
    componentTagger(),  // Lovable development helper
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Path aliasing
    },
  },
});
```

**Why Vite?**
- **Lightning Fast HMR**: Changes reflect instantly in browser
- **Native ES Modules**: No bundling in development
- **Optimized Production Builds**: Uses Rollup under the hood
- **Plugin Ecosystem**: Extensible architecture
- **Framework Agnostic**: Works with any framework

**Key Features:**
1. **Development Server**:
   - Hot Module Replacement (HMR) - instant updates without full reload
   - Fast cold start times
   - Efficient caching

2. **Build Optimization**:
   - Code splitting for smaller bundles
   - Tree shaking to remove unused code
   - Asset optimization (images, fonts)
   - CSS code splitting

3. **Environment Variables**:
   - No `VITE_*` prefix required in this project
   - Direct Supabase configuration in code

### ESLint
**Purpose**: Code quality and consistency
- Catches common mistakes
- Enforces coding standards
- TypeScript-aware linting

---

## Styling & Design System

### TailwindCSS 3.x
**Configuration** (`tailwind.config.ts`):
```typescript
export default {
  darkMode: ["class"],  // Class-based dark mode
  content: [
    "./src/**/*.{ts,tsx}",  // Scan all source files
  ],
  theme: {
    extend: {
      colors: {
        // All colors use HSL semantic tokens
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        // ... more colors
      },
      borderRadius: {
        lg: 'var(--radius)',  // Consistent radius system
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Why Tailwind?**
- Utility-first approach eliminates context switching
- Design system consistency through configuration
- No CSS naming conflicts
- Excellent tree-shaking for production
- Responsive design utilities built-in

### Design System (`src/index.css`)

**CSS Custom Properties Architecture:**
```css
:root {
  /* Color Tokens - HSL format for easy manipulation */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  
  /* Spacing & Layout */
  --radius: 0.5rem;
  
  /* Sidebar specific */
  --sidebar-background: 0 0% 98%;
  --sidebar-foreground: 240 5.3% 26.1%;
}

.dark {
  /* Dark mode overrides */
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... more dark mode colors */
}
```

**Design Token Benefits:**
- Single source of truth for colors
- Easy theme switching (light/dark)
- Consistent color application
- HSL format allows programmatic color manipulation
- Semantic naming improves code readability

**Responsive Breakpoints:**
- `sm`: 640px - Small devices
- `md`: 768px - Medium devices (tablets)
- `lg`: 1024px - Large devices (desktops)
- `xl`: 1280px - Extra large screens
- `2xl`: 1536px - Ultra-wide screens

### Dark Mode Implementation

**Theme Provider** (`next-themes`):
```tsx
// Automatic theme detection and persistence
<ThemeProvider
  attribute="class"  // Uses .dark class
  defaultTheme="system"  // Follows system preference
  enableSystem  // Allows system theme detection
  disableTransitionOnChange  // Smooth transitions
>
  {children}
</ThemeProvider>
```

**Theme Toggle Component:**
- Switches between light/dark/system
- Persists preference in localStorage
- Smooth transitions without flashing

---

## UI Component Libraries

### shadcn/ui + Radix UI

**Architecture:**
- **Not a Component Library**: Copy-paste components into project
- **Radix UI Primitives**: Unstyled, accessible components
- **Full Customization**: Own and modify all components
- **TypeScript Native**: Full type safety

**Components Used:**

1. **Form Controls**:
   - `Input` - Text inputs with variants
   - `Textarea` - Multi-line text input
   - `Select` - Dropdown selection
   - `Checkbox` - Boolean input
   - `Radio Group` - Single choice from options
   - `Switch` - Toggle control
   - `Calendar` & `Date Picker` - Date selection

2. **Overlay Components**:
   - `Dialog` - Modal dialogs
   - `Sheet` - Side panels
   - `Popover` - Floating content
   - `Tooltip` - Hover information
   - `Dropdown Menu` - Contextual menus
   - `Alert Dialog` - Confirmation dialogs

3. **Layout Components**:
   - `Card` - Content containers
   - `Tabs` - Content organization
   - `Accordion` - Collapsible sections
   - `Separator` - Visual dividers
   - `Scroll Area` - Custom scrollbars
   - `Sidebar` - Navigation panels

4. **Feedback Components**:
   - `Toast` (via Sonner) - Notifications
   - `Alert` - Important messages
   - `Badge` - Status indicators
   - `Progress` - Loading states
   - `Skeleton` - Loading placeholders

5. **Data Display**:
   - `Table` - Tabular data
   - `Avatar` - User images
   - `Chart` (via Recharts) - Data visualization

**Accessibility Features:**
- **ARIA Attributes**: Proper roles and labels
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Logical focus flow
- **Screen Reader Support**: Descriptive labels
- **Color Contrast**: WCAG AA compliance

**Customization Pattern:**
```tsx
// Button component with variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input hover:bg-accent",
        ghost: "hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
  }
);
```

### Lucide React 0.462.0

**Icon System:**
```tsx
import { Battery, Users, CreditCard, TrendingUp } from 'lucide-react';

// Usage with customization
<Battery className="h-4 w-4 text-primary" />
<Users size={24} color="currentColor" strokeWidth={2} />
```

**Why Lucide?**
- **Tree-shakeable**: Only import icons you use
- **Consistent Design**: All icons match in style
- **Customizable**: Size, color, stroke width
- **React Native**: Works in React components
- **1000+ Icons**: Comprehensive icon set

**Common Icons Used:**
- Navigation: `Home`, `Settings`, `Menu`
- Actions: `Plus`, `Edit`, `Trash`, `Save`
- Status: `Check`, `X`, `AlertCircle`, `Info`
- Data: `Battery`, `Users`, `CreditCard`, `FileText`

---

## State Management

### React Context API

**AuthContext Pattern:**
```typescript
interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

// Provider wraps entire app
<AuthProvider>
  <App />
</AuthProvider>

// Consume in any component
const { user, signIn, signOut } = useAuth();
```

**Benefits:**
- No prop drilling
- Global state access
- Type-safe with TypeScript
- Simple API

### React Query (TanStack Query) 5.56.2

**Purpose**: Server state management and caching

**Configuration:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      cacheTime: 10 * 60 * 1000,  // 10 minutes
      retry: 1,  // Retry failed requests once
      refetchOnWindowFocus: false,  // Don't refetch on focus
    },
  },
});
```

**Key Features Used:**

1. **Queries** - Data fetching:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['batteries', partnerId],
  queryFn: () => fetchBatteries(partnerId),
  enabled: !!partnerId,  // Only run if partnerId exists
});
```

2. **Mutations** - Data updates:
```typescript
const mutation = useMutation({
  mutationFn: createCustomer,
  onSuccess: () => {
    queryClient.invalidateQueries(['customers']);
    toast.success('Customer created');
  },
  onError: (error) => {
    toast.error('Failed to create customer');
  },
});
```

3. **Cache Management**:
   - Automatic background refetching
   - Cache invalidation on mutations
   - Optimistic updates for instant UI feedback
   - Pagination and infinite scrolling support

4. **Query Invalidation:**
```typescript
// Invalidate specific queries
queryClient.invalidateQueries(['customers', customerId]);

// Invalidate all customer queries
queryClient.invalidateQueries(['customers']);
```

**Why React Query?**
- Eliminates boilerplate for API calls
- Built-in loading and error states
- Automatic caching and deduplication
- Background refetching
- Optimistic updates
- Request cancellation
- Retry logic

### Custom Hooks Architecture

**Pattern Example - useBatteries:**
```typescript
export const useBatteries = (partnerId?: string) => {
  const queryClient = useQueryClient();
  
  // Fetch batteries
  const { data: batteries, isLoading } = useQuery({
    queryKey: ['batteries', partnerId],
    queryFn: async () => {
      const query = supabase.from('batteries').select('*');
      if (partnerId) query.eq('partner_id', partnerId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
  
  // Create battery mutation
  const createMutation = useMutation({
    mutationFn: async (batteryData: BatteryInput) => {
      const { data, error } = await supabase
        .from('batteries')
        .insert(batteryData);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['batteries']);
      toast.success('Battery created successfully');
    },
  });
  
  return {
    batteries,
    isLoading,
    createBattery: createMutation.mutate,
    // ... more methods
  };
};
```

**Benefits:**
- Encapsulates business logic
- Reusable across components
- Easy to test
- Type-safe

---

## Form Management

### React Hook Form 7.53.0

**Why React Hook Form?**
- Minimal re-renders (performance)
- Built-in validation
- Small bundle size
- Easy integration with UI libraries
- Excellent TypeScript support

**Usage Pattern:**
```typescript
const form = useForm<FormSchema>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: '',
    phone: '',
    payment_type: 'emi',
  },
});

// Submit handler
const onSubmit = async (values: FormSchema) => {
  await createCustomer(values);
};

// In JSX
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer Name</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

**Key Features:**
- **Uncontrolled Components**: Better performance
- **Field Validation**: Real-time or on submit
- **Error Handling**: Per-field error messages
- **Form State**: isDirty, isValid, isSubmitting
- **Watch Values**: Subscribe to field changes
- **Array Fields**: Dynamic form sections

### Zod 3.23.8

**Schema Validation:**
```typescript
const customerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  phone: z.string()
    .regex(/^[0-9]{10}$/, 'Invalid phone number'),
  payment_type: z.enum(['emi', 'monthly_rent', 'purchase']),
  emi_amount: z.number()
    .positive('Amount must be positive')
    .optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;
```

**Why Zod?**
- Type inference from schema
- Comprehensive validation rules
- Custom error messages
- Composable schemas
- Runtime type checking

**Validation Features:**
- String validations: min, max, email, regex, uuid
- Number validations: min, max, positive, integer
- Date validations: min, max
- Custom refinements: Complex validation logic
- Conditional validation: Based on other fields

---

## Routing System

### React Router DOM 6.26.2

**Route Configuration:**
```tsx
<Routes>
  {/* Public Route */}
  <Route path="/auth" element={<Auth />} />
  
  {/* Protected Routes */}
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    }
  />
  
  {/* Admin-only Routes */}
  <Route
    path="/reports"
    element={
      <AdminRoute>
        <Reports />
      </AdminRoute>
    }
  />
  
  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Protected Route Pattern:**
```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};
```

**Navigation Methods:**
```tsx
// Declarative navigation
<Link to="/customers">View Customers</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate('/customers', { state: { from: 'dashboard' } });

// Navigation with search params
navigate('/customers?filter=active');
```

**Key Features:**
- **Nested Routes**: Hierarchical routing
- **Route Parameters**: `/customer/:id`
- **Search Params**: Query string handling
- **Navigation Guards**: Protected routes
- **Redirects**: Conditional navigation
- **404 Handling**: Catch-all routes

---

## Backend & Database

### Supabase (PostgreSQL 15+)

**Architecture:**
- **PostgreSQL Database**: Relational database
- **Auto-generated REST API**: Instant API from schema
- **Real-time Subscriptions**: WebSocket updates
- **Row Level Security (RLS)**: Database-level authorization
- **Storage**: File and document management
- **Edge Functions**: Serverless Deno functions

**Client Configuration:**
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://mloblwqwsefhossgwvzt.supabase.co',
  'anon-key-here'
);
```

**Database Features Used:**

1. **Tables**:
   - `users` - Admin and partner accounts
   - `batteries` - Battery inventory
   - `customers` - Customer records
   - `transactions` - Payment transactions
   - `emis` - EMI schedules
   - `monthly_rents` - Rent charges
   - `customer_credits` - Credit balances

2. **RPC Functions**:
   - `authenticate_user()` - Custom authentication
   - `get_partners_with_counts()` - Aggregated data
   - `generate_monthly_rent_charges()` - Automated rent
   - `update_overdue_status()` - Status updates

3. **Database Triggers**:
   - `update_battery_status` - Auto-update battery status
   - `update_customer_battery_relationship` - Sync relationships
   - `generate_emi_schedule` - Auto-create EMI records

4. **Row Level Security Policies**:
```sql
-- Partners can only view their own customers
CREATE POLICY "Partners can view own customers"
ON customers FOR SELECT
USING (
  partner_id = get_partner_id(auth.uid())
  OR is_admin(auth.uid())
);
```

**Real-time Subscriptions:**
```typescript
// Subscribe to battery changes
const subscription = supabase
  .channel('batteries')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'batteries',
    filter: `partner_id=eq.${partnerId}`
  }, (payload) => {
    console.log('Battery changed:', payload);
    // Update UI
  })
  .subscribe();
```

**Storage Buckets:**
- `customer-documents` - Customer ID proof, photos
- `partner-documents` - Partner documentation

---

## Additional Utilities

### Date Management (date-fns 3.6.0)

**Common Operations:**
```typescript
import { format, addMonths, differenceInDays, isAfter } from 'date-fns';

// Format dates
format(new Date(), 'dd/MM/yyyy') // "15/01/2025"
format(new Date(), 'PPP') // "January 15th, 2025"

// Date arithmetic
addMonths(new Date(), 1) // Add 1 month
differenceInDays(dueDate, today) // Days between dates

// Comparisons
isAfter(dueDate, today) // Is due date in future?
```

**Why date-fns?**
- Tree-shakeable (import only what you need)
- Immutable (doesn't modify original dates)
- TypeScript support
- Comprehensive date operations
- Lightweight

### Charts (Recharts 2.12.7)

**Chart Types Used:**
- **Line Chart**: Trends over time
- **Bar Chart**: Comparative data
- **Pie Chart**: Proportional data
- **Area Chart**: Cumulative data

**Example:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

### Notifications (Sonner 1.5.0)

**Toast Patterns:**
```typescript
import { toast } from 'sonner';

// Success
toast.success('Customer created successfully');

// Error
toast.error('Failed to save changes');

// Info
toast.info('Payment is being processed');

// Loading with promise
toast.promise(
  saveCustomer(),
  {
    loading: 'Saving...',
    success: 'Saved!',
    error: 'Failed to save',
  }
);
```

### Carousel (embla-carousel-react 8.3.0)

**Usage:**
```tsx
import useEmblaCarousel from 'embla-carousel-react';

const [emblaRef] = useEmblaCarousel({ loop: true });

<div ref={emblaRef}>
  <div className="embla__container">
    {items.map(item => (
      <div className="embla__slide" key={item.id}>
        {item.content}
      </div>
    ))}
  </div>
</div>
```

### Utility Functions

**Class Name Merging (clsx + tailwind-merge):**
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage - handles conflicts intelligently
cn('px-2 py-1', 'px-4') // Results in 'px-4 py-1'
```

**Class Variance Authority:**
```typescript
import { cva } from "class-variance-authority";

const button = cva("rounded font-semibold", {
  variants: {
    intent: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
    },
    size: {
      small: "text-sm px-2 py-1",
      large: "text-lg px-4 py-2",
    },
  },
});

button({ intent: "primary", size: "large" })
```

---

## Performance Optimizations

### Code Splitting
- Dynamic imports for routes
- Lazy loading for heavy components
- Component-level code splitting

### Memoization
- `React.memo()` for expensive components
- `useMemo()` for expensive calculations
- `useCallback()` for stable function references

### Bundle Optimization
- Tree shaking unused code
- Minification and compression
- Asset optimization (images, fonts)
- CSS purging with Tailwind

### Caching Strategy
- React Query cache
- Browser cache via service workers
- Supabase client-side caching

---

## Development Workflow Tools

### Hot Module Replacement (HMR)
- Instant updates without page reload
- Preserves component state
- Fast iteration cycle

### TypeScript Compiler
- Real-time type checking
- IDE integration
- Build-time validation

### Path Aliases
```typescript
// Instead of:
import { Button } from '../../../components/ui/button';

// Use:
import { Button } from '@/components/ui/button';
```

---

## Security Considerations

### Authentication
- Custom password hashing (SHA-256)
- Session persistence in localStorage
- Server-side validation with RLS

### Authorization
- Row Level Security (RLS) policies
- Role-based access control (RBAC)
- Security definer functions

### Input Validation
- Client-side validation with Zod
- Server-side validation in database
- SQL injection prevention (parameterized queries)

### XSS Prevention
- React's automatic escaping
- Content Security Policy headers
- Sanitized user inputs

---

## Production Deployment

### Build Process
```bash
npm run build
# Output: dist/ folder with optimized assets
```

### Environment Configuration
- No environment variables needed
- Direct Supabase configuration
- Production-ready out of the box

### Hosting
- Lovable platform hosting
- Supabase cloud backend
- CDN for static assets
- Edge deployment for low latency

---

## Technology Selection Rationale

### Why This Stack?

1. **React**: Industry standard, large ecosystem, excellent performance
2. **TypeScript**: Type safety prevents bugs, improves DX
3. **Vite**: Fastest build tool, great DX
4. **Tailwind**: Rapid UI development, consistent design
5. **shadcn/ui**: Own your components, full customization
6. **React Query**: Best server state management
7. **Supabase**: Full backend in one service, excellent DX
8. **React Hook Form + Zod**: Best form handling solution

### Trade-offs Made

**Chosen Over:**
- Next.js: Simpler deployment, no SSR needed
- Redux: React Query + Context is simpler
- Styled Components: Tailwind is faster
- Firebase: Supabase has better PostgreSQL
- Express: Supabase Edge Functions simpler

**Benefits:**
- Faster development velocity
- Smaller bundle size
- Better developer experience
- Easier to maintain
- More cost-effective

---

## Future Technology Considerations

### Potential Additions
- **React Native**: Mobile app version
- **GraphQL**: More flexible API queries
- **WebSockets**: More real-time features
- **Redis**: Advanced caching
- **Elasticsearch**: Full-text search
- **S3**: Larger file storage

### Monitoring & Analytics
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User analytics (PostHog)
- Logging (Supabase logs)

---

This comprehensive technology stack provides a robust foundation for the Battery Beacon Connect platform, balancing performance, developer experience, and maintainability.
