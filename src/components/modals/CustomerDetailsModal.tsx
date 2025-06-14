import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Calendar, Battery, CreditCard, Edit, Trash2, ArrowRightLeft } from 'lucide-react';
import { useCustomers, CustomerWithBattery } from '@/hooks/useCustomers';
import CustomerBillingPage from '../features/customer/CustomerBillingPage';
import ChangeBatteryModal from './ChangeBatteryModal';

interface CustomerDetailsModalProps {
  customerId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerDetailsModal = ({ customerId, isOpen, onClose }: CustomerDetailsModalProps) => {
  const [customer, setCustomer] = useState<CustomerWithBattery | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [showChangeBattery, setShowChangeBattery] = useState(false);
  const { getCustomerById } = useCustomers();

  const fetchCustomer = async () => {
    if (!customerId) return;
    setLoading(true);
    const result = await getCustomerById(customerId);
    if (result.success) {
      setCustomer(result.data);
    } else {
      console.error("Failed to fetch customer details:", result.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleViewBilling = () => {
    setShowBilling(true);
  };

  const handleChangeBattery = () => {
    setShowChangeBattery(true);
  };

  const handleBatteryChangeSuccess = () => {
    // Refresh customer data after battery change
    fetchCustomer();
  };

  if (showBilling && customer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBilling(false)}
              className="mb-2"
            >
              ← Back to Details
            </Button>
          </DialogHeader>
          <CustomerBillingPage customerId={customer.id} customerName={customer.name} />
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOpen || !customerId) return null;

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Loading Customer Details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!customer) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load customer details.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Customer Details - {customer.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleViewBilling} className="bg-green-600 hover:bg-green-700">
                <CreditCard className="w-4 h-4 mr-2" />
                View Billing
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Customer
              </Button>
              {customer.battery_id && (
                <Button 
                  variant="outline" 
                  onClick={handleChangeBattery}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <ArrowRightLeft className="w-4 h-4 mr-2" />
                  Change Battery
                </Button>
              )}
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Customer
              </Button>
            </div>

            {/* Payment Plan Information */}
            {customer.payment_type && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Plan Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Payment Type:</span>
                      <p className="text-lg font-semibold capitalize">{customer.payment_type}</p>
                    </div>
                    
                    {customer.payment_type === 'emi' && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                          <p className="text-lg font-semibold">₹{customer.total_amount?.toLocaleString('en-IN') || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Down Payment:</span>
                          <p className="text-lg font-semibold">₹{customer.down_payment?.toLocaleString('en-IN') || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">EMI Amount:</span>
                          <p className="text-lg font-semibold">₹{customer.emi_amount?.toLocaleString('en-IN') || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">EMI Count:</span>
                          <p className="text-lg font-semibold">{customer.emi_count || 'N/A'} months</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">EMI Start Date:</span>
                          <p className="text-lg font-semibold">{customer.emi_start_date ? new Date(customer.emi_start_date).toLocaleDateString() : 'N/A'}</p>
                        </div>
                      </>
                    )}
                    
                    {customer.payment_type === 'monthly_rent' && (
                      <>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Monthly Rent:</span>
                          <p className="text-lg font-semibold">₹{customer.monthly_rent?.toLocaleString('en-IN') || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-500">Security Deposit:</span>
                          <p className="text-lg font-semibold">₹{customer.security_deposit?.toLocaleString('en-IN') || 'N/A'}</p>
                        </div>
                      </>
                    )}
                    
                    {customer.payment_type === 'one_time_purchase' && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Purchase Amount:</span>
                        <p className="text-lg font-semibold">₹{customer.purchase_amount?.toLocaleString('en-IN') || 'N/A'}</p>
                      </div>
                    )}
                    
                    {customer.next_due_date && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Next Due Date:</span>
                        <p className="text-lg font-semibold">{new Date(customer.next_due_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Name:</span>
                    <p className="text-lg font-semibold">{customer.name}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-lg font-semibold">
                      <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                        {customer.phone}
                      </a>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Email:</span>
                    <p className="text-lg font-semibold">
                      {customer.email ? (
                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                          {customer.email}
                        </a>
                      ) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Address:</span>
                    <p className="text-lg font-semibold">{customer.address || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Join Date:</span>
                    <p className="text-lg font-semibold">
                      {customer.join_date ? new Date(customer.join_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Battery Information */}
            {customer.batteries && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Battery className="w-5 h-5 mr-2" />
                    Battery Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Serial Number:</span>
                      <p className="text-lg font-semibold">{customer.batteries.serial_number}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Model:</span>
                      <p className="text-lg font-semibold">{customer.batteries.model}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Capacity:</span>
                      <p className="text-lg font-semibold">{customer.batteries.capacity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Battery Modal */}
      <ChangeBatteryModal
        customerId={customer?.id || null}
        currentBatteryId={customer?.battery_id || null}
        partnerId={customer?.partner_id || null}
        isOpen={showChangeBattery}
        onClose={() => setShowChangeBattery(false)}
        onSuccess={handleBatteryChangeSuccess}
      />
    </>
  );
};

export default CustomerDetailsModal;
