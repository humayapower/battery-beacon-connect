# 📁 Project Structure & Architecture Guide

## 🎯 Overview

Battery Beacon Connect is a modern React application built with TypeScript, using a component-based architecture with clear separation of concerns. This document provides a comprehensive breakdown of the project structure, explaining where each file is located and why it's organized that way.

## 🏗 High-Level Architecture

```
Battery Beacon Connect
├── 🎨 Frontend (React + TypeScript)
├── 🗄️ Backend (Supabase)
├── 🔐 Authentication (Custom Auth System)
├── 💾 Database (PostgreSQL with RLS)
├── 📁 File Storage (Supabase Storage)
└── 🚀 Deployment (Lovable Platform)
```

## 📂 Detailed File Structure

### 🔸 Root Level Files

```
├── README.md                    # Project overview and setup instructions
├── PROJECT_STRUCTURE.md         # This file - detailed project breakdown
├── API_DOCUMENTATION.md         # API endpoints and database documentation
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── vite.config.ts              # Vite build tool configuration
├── index.html                  # Main HTML template
└── eslint.config.js            # Code linting rules
```

**Why at root level?**
- Configuration files need to be accessible to build tools
- Documentation provides immediate project understanding
- Package.json defines the entire project dependencies

### 🔸 Source Code Structure (`src/`)

#### 🎯 Entry Points
```
src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Main app component with routing
├── index.css                   # Global styles and design tokens
└── vite-env.d.ts              # TypeScript environment declarations
```

**main.tsx** - The application bootstrap
- Renders the root React component
- Minimal setup for maximum performance

**App.tsx** - Application shell
- Sets up providers (Auth, Theme, Query Client)
- Defines routing structure
- Implements lazy loading for performance

**index.css** - Design system foundation
- CSS custom properties for theming
- Tailwind CSS base styles
- Dark/light mode support

#### 🧩 Components (`src/components/`)

**Why this structure?**
- **Feature-based organization**: Groups related functionality together
- **Reusability**: Shared components prevent duplication
- **Maintainability**: Easy to locate and modify specific features

```
src/components/
├── features/                   # Feature-specific components
│   ├── admin/                 # Admin-only functionality
│   │   └── PaymentScheduler.tsx
│   ├── battery/               # Battery management
│   │   ├── BatteryTable.tsx
│   │   ├── BatteryProfile.tsx
│   │   └── ResponsiveBatteryCards.tsx
│   ├── billing/               # Payment & billing
│   │   ├── BillingDashboard.tsx
│   │   ├── TransactionTable.tsx
│   │   └── ResponsiveTransactionCards.tsx
│   ├── customer/              # Customer management
│   │   ├── CustomerTable.tsx
│   │   ├── CustomerProfile.tsx
│   │   ├── CustomerBillingPage.tsx
│   │   └── ResponsiveCustomerCards.tsx
│   └── partner/               # Partner management
│       ├── PartnerTable.tsx
│       └── PartnerProfile.tsx
├── layout/                    # Application layout
│   ├── AdminDashboard.tsx     # Admin dashboard layout
│   ├── PartnerDashboard.tsx   # Partner dashboard layout
│   ├── ThemeProvider.tsx      # Theme context provider
│   └── ThemeToggle.tsx        # Dark/light mode toggle
├── modals/                    # Modal dialogs
│   ├── AddCustomerModal.tsx
│   ├── AddBatteryModal.tsx
│   ├── PaymentModal.tsx
│   ├── CreatePartnerModal.tsx
│   ├── EditPartnerModal.tsx
│   ├── DeletePartnerModal.tsx
│   ├── CustomerDetailsModal.tsx
│   └── AssignBatteryModal.tsx
├── providers/                 # Context providers
│   └── AutoSchedulingProvider.tsx
├── shared/                    # Reusable components
│   ├── FileUpload.tsx
│   └── SearchAndFilters.tsx
└── ui/                       # Base UI components (shadcn/ui)
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    ├── table.tsx
    ├── dialog.tsx
    ├── sidebar.tsx
    └── [50+ other UI components]
```

**Component Organization Principles:**

