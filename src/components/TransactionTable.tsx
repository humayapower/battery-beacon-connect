
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CreditCard } from 'lucide-react';

interface TransactionTableProps {
  isAdmin: boolean;
}

const TransactionTable = ({ isAdmin }: TransactionTableProps) => {
  const transactions = [
    { id: "TXN-001", date: "2024-05-30", customer: "John Smith", partner: "TechCorp", amount: "$450.00", type: "Monthly Lease", status: "Completed", batteryId: "BAT-002" },
    { id: "TXN-002", date: "2024-05-28", customer: "Sarah Johnson", partner: "GreenEnergy", amount: "$520.00", type: "Monthly Lease", status: "Completed", batteryId: "BAT-005" },
    { id: "TXN-003", date: "2024-05-25", customer: "Mike Davis", partner: "TechCorp", amount: "$450.00", type: "Monthly Lease", status: "Pending", batteryId: "BAT-007" },
    { id: "TXN-004", date: "2024-05-23", customer: "Emily Chen", partner: "PowerSolutions", amount: "$680.00", type: "Monthly Lease", status: "Completed", batteryId: "BAT-012" },
    { id: "TXN-005", date: "2024-05-20", customer: "John Smith", partner: "TechCorp", amount: "$150.00", type: "Maintenance Fee", status: "Completed", batteryId: "BAT-002" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTransactions = isAdmin ? transactions : transactions.filter(transaction => transaction.partner === "TechCorp");

  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'Completed')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace('$', '').replace(',', '')), 0);

  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace('$', '').replace(',', '')), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{isAdmin ? 'All Transactions' : 'My Transactions'}</h2>
          <p className="text-gray-600">
            {isAdmin ? 'View all payment transactions across partners' : 'Track your customer payments and billing'}
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">${pendingAmount.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Pending Payments</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredTransactions.length}</div>
            <div className="text-sm text-gray-600">Total Transactions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredTransactions.filter(t => t.status === 'Completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  {isAdmin && <TableHead>Partner</TableHead>}
                  <TableHead>Battery ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{transaction.id}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.customer}</TableCell>
                    {isAdmin && <TableCell>{transaction.partner}</TableCell>}
                    <TableCell>{transaction.batteryId}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell className="font-semibold">{transaction.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <CreditCard className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionTable;
