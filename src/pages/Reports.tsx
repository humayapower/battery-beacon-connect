
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, TrendingUp, Users, Battery, DollarSign, Calendar } from 'lucide-react';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportTypes = [
    { id: 'overview', name: 'Business Overview', icon: TrendingUp },
    { id: 'customers', name: 'Customer Report', icon: Users },
    { id: 'batteries', name: 'Battery Report', icon: Battery },
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign },
  ];

  const mockData = {
    totalCustomers: 245,
    totalBatteries: 180,
    totalRevenue: 450000,
    activePartners: 15,
    recentTransactions: [
      { id: 1, customer: 'John Doe', amount: 5500, date: '2024-01-15', type: 'EMI' },
      { id: 2, customer: 'Jane Smith', amount: 3200, date: '2024-01-14', type: 'Monthly Rent' },
      { id: 3, customer: 'Mike Johnson', amount: 12000, date: '2024-01-13', type: 'Full Purchase' },
    ]
  };

  const handleDownloadReport = (reportType: string) => {
    // Mock download functionality
    console.log(`Downloading ${reportType} report for ${selectedPeriod}`);
  };

  return (
    <div className="space-y-6 p-4 lg:p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Reports & Analytics
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Generate comprehensive reports and insights for your business
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white border-gray-300">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => handleDownloadReport(selectedReport)}
            className="bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-1">{mockData.totalCustomers}</div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Customers</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-green-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Battery className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-1">{mockData.totalBatteries}</div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Batteries</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-1">₹{mockData.totalRevenue.toLocaleString()}</div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Total Revenue</div>
          </CardContent>
        </Card>
        
        <Card className="border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-orange-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-1">{mockData.activePartners}</div>
            <div className="text-sm lg:text-base text-gray-600 font-medium">Active Partners</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {reportTypes.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card 
              key={report.id} 
              className={`border-2 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer ${
                selectedReport === report.id ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <IconComponent className={`w-12 h-12 ${selectedReport === report.id ? 'text-blue-600' : 'text-gray-500'}`} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{report.name}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadReport(report.id);
                  }}
                  className="w-full hover:bg-blue-50 border-blue-200 text-blue-700"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <Card className="border-2 shadow-xl bg-white/90 backdrop-blur-sm border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-xl font-semibold text-gray-800">Recent Transactions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{transaction.customer}</p>
                    <p className="text-sm text-gray-600">{transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">₹{transaction.amount.toLocaleString()}</p>
                  <Badge variant="outline" className="border-blue-200 text-blue-700">
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