1. **Feature Components** (`features/`)
   - Self-contained business logic
   - Feature-specific styling and behavior
   - Can use multiple UI components

2. **Layout Components** (`layout/`)
   - Define page structure
   - Handle navigation and routing
   - Manage global state providers

3. **Modal Components** (`modals/`)
   - Separate folder for better organization
   - Reusable dialog components
   - Form handling and validation

4. **UI Components** (`ui/`)
   - Pure presentation components
   - No business logic
   - Highly reusable across features

#### 🎣 Custom Hooks (`src/hooks/`)

```
src/hooks/
├── useBatteries.ts             # Battery data management
├── useCustomers.ts             # Customer operations
├── useOptimizedPartners.ts     # Partner data with optimization
├── useTransactions.ts          # Transaction management
├── useBilling.ts               # Billing operations
├── useAdminFunctions.ts        # Admin-specific operations
├── useAutoScheduling.ts        # Automated scheduling
├── usePhoneCall.ts             # Phone call functionality
├── useDebounce.ts              # Input debouncing
├── use-mobile.tsx              # Mobile device detection
└── use-toast.ts                # Toast notifications
```

**Why separate hooks?**
- **Separation of Concerns**: Each hook handles specific data
- **Reusability**: Multiple components can use the same hook
- **Performance**: Optimized data fetching and caching
- **Testability**: Easier to unit test business logic

#### 🌐 Pages (`src/pages/`)

```
src/pages/
├── Index.tsx                   # Dashboard router (Admin/Partner)
├── Auth.tsx                    # Login/authentication page
├── Reports.tsx                 # Reports and analytics
├── Settings.tsx                # Application settings
└── NotFound.tsx                # 404 error page
```

**Page Responsibilities:**
- **Route handling**: Each file represents a URL route
- **Layout selection**: Choose appropriate dashboard/layout
- **Authentication checks**: Protect routes from unauthorized access

#### 🔗 Integrations (`src/integrations/`)

```
src/integrations/
├── supabase/
│   ├── client.ts               # Supabase client configuration
│   └── types.ts                # Auto-generated database types
```

**Integration Layer Benefits:**
- **Abstraction**: Hide third-party service details
- **Type Safety**: Generated types for database schema
- **Configuration**: Centralized service setup

#### 🔐 Authentication (`src/contexts/`)

```
src/contexts/
└── AuthContext.tsx             # Authentication state management
```

**Authentication System:**
- **Custom Implementation**: Username/password authentication
- **Role-Based Access**: Admin and Partner roles
- **Session Management**: Persistent login state
- **Security**: Hashed passwords and secure storage

#### 🛠 Services (`src/services/`)

```
src/services/
├── AutoSchedulingService.ts    # Automated payment scheduling
└── billingService.ts           # Billing calculations and operations
```

**Service Layer Purpose:**
- **Business Logic**: Complex operations separated from UI
- **API Integration**: External service communication
- **Data Processing**: Heavy computations and transformations

#### 🎨 Styling (`src/styles/`)

```
src/styles/
└── custom-animations.css      # Custom CSS animations
```

#### 📝 Types (`src/types/`)

```
src/types/
├── index.ts                    # Main application types
└── billing.ts                  # Billing-specific types
```

**Type Definitions:**
- **Data Models**: Customer, Battery, Transaction interfaces
- **Component Props**: TypeScript interfaces for components
- **API Responses**: Type-safe API response handling

#### 🔧 Utilities (`src/utils/`)

```
src/utils/
├── formatters.ts               # Data formatting functions
├── paymentCalculations.ts      # Payment calculation logic
├── statusColors.ts             # Status-based color mapping
├── sharedHooks.ts              # Shared hook utilities
└── dbSetup.sql                 # Database schema documentation
```

### 🔸 Database & Backend (`supabase/`)

```
supabase/
├── config.toml                 # Supabase project configuration
├── cron-config.md              # Automated scheduling documentation
├── functions/                  # Edge functions
│   ├── monthly-rent-scheduler/ # Monthly rent automation
│   └── overdue-payment-processor/ # Overdue payment handling
└── migrations/                 # Database migrations
    ├── [timestamp]_create_users_table.sql
    ├── [timestamp]_create_authenticate_function.sql
    ├── [timestamp]_create_payment_scheduler.sql
    └── [other migration files]
```

