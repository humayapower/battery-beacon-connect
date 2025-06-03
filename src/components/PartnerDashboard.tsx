
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Battery, User, CreditCard, Home, Plus, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BatteryTable from './BatteryTable';
import CustomerTable from './CustomerTable';
import TransactionTable from './TransactionTable';

const PartnerDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const { signOut, user } = useAuth();

  const menuItems = [
    { title: "Overview", icon: Home, key: "overview" },
    { title: "My Batteries", icon: Battery, key: "batteries" },
    { title: "Customers", icon: User, key: "customers" },
    { title: "Transactions", icon: CreditCard, key: "transactions" },
  ];

  const stats = [
    { title: "Assigned Batteries", value: "47", change: "+3 this week", icon: Battery, color: "bg-blue-500" },
    { title: "Active Customers", value: "23", change: "+2 new", icon: User, color: "bg-green-500" },
    { title: "Monthly Revenue", value: "$12,850", change: "+15%", icon: CreditCard, color: "bg-purple-500" },
  ];

  const AppSidebar = () => (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4 px-2">
            Partner Portal
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
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Partner Dashboard</h2>
              <p className="text-sm lg:text-base text-gray-600">Manage your battery inventory and customer relationships.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-gray-600 truncate">{stat.title}</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs lg:text-sm text-green-600">{stat.change}</p>
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
                  <CardTitle className="text-lg lg:text-xl">Battery Status Overview</CardTitle>
                  <CardDescription className="text-sm lg:text-base">Current status of your assigned batteries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0">Available</Badge>
                        <span className="text-sm truncate">Ready for assignment</span>
                      </div>
                      <span className="font-semibold ml-2">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-blue-100 text-blue-800 flex-shrink-0">Assigned</Badge>
                        <span className="text-sm truncate">With customers</span>
                      </div>
                      <span className="font-semibold ml-2">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Badge className="bg-orange-100 text-orange-800 flex-shrink-0">Maintenance</Badge>
                        <span className="text-sm truncate">Under service</span>
                      </div>
                      <span className="font-semibold ml-2">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg lg:text-xl">Quick Actions</CardTitle>
                  <CardDescription className="text-sm lg:text-base">Common partner tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Assign Battery to Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <User className="w-4 h-4 mr-2" />
                    Add New Customer
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
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
                <Badge className="bg-green-100 text-green-800 text-xs">Partner</Badge>
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

export default PartnerDashboard;
