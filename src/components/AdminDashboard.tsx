
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Battery, Users, User, CreditCard, Home, Plus, Settings, LogOut } from 'lucide-react';
import BatteryTable from './BatteryTable';
import PartnerTable from './PartnerTable';
import CustomerTable from './CustomerTable';
import TransactionTable from './TransactionTable';

interface AdminDashboardProps {
  onRoleChange: () => void;
}

const AdminDashboard = ({ onRoleChange }: AdminDashboardProps) => {
  const [activeSection, setActiveSection] = useState('overview');

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
          <SidebarGroupLabel className="text-lg font-semibold text-gray-800 mb-4">
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
            onClick={onRoleChange}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Switch Role
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
              <p className="text-gray-600">Welcome back! Here's what's happening with your battery management platform.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.change} from last month</p>
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
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-100 text-green-800">New</Badge>
                      <span className="text-sm">Partner "TechCorp" added 15 new batteries</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-blue-100 text-blue-800">Update</Badge>
                      <span className="text-sm">Customer payment of $2,450 received</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-orange-100 text-orange-800">Maintenance</Badge>
                      <span className="text-sm">3 batteries scheduled for service</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Battery
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Register Partner
                  </Button>
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
        <main className="flex-1">
          <div className="border-b bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <SidebarTrigger />
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Admin Portal</span>
                <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
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

export default AdminDashboard;