### 🔸 Configuration Files

```
├── tailwind.config.ts          # Tailwind CSS customization
├── vite.config.ts              # Build tool configuration
├── tsconfig.json               # TypeScript compiler options
├── tsconfig.app.json           # App-specific TypeScript config
├── tsconfig.node.json          # Node.js TypeScript config
├── eslint.config.js            # Code linting rules
├── postcss.config.js           # CSS processing configuration
└── components.json             # shadcn/ui component configuration
```

## 🎯 Application Flow

### 1. **Application Bootstrap**
```
main.tsx → App.tsx → Providers → Router → Pages
```

### 2. **Authentication Flow**
```
User visits → Auth.tsx → AuthContext.signIn() → Database verification → Dashboard
```

### 3. **Dashboard Rendering**
```
Index.tsx → Check user role → AdminDashboard.tsx OR PartnerDashboard.tsx
```

### 4. **Data Flow**
```
Components → Custom Hooks → Supabase Client → Database → Real-time Updates
```

### 5. **Component Interaction**
```
User Action → Event Handler → Service Layer → Database Update → UI Refresh
```

## 🏗 Design Patterns Used

### 1. **Component Composition**
- Small, focused components that compose together
- Props-based configuration
- Children pattern for layout components

### 2. **Custom Hooks Pattern**
- Data fetching logic separated from UI
- Reusable across multiple components
- State management with React Query

### 3. **Provider Pattern**
- Context providers for global state
- Authentication state
- Theme preferences

### 4. **Feature-Based Architecture**
- Code organized by business features
- Each feature is self-contained
- Easy to add/remove features

### 5. **Responsive Design**
- Mobile-first approach
- Flexible grid systems
- Adaptive UI components

## 🎨 UI Architecture

### **Design System**
- **CSS Custom Properties**: Defined in `index.css`
- **Tailwind Configuration**: Extended in `tailwind.config.ts`
- **Component Variants**: Using `class-variance-authority`
- **Theme Support**: Light/dark mode with `next-themes`

### **Component Hierarchy**
```
App
├── AuthProvider
├── ThemeProvider
├── QueryClientProvider
└── Router
    ├── Auth Page
    └── Dashboard (Admin/Partner)
        ├── Sidebar Navigation
        ├── Header
        └── Content Area
            ├── Feature Tables
            ├── Modal Dialogs
            └── Forms
```

## 🔄 State Management Strategy

### 1. **Server State** (React Query)
- Database queries and mutations
- Caching and background updates
- Error handling and retry logic

### 2. **Client State** (React Context)
- Authentication state
- Theme preferences
- UI state (modals, dropdowns)

### 3. **Local State** (useState)
- Form inputs
- Component-specific state
- Temporary UI state

## 📱 Responsive Design Approach

### **Breakpoint Strategy**
- **Mobile First**: Base styles for mobile
- **Tablet**: `sm:` prefix (640px+)
- **Desktop**: `lg:` prefix (1024px+)
- **Large Desktop**: `xl:` prefix (1280px+)

### **Responsive Components**
- Adaptive layouts with CSS Grid and Flexbox
- Responsive typography and spacing
- Mobile-optimized navigation (sidebar becomes drawer)

## 🚀 Performance Optimizations

### **Code Splitting**
- Lazy loading for page components
- Dynamic imports for heavy components
- Route-based code splitting

### **Data Optimization**
- React Query for efficient data fetching
- Memoization for expensive calculations
- Optimistic updates for better UX

### **Bundle Optimization**
- Vite for fast builds
- Tree shaking for smaller bundles
- Modern JavaScript output

## 🔒 Security Implementation

### **Frontend Security**
- Input validation and sanitization
- XSS prevention with proper escaping
- CSRF protection through SameSite cookies

### **Database Security**
- Row Level Security (RLS) policies
- Parameterized queries
- Role-based access control

### **Authentication Security**
- Secure password hashing (SHA-256)
- Session management
- Logout cleanup

---

This structure ensures the application is **scalable**, **maintainable**, and **performant** while providing a clear development experience for both current and future developers.