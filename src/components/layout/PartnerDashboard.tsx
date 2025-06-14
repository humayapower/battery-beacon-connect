
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from "@/components/ui/sidebar";
import { Battery, User, CreditCard, Home, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBatteries } from '@/hooks/useBatteries';
import { useCustomers } from '@/hooks/useCustomers';
import { useTransactions } from '@/hooks/useTransactions';
import BatteryTable from '../features/battery/BatteryTable';
import CustomerTable from '../features/customer/CustomerTable';
import TransactionTable from '../features/billing/TransactionTable';

const PartnerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { signOut, user } = useAuth();
  const { batteries } = useBatteries();
  const { customers } = useCustomers();
  const { transactions } = useTransactions();

  const menuItems = [
    { title: "Overview", icon: Home, key: "overview" },
    { title: "My Batteries", icon: Battery, key: "batteries" },
    { title: "Customers", icon: User, key: "customers" },
    { title: "Transactions", icon: CreditCard, key: "transactions" },
  ];

  // Calculate live stats (filtered for partner if needed)
  const partnerBatteries = batteries?.filter(b => b.partner_id === user?.id) || [];
  const partnerCustomers = customers?.filter(c => c.partner_id === user?.id) || [];
  const partnerTransactions = transactions?.filter(t => t.partner_id === user?.id) || [];

  const totalBatteries = partnerBatteries.length;
  const availableBatteries = partnerBatteries.filter(b => b.status === 'available').length;
  const assignedBatteries = partnerBatteries.filter(b => b.status === 'assigned').length;
  const maintenanceBatteries = partnerBatteries.filter(b => b.status === 'maintenance').length;
  
  const totalCustomers = partnerCustomers.length;
  const activeCustomers = partnerCustomers.filter(c => c.status === 'active').length;
  
  const monthlyRevenue = partnerTransactions.filter(t => t.payment_status === 'paid').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { title: "Assigned Batteries", value: totalBatteries.toString(), change: `${availableBatteries} available`, icon: Battery, color: "bg-blue-500" },
    { title: "Active Customers", value: activeCustomers.toString(), change: `${totalCustomers} total`, icon: User, color: "bg-green-500" },
    { title: "Monthly Revenue", value: `₹${monthlyRevenue.toLocaleString()}`, change: "Total earned", icon: CreditCard, color: "bg-purple-500" },
  ];

  const AppSidebar = () => {
    const { setOpenMobile, isMobile } = useSidebar();

    const handleMenuItemClick = (key: string) => {
      setActiveSection(key);
      // Close mobile sidebar when a menu item is clicked
      if (isMobile) {
        setOpenMobile(false);
      }
    };

    return (
      <Sidebar className="sidebar-gradient">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-base sm:text-lg font-bold mb-3 sm:mb-4 px-2 text-primary">
              🤝 Partner Portal
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
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
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
            <div className="px-3 sm:px-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Partner Dashboard</h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">Manage your battery inventory and customer relationships.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-3 sm:px-0">
              {stats.map((stat, index) => (
                <Card key={index} className="stat-card glass-card hover:shadow-2xl transition-all duration-300 border-0">
                  <CardContent className="p-4 sm:p-5 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide truncate">{stat.title}</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">{stat.change}</p>
                        </div>
                      </div>
                      <div className={`p-3 sm:p-4 rounded-2xl ${stat.color.replace('bg-', 'bg-gradient-to-br from-').replace('-500', '-500 to-').replace('blue-500 to-', 'blue-500 to-blue-600').replace('green-500 to-', 'green-500 to-green-600').replace('purple-500 to-', 'purple-500 to-purple-600')} flex-shrink-0 ml-3 shadow-lg`}>
                        <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 px-3 sm:px-0">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg xl:text-xl">Battery Status Overview</CardTitle>
                  <CardDescription className="text-xs sm:text-sm lg:text-base">Current status of your assigned batteries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0 text-xs">Available</Badge>
                        <span className="text-xs sm:text-sm truncate">Ready for assignment</span>
                      </div>
                      <span className="font-semibold ml-2 text-sm sm:text-base">{availableBatteries}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-blue-100 text-blue-800 flex-shrink-0 text-xs">Assigned</Badge>
                        <span className="text-xs sm:text-sm truncate">With customers</span>
                      </div>
                      <span className="font-semibold ml-2 text-sm sm:text-base">{assignedBatteries}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-orange-100 text-orange-800 flex-shrink-0 text-xs">Maintenance</Badge>
                        <span className="text-xs sm:text-sm truncate">Under service</span>
                      </div>
                      <span className="font-semibold ml-2 text-sm sm:text-base">{maintenanceBatteries}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-xl">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg xl:text-xl">Quick Actions</CardTitle>
                  <CardDescription className="text-xs sm:text-sm lg:text-base">Common partner tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  <Button className="w-full justify-start text-xs sm:text-sm" variant="outline">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Assign Battery to Customer
                  </Button>
                  <Button className="w-full justify-start text-xs sm:text-sm" variant="outline">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Add New Customer
                  </Button>
                  <Button className="w-full justify-start text-xs sm:text-sm" variant="outline">
                    <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Record Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'batteries':
        return <BatteryTable isAdmin={false} />;
      case 'customers':
        return <CustomerTable isAdmin={false} />;
      case 'transactions':
        return <TransactionTable isAdmin={false} />;
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
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 ml-auto">
                <div className="status-indicator status-online">
                  <span className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300 truncate">Welcome, {user?.name || user?.username}</span>
                </div>
                <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                  Partner
                </Badge>
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

export default PartnerDashboard;
