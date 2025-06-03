
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Battery, Users, User, CreditCard, Home, Plus, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BatteryTable from './BatteryTable';
import PartnerTable from './PartnerTable';
import CustomerTable from './CustomerTable';
import TransactionTable from './TransactionTable';
import CreatePartnerModal from './CreatePartnerModal';
import AssignBatteryModal from './AssignBatteryModal';
import AddBatteryModal from './AddBatteryModal';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { signOut, user } = useAuth();

  const menuItems = [
    { title: "Overview", icon: Home, key: "overview" },
    { title: "Batteries", icon: Battery, key: "batteries" },
    { title: "Partners", icon: Users, key: "partners" },
    { title: "Customers", icon: User, key: "customers" },
    { title: "Transactions", icon: CreditCard, key: "transactions" },
    { title: "Settings", icon: Settings, key: "settings" },
  ];

  const stats = [
    { title: "Total Batteries", value: "248", change: "+12%", icon: Battery, color: "bg-blue-500" },
    { title: "Active Partners", value: "32", change: "+5%", icon: Users, color: "bg-green-500" },
    { title: "Total Customers", value: "1,847", change: "+18%", icon: User, color: "bg-purple-500" },
    { title: "Monthly Revenue", value: "$48,293", change: "+23%", icon: CreditCard, color: "bg-orange-500" },
  ];

  const AppSidebar = () => (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4 px-2">
            Admin Dashboard
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
          <div className="space-y-4 lg:space-y-6">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-sm lg:text-base text-gray-600">Welcome back! Here's what's happening with your battery management platform.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs lg:text-sm text-green-600">{stat.change} from last month</p>
                      </div>
                      <div className={`p-2 lg:p-3 rounded-full ${stat.color} flex-shrink-0 ml-3`}>
                        <stat.icon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">Recent Activity</CardTitle>
                  <CardDescription className="text-sm lg:text-base">Latest updates across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <Badge className="bg-green-100 text-green-800 w-fit">New</Badge>
                      <span className="text-sm">Partner "TechCorp" added 15 new batteries</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <Badge className="bg-blue-100 text-blue-800 w-fit">Update</Badge>
                      <span className="text-sm">Customer payment of $2,450 received</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <Badge className="bg-orange-100 text-orange-800 w-fit">Maintenance</Badge>
                      <span className="text-sm">3 batteries scheduled for service</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
                  <CardDescription className="text-sm lg:text-base">Common admin tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <AddBatteryModal />
                  <AssignBatteryModal />
                  <CreatePartnerModal />
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Payment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'batteries':
        return <BatteryTable isAdmin={true} />;
      case 'partners':
        return <PartnerTable />;
      case 'customers':
        return <CustomerTable isAdmin={true} />;
      case 'transactions':
        return <TransactionTable isAdmin={true} />;
      default:
        return <div className="text-center py-12">Section under development</div>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="border-b bg-white px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="lg:hidden" />
              <div className="flex items-center space-x-2 lg:space-x-4 ml-auto">
                <span className="text-xs lg:text-sm text-gray-600 truncate">Welcome, {user?.name || user?.username}</span>
                <Badge className="bg-blue-100 text-blue-800 text-xs">Admin</Badge>
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
