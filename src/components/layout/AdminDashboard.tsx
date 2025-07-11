import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Battery, Users, User, CreditCard, Home, Settings, LogOut, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';
import { useTransactions } from '@/hooks/useTransactions';
import { ThemeToggle } from './ThemeToggle';
import BatteryTable from '../features/battery/BatteryTable';
import PartnerTable from '../features/partner/PartnerTable';
import CustomerTable from '../features/customer/CustomerTable';
import BillingDashboard from '../features/billing/BillingDashboard';
import AddCustomerModal from '../modals/AddCustomerModal';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { signOut, user } = useAuth();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { partners } = useOptimizedPartners();
  const { transactions } = useTransactions();

  const menuItems = [
    { title: "Dashboard", icon: Home, key: "overview" },
    { title: "Customers", icon: User, key: "customers" },
    { title: "Partners", icon: Users, key: "partners" },
    { title: "Batteries", icon: Battery, key: "batteries" },
    { title: "Payments", icon: CreditCard, key: "payments" },
    { title: "Reports", icon: FileText, key: "reports" },
    { title: "Settings", icon: Settings, key: "settings" },
  ];

  // Optimized stats calculation with memoization - fixed duplicate calculation
  const stats = useMemo(() => {
    const now = new Date();
    const overdueTransactions = transactions?.filter(t => 
      t.payment_status === 'overdue' || 
      (t.payment_status === 'due' && t.due_date && new Date(t.due_date) < now)
    ) || [];
    
    // Calculate unique customers with overdue payments (fixed duplicate)
    const overdueCustomerIds = new Set(overdueTransactions.map(t => t.customer_id));
    
    const recentPayments = transactions
      ?.filter(t => t.payment_status === 'paid')
      ?.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      ?.slice(0, 5) || [];

    const recentCustomers = customers
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      ?.slice(0, 5) || [];

    return {
      totalCustomers: customers?.length || 0,
      totalPartners: partners?.length || 0,
      totalBatteries: batteries?.length || 0,
      overdueCount: overdueCustomerIds.size,
      overdueTransactions,
      recentPayments,
      recentCustomers,
    };
  }, [customers, partners, batteries, transactions]);

  // Memoized formatters for better performance
  const formatCurrency = useMemo(() => (amount: number) => `₹${amount.toLocaleString('en-IN')}`, []);
  const formatDate = useMemo(() => (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const AppSidebar = () => {
    const { setOpenMobile, isMobile } = useSidebar();

    const handleMenuItemClick = (key: string) => {
      setActiveSection(key);
      if (isMobile) {
        setOpenMobile(false);
      }
    };

    return (
      <Sidebar className="sidebar-gradient">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-base sm:text-lg font-bold mb-3 sm:mb-4 px-2 text-primary">
              ⚡ Battery Leasing
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={activeSection === item.key}
                      className="w-full justify-start"
                    >
                      <button 
                        className="flex items-center space-x-2 sm:space-x-3 w-full p-2 sm:p-3 text-left"
                        onClick={() => handleMenuItemClick(item.key)}
                      >
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate text-sm sm:text-base">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <div className="mt-auto p-3 sm:p-4">
            <Button 
              variant="outline" 
              className="w-full justify-start text-sm" 
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="truncate">Sign Out</span>
            </Button>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Overview of your battery leasing business</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <AddCustomerModal />
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Stats Cards - Enhanced Professional Design */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">Total Customers</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalCustomers}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">+12% from last month</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-shrink-0 ml-3 shadow-lg">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">Total Partners</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalPartners}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">+5% from last month</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex-shrink-0 ml-3 shadow-lg">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">Total Batteries</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.totalBatteries}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium">Active inventory</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex-shrink-0 ml-3 shadow-lg">
                      <Battery className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">Overdue Customers</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.overdueCount}</p>
                      <div className="flex items-center mt-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                        <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium">Needs attention</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex-shrink-0 ml-3 shadow-lg">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Overdue Payments - Enhanced List Format */}
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600 dark:text-red-400" />
                    Overdue Payments
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Payments that require immediate attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {stats.overdueTransactions.length > 0 ? (
                      stats.overdueTransactions.slice(0, 5).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-800/30">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <div className="p-1 sm:p-1.5 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
                              <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate text-gray-900 dark:text-gray-100">{transaction.customers?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                Due: {transaction.due_date ? formatDate(transaction.due_date) : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-xs sm:text-sm text-red-600 dark:text-red-400">{formatCurrency(transaction.amount)}</p>
                            <Badge variant="destructive" className="text-xs">Overdue</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-xs sm:text-sm">No overdue payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Payments - Enhanced List Format */}
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="flex items-center text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600 dark:text-green-400" />
                    Recent Payments
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Latest successful payments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    {stats.recentPayments.length > 0 ? (
                      stats.recentPayments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-800/30">
                          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                            <div className="p-1 sm:p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full flex-shrink-0">
                              <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs sm:text-sm truncate text-gray-900 dark:text-gray-100">{payment.customers?.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                                {payment.transaction_type} • {formatDate(payment.transaction_date)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="font-semibold text-xs sm:text-sm text-green-600 dark:text-green-400">{formatCurrency(payment.amount)}</p>
                            <Badge variant="secondary" className="text-xs">Paid</Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-4 sm:py-6 text-xs sm:text-sm">No recent payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Customers - Enhanced List Format */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3">
                <div>
                  <CardTitle className="flex items-center text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Recent Customers
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Recently added customers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('customers')} className="text-xs sm:text-sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {stats.recentCustomers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="p-1 sm:p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex-shrink-0">
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate text-gray-900 dark:text-gray-100">{customer.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <Badge variant={customer.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                          {customer.status}
                        </Badge>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Battery Overview - Enhanced List Format */}
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between pb-2 sm:pb-3">
                <div>
                  <CardTitle className="flex items-center text-base sm:text-lg text-gray-900 dark:text-gray-100">
                    <Battery className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Battery Overview
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">All batteries in your inventory</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('batteries')} className="text-xs sm:text-sm">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {batteries?.slice(0, 5)?.map((battery) => (
                    <div key={battery.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border dark:border-gray-700">
                      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                        <div className="p-1 sm:p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex-shrink-0">
                          <Battery className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate text-gray-900 dark:text-gray-100">{battery.serial_number}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{battery.model_name || battery.model}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="flex items-center justify-end mb-1">
                          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                            battery.status === 'available' ? 'bg-green-500' : 
                            battery.status === 'assigned' ? 'bg-blue-500' : 'bg-orange-500'
                          }`}></div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {battery.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {battery.created_at ? formatDate(battery.created_at) : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'batteries':
        return <BatteryTable batteries={batteries || []} onBatteryClick={() => {}} />;
      case 'partners':
        return <PartnerTable />;
      case 'customers':
        return <CustomerTable isAdmin={true} />;
      case 'payments':
        return <BillingDashboard />;
      case 'reports':
        return (
          <div className="text-center py-8 sm:py-12">
            <FileText className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Reports</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Reports feature coming soon</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-8 sm:py-12">
            <Settings className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Settings</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Settings feature coming soon</p>
          </div>
        );
      default:
        return <div className="text-center py-8 sm:py-12 text-sm sm:text-base">Section under development</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full dashboard-bg">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <div className="dashboard-header px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-3 sm:space-x-4 ml-auto">
                <ThemeToggle />
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="status-indicator status-online">
                    <span className="text-sm sm:text-base font-medium truncate">Welcome, {user?.name || user?.username}</span>
                  </div>
                  <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                    Admin User
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 overflow-auto custom-scrollbar">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
