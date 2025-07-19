# Battery Beacon Connect - Battery Rental Management System

🔋 A comprehensive web application for managing battery rental business operations, including inventory management, customer relationships, payment tracking, and automated billing.

## 🌟 Project Overview

Battery Beacon Connect is a modern, full-stack web application designed specifically for battery rental businesses. It provides two distinct user roles (Admin and Partner) with powerful dashboards to manage the entire battery rental lifecycle - from inventory tracking to customer onboarding, payment processing, and automated billing.

## 🚀 Live Demo

- **Demo URL**: [Your Lovable Project URL](https://lovable.dev/projects/0065f15c-68e1-49b8-b827-24ce27b6c9b7)
- **Demo Credentials**:
  - Username: `admin`
  - Password: `admin123`

## 🎯 Key Features

### For Administrators
- **Complete Business Overview**: Real-time dashboard with key metrics and analytics
- **Partner Management**: Add, edit, and manage business partners
- **Battery Inventory**: Track battery status, assignments, and maintenance
- **Customer Management**: Comprehensive customer database with payment tracking
- **Automated Billing**: Monthly rent generation and EMI scheduling
- **Payment Processing**: Record payments, track overdue amounts, and manage credits
- **Reports & Analytics**: Business insights and payment summaries

### For Partners
- **Partner Dashboard**: Focused view of assigned batteries and customers
- **Customer Relationship Management**: Manage customer accounts and battery assignments
- **Payment Tracking**: Monitor customer payments and transaction history
- **Battery Management**: Track battery status and assignments

### System Features
- **Role-Based Access Control**: Secure authentication with admin and partner roles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live data synchronization across all users
- **Document Management**: Upload and store customer documents securely
- **Automated Scheduling**: Monthly rent charges and overdue payment processing
- **Dark/Light Mode**: User preference theme switching

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form management and validation
- **Lucide React** - Beautiful icon library

### Backend & Database
- **Supabase** - Backend-as-a-Service platform
- **PostgreSQL** - Robust relational database
- **Row Level Security (RLS)** - Database-level security
- **Edge Functions** - Serverless API endpoints
- **Real-time Subscriptions** - Live data updates

### Development & Deployment
- **GitHub Actions** - Automated CI/CD pipeline
- **ESLint** - Code linting and quality
- **TypeScript Compiler** - Type checking
- **Lovable Platform** - Deployment and hosting

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── features/       # Feature-specific components
│   │   ├── admin/      # Admin-only features
│   │   ├── battery/    # Battery management
│   │   ├── billing/    # Payment & billing
│   │   ├── customer/   # Customer management
│   │   └── partner/    # Partner management
│   ├── layout/         # Layout components
│   ├── modals/         # Modal dialogs
│   ├── providers/      # Context providers
│   ├── shared/         # Shared components
│   └── ui/            # Base UI components (shadcn/ui)
├── contexts/           # React contexts
├── hooks/             # Custom React hooks
├── integrations/      # External service integrations
├── lib/              # Utility libraries
├── pages/            # Page components
├── services/         # Business logic services
├── styles/           # Global styles
├── types/            # TypeScript type definitions
└── utils/            # Helper functions
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/battery-beacon-connect.git
   cd battery-beacon-connect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - The project uses Supabase with pre-configured connection details
   - No additional environment variables needed for demo

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

### Build for Production
```bash
npm run build
npm run preview
```

## 🎮 Usage Guide

### Getting Started
1. Navigate to the application URL
2. Use demo credentials or contact admin for account creation
3. Explore the dashboard based on your role (Admin/Partner)

### Admin Workflow
1. **Setup Partners**: Add business partners who will manage customers
2. **Battery Inventory**: Add batteries and assign them to partners
3. **Monitor Operations**: Track customer onboarding, payments, and overdue accounts
4. **Generate Reports**: Access payment summaries and business analytics

### Partner Workflow
1. **Customer Onboarding**: Add new customers and assign batteries
2. **Payment Processing**: Record payments and track due amounts
3. **Inventory Management**: Monitor assigned battery status
4. **Customer Relationship**: Maintain customer communications and records

## 🔒 Authentication & Security

- **Custom Authentication**: Username/password authentication with secure password hashing
- **Role-Based Access**: Admin and Partner roles with specific permissions
- **Session Management**: Secure session handling with localStorage
- **Database Security**: Row Level Security (RLS) policies protect data access
- **Input Validation**: Comprehensive form validation and sanitization

## 💾 Database Schema

The application uses a well-structured PostgreSQL database with the following main tables:

- **users**: Admin and partner user accounts
- **customers**: Customer information and payment details
- **batteries**: Battery inventory and status tracking
- **transactions**: Payment records and transaction history
- **emis**: EMI payment schedules
- **monthly_rents**: Monthly rental charges
- **customer_credits**: Customer credit balances

## 🚀 Deployment

### Automatic Deployment
The project is configured for automatic deployment on Lovable platform:
- Push changes to main branch
- GitHub Actions automatically builds and deploys
- Live updates reflected immediately

### Manual Deployment Options
- **Vercel**: Connect GitHub repository for automatic deployments
- **Netlify**: Drag-and-drop build folder or connect repository
- **Traditional Hosting**: Upload build files to any static hosting service

## 📊 Automated Features

### Payment Scheduling
- **Monthly Rent Generation**: Automatically creates rent charges on the 1st of each month
- **Overdue Processing**: Daily checks and updates overdue payment status
- **EMI Management**: Automated EMI schedule generation for installment customers

### GitHub Actions Workflow
```yaml
# Automated payment processing
- Monthly rent charges: 1st of every month at 9:00 AM
- Overdue status updates: Daily at 10:00 AM
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation in the `/docs` folder

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)

---

**Made with ❤️ for the battery rental industry**