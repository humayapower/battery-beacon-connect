
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Smartphone,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  
  const [profileSettings, setProfileSettings] = useState({
    companyName: 'Humaya Power Solutions',
    contactEmail: 'admin@humayapower.com',
    phone: '+91 9876543210',
    address: 'Mumbai, Maharashtra, India',
    website: 'www.humayapower.com',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowBatteryAlerts: true,
    paymentReminders: true,
    maintenanceAlerts: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    autoBackup: true,
    maintenanceMode: false,
  });

  const tabs = [
    { id: 'profile', name: 'Company Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database },
  ];

  const handleSaveSettings = (section: string) => {
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    });
  };

  const renderProfileSettings = () => (
    <Card className="border-2 bg-white/90 backdrop-blur-sm border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-600" />
          <span>Company Profile</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="companyName" className="text-gray-700 font-medium">Company Name</Label>
            <Input
              id="companyName"
              value={profileSettings.companyName}
              onChange={(e) => setProfileSettings(prev => ({ ...prev, companyName: e.target.value }))}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="contactEmail" className="text-gray-700 font-medium">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={profileSettings.contactEmail}
              onChange={(e) => setProfileSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-gray-700 font-medium">Phone Number</Label>
            <Input
              id="phone"
              value={profileSettings.phone}
              onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
          <div>
            <Label htmlFor="website" className="text-gray-700 font-medium">Website</Label>
            <Input
              id="website"
              value={profileSettings.website}
              onChange={(e) => setProfileSettings(prev => ({ ...prev, website: e.target.value }))}
              className="border-gray-300 focus:border-blue-500"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="address" className="text-gray-700 font-medium">Company Address</Label>
          <Textarea
            id="address"
            value={profileSettings.address}
            onChange={(e) => setProfileSettings(prev => ({ ...prev, address: e.target.value }))}
            rows={3}
            className="border-gray-300 focus:border-blue-500"
          />
        </div>
        <Button 
          onClick={() => handleSaveSettings('Profile')}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Profile Settings
        </Button>
      </CardContent>
    </Card>
  );

  const renderNotificationSettings = () => (
    <Card className="border-2 bg-white/90 backdrop-blur-sm border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Notification Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-800">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via email</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-800">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive notifications via SMS</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings.smsNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-800">Push Notifications</p>
                <p className="text-sm text-gray-600">Receive browser push notifications</p>
              </div>
            </div>
            <Switch
              checked={notificationSettings.pushNotifications}
              onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Alert Types</h4>
          
          {[
            { key: 'lowBatteryAlerts', label: 'Low Battery Alerts', description: 'Get notified when batteries need attention' },
            { key: 'paymentReminders', label: 'Payment Reminders', description: 'Automated payment reminder notifications' },
            { key: 'maintenanceAlerts', label: 'Maintenance Alerts', description: 'Notifications for scheduled maintenance' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">{item.label}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
              <Switch
                checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))}
              />
            </div>
          ))}
        </div>

        <Button 
          onClick={() => handleSaveSettings('Notification')}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Notification Settings
        </Button>
      </CardContent>
    </Card>
  );

  const renderSecuritySettings = () => (
    <Card className="border-2 bg-white/90 backdrop-blur-sm border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-600" />
          <span>Security Settings</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-gray-800 mb-2">Password Security</h4>
            <p className="text-sm text-gray-600 mb-4">Last changed: 30 days ago</p>
            <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-50">
              Change Password
            </Button>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-2">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
            <Badge className="bg-green-100 text-green-800 border-green-200">Enabled</Badge>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">Active Sessions</h4>
            <p className="text-sm text-gray-600 mb-4">Monitor and manage your active login sessions</p>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
              View Sessions
            </Button>
          </div>
        </div>

        <Button 
          onClick={() => handleSaveSettings('Security')}
          className="bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </Button>
      </CardContent>
    </Card>
  );

  const renderSystemSettings = () => (
    <Card className="border-2 bg-white/90 backdrop-blur-sm border-gray-200">
      <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>System Configuration</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="timezone" className="text-gray-700 font-medium">Timezone</Label>
            <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, timezone: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="currency" className="text-gray-700 font-medium">Currency</Label>
            <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                <SelectItem value="USD">US Dollar ($)</SelectItem>
                <SelectItem value="EUR">Euro (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dateFormat" className="text-gray-700 font-medium">Date Format</Label>
            <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, dateFormat: value }))}>
              <SelectTrigger className="border-gray-300 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-medium text-gray-800">Auto Backup</p>
              <p className="text-sm text-gray-600">Automatically backup data daily</p>
            </div>
            <Switch
              checked={systemSettings.autoBackup}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoBackup: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
            <div>
              <p className="font-medium text-gray-800">Maintenance Mode</p>
              <p className="text-sm text-gray-600">Enable maintenance mode for system updates</p>
            </div>
            <Switch
              checked={systemSettings.maintenanceMode}
              onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <Button 
            onClick={() => handleSaveSettings('System')}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save System Settings
          </Button>
          <Button 
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Settings
          </h2>
          <p className="text-base lg:text-lg text-gray-600">
            Configure your system preferences and account settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-2 bg-white/90 backdrop-blur-sm border-gray-200">
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'system' && renderSystemSettings()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
