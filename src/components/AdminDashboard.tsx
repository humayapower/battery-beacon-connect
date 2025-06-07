import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Battery, Users, User, CreditCard, Home, Plus, Settings, LogOut, TrendingUp, TrendingDown, Calendar, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { usePartners } from '@/hooks/usePartners';
import { useTransactions } from '@/hooks/useTransactions';
import { ThemeToggle } from './ThemeToggle';
import BatteryTable from './BatteryTable';
import PartnerTable from './PartnerTable';
import CustomerTable from './CustomerTable';
import TransactionTable from './TransactionTable';
import BillingDashboard from './BillingDashboard';
import CreatePartnerModal from './CreatePartnerModal';
import AssignBatteryModal from './AssignBatteryModal';
import AddBatteryModal from './AddBatteryModal';
import AddCustomerModal from './AddCustomerModal';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { signOut, user } = useAuth();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { partners } = usePartners();
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

  // Calculate live stats
  const totalCustomers = customers?.length || 0;
  const totalPartners = partners?.length || 0;
  const totalBatteries = batteries?.length || 0;
  
  // Calculate overdue payments
  const now = new Date();
  const overdueTransactions = transactions?.filter(t => 
    t.payment_status === 'overdue' || 
    (t.payment_status === 'due' && t.due_date && new Date(t.due_date) < now)
  ) || [];
  
  // Recent payments (last 5)
  const recentPayments = transactions
    ?.filter(t => t.payment_status === 'paid')
    ?.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    ?.slice(0, 5) || [];

  // Recent customers (last 5)
  const recentCustomers = customers
    ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    ?.slice(0, 5) || [];

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const AppSidebar = () => (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-4 px-2">
            Battery Leasing
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={activeSection === item.key}
                    onClick={() => setActiveSection(item.key)}
                    className="w-full justify-start"
                  >
                    <button className="flex items-center space-x-3 w-full p-3 text-left">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="truncate">Sign Out</span>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Overview of your battery leasing business</p>
              </div>
              <div className="flex gap-2">
                <AddCustomerModal />
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-3xl font-bold">{totalCustomers}</p>
                      <p className="text-sm text-green-600">+12% from last month</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Partners</p>
                      <p className="text-3xl font-bold">{totalPartners}</p>
                      <p className="text-sm text-green-600">+5% from last month</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Batteries</p>
                      <p className="text-3xl font-bold">{totalBatteries}</p>
                      <p className="text-sm text-green-600">+10% from last month</p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Battery className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Overdue Payments</p>
                      <p className="text-3xl font-bold">{overdueTransactions.length}</p>
                      <p className="text-sm text-red-600">-2% from last month</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Payments */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Payments</CardTitle>
                      <CardDescription>Recent payments from your customers</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveSection('payments')}>
                      View all payments
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentPayments.length > 0 ? (
                        recentPayments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-full">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">{payment.customers?.name || 'Unknown Customer'}</p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {payment.transaction_type} Payment • {formatDate(payment.transaction_date)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No recent payments</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Overdue Payments */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Overdue Payments</CardTitle>
                    <CardDescription>Customers with overdue payments</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveSection('payments')}>
                    View all overdue
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {overdueTransactions.length > 0 ? (
                      overdueTransactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{transaction.customers?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">
                              Due on {transaction.due_date ? formatDate(transaction.due_date) : 'N/A'}
                            </p>
                          </div>
                          <p className="font-semibold text-red-600">{formatCurrency(transaction.amount)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No overdue payments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Recent Customers
                  </CardTitle>
                  <CardDescription>Recently added customers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('customers')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Payment Type</TableHead>
                      <TableHead>Battery</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            <p className="text-sm text-gray-500">{customer.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {customer.payment_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {customer.batteries?.serial_number || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                            {customer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Battery Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Battery className="w-5 h-5 mr-2" />
                    Battery Overview
                  </CardTitle>
                  <CardDescription>All batteries in your inventory</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveSection('batteries')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Serial Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Installation Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batteries?.slice(0, 5)?.map((battery) => (
                      <TableRow key={battery.id}>
                        <TableCell className="font-medium">{battery.serial_number}</TableCell>
                        <TableCell>{battery.model_name || battery.model}</TableCell>
                        <TableCell>{battery.customer_id ? 'Assigned' : 'Available'}</TableCell>
                        <TableCell>
                          {battery.created_at ? formatDate(battery.created_at) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              battery.status === 'available' ? 'bg-green-500' : 
                              battery.status === 'assigned' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}></div>
                            <span className="capitalize">{battery.status}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        );
      case 'batteries':
        return <BatteryTable isAdmin={true} />;
      case 'partners':
        return <PartnerTable />;
      case 'customers':
        return <CustomerTable isAdmin={true} />;
      case 'payments':
        return <BillingDashboard />;
      case 'reports':
        return (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Reports</h3>
            <p className="text-muted-foreground">Reports feature coming soon</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-12">
            <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground">Settings feature coming soon</p>
          </div>
        );
      default:
        return <div className="text-center py-12">Section under development</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <div className="border-b px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-4 ml-auto">
                <ThemeToggle />
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-8 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                  <Users className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Welcome, {user?.name || user?.username}</span>
                  <Badge>Admin User</Badge>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 lg:p-6 overflow-auto">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
