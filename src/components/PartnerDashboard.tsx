
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4">
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
                  >
                    <button className="flex items-center space-x-3 w-full">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
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
            className="w-full" 
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Partner Dashboard</h2>
              <p className="text-gray-600">Manage your battery inventory and customer relationships.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Battery Status Overview</CardTitle>
                  <CardDescription>Current status of your assigned batteries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                        <span className="text-sm">Ready for assignment</span>
                      </div>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>
                        <span className="text-sm">With customers</span>
                      </div>
                      <span className="font-semibold">23</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>
                        <span className="text-sm">Under service</span>
                      </div>
                      <span className="font-semibold">6</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common partner tasks</CardDescription>
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
        <main className="flex-1">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {user?.full_name || user?.username}</span>
                <Badge className="bg-green-100 text-green-800">Partner</Badge>
              </div>
            </div>
          </div>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default PartnerDashboard;
