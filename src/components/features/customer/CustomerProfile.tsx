import React, { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, User, Calendar, CreditCard, Battery, Users, Edit, Plus, TrendingUp, Receipt, DollarSign, Phone, MapPin, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { useBatteries } from '@/hooks/useBatteries';
import { useOptimizedPartners } from '@/hooks/useOptimizedPartners';
import { useBilling } from '@/hooks/useBilling';
import { useIsMobile } from '@/hooks/use-mobile';
import { BillingDetails } from '@/types/billing';
import PaymentModal from '../../modals/PaymentModal';

interface CustomerProfileProps {
  customerId: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({ 
  customerId, 
  onBack, 
  showBackButton = true 
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { customers } = useCustomers();
  const { batteries } = useBatteries();
  const { partners } = useOptimizedPartners();
  const { getBillingDetails } = useBilling();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [billingData, setBillingData] = useState<BillingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide === 0) {
      setCurrentSlide(1);
    }
    if (isRightSwipe && currentSlide === 1) {
      setCurrentSlide(0);
    }
  };

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const battery = useMemo(() => customer?.battery_id ? batteries.find(b => b.id === customer.battery_id) : null, [customer, batteries]);
  const partner = useMemo(() => customer?.partner_id ? partners.find(p => p.id === customer.partner_id) : null, [customer, partners]);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!customerId || !customer || hasFetchedRef.current) return;
      
      if (customer.payment_type === 'one_time_purchase') {
        setLoading(false);
        return;
      }
      
      hasFetchedRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBillingDetails(customerId);
        setBillingData(data);
      } catch (err: unknown) {
        console.error('Failed to fetch billing data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load billing data');
      } finally {
        setLoading(false);
      }
    };
    
    if (customer) {
      fetchBillingData();
    }
  }, [customerId, getBillingDetails, customer]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  }, [onBack, navigate]);

  const handlePaymentSuccess = useCallback(async () => {
    console.log('Payment success callback triggered for customer:', customerId);
    try {
      // Clear the cache and fetch fresh data
      hasFetchedRef.current = false;
      setLoading(true);
      setError(null);
      
      console.log('Fetching fresh billing data...');
      // Fetch fresh billing data
      const data = await getBillingDetails(customerId);
      setBillingData(data);
      
      console.log('Billing data refreshed after payment:', data);
    } catch (err: unknown) {
      console.error('Failed to refresh billing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to reload billing data');
    } finally {
      setLoading(false);
    }
  }, [customerId, getBillingDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'due':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPaymentTypeColor = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'monthly_rent':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'one_time_purchase':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getPaymentTypeLabel = (paymentType: string) => {
    switch (paymentType) {
      case 'emi':
        return 'EMI';
      case 'monthly_rent':
        return 'RENTAL';
      case 'one_time_purchase':
        return 'PURCHASE';
      default:
        return paymentType.toUpperCase();
    }
  };

  const getScheduleData = () => {
    if (!customer || !billingData) return null;

    if (customer.payment_type === 'emi') {
      return {
        type: 'emi',
        title: 'EMI Schedule',
        data: billingData.emis || [],
        icon: CreditCard
      };
    } else if (customer.payment_type === 'monthly_rent') {
      return {
        type: 'rent',
        title: 'Rent Schedule',
        data: billingData.rents || [],
        icon: Receipt
      };
    } else if (customer.payment_type === 'one_time_purchase') {
      return {
        type: 'purchase',
        title: 'Purchase Details',
        data: [],
        icon: DollarSign
      };
    }
    return null;
  };

  const scheduleData = getScheduleData();

  const renderScheduleContent = () => {
    if (!scheduleData) return null;

    if (customer.payment_type === 'one_time_purchase') {
      return (
        <div className="text-center py-6">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">One-Time Purchase</h3>
          <p className="text-sm text-muted-foreground mb-4">This customer has made a one-time purchase.</p>
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Purchase Amount</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(customer.purchase_amount || 0)}</p>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs text-muted-foreground mt-2">Loading schedule...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-6">
          <p className="text-xs text-red-600 mb-4">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              hasFetchedRef.current = false;
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      );
    }

    if (scheduleData.data.length === 0) {
      const emptyMessage = customer.payment_type === 'emi' 
        ? 'No EMI schedule available. EMI plan may not be set up yet.'
        : 'No rent schedule available. Rent charges may not be generated yet.';
      
      return (
        <div className="text-center py-6">
          <scheduleData.icon className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold mb-2">No Schedule Found</h3>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {customer.payment_type === 'emi' && billingData?.emiProgress && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-3 h-3 mr-2 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-medium">EMI Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress: {billingData.emiProgress.paid}/{billingData.emiProgress.total} EMIs paid</span>
                <span>{billingData.emiProgress.percentage}%</span>
              </div>
              <Progress value={billingData.emiProgress.percentage} className="w-full h-2" />
            </div>
          </div>
        )}

        <div className={isMobile ? "space-y-2" : "max-h-80 overflow-y-auto"}>
          {isMobile ? (
            // Mobile: Card layout for schedule items
            <div className="space-y-2">
              {scheduleData.data.slice(0, 5).map((item, index: number) => (
                <div key={item.id} className="p-3 border rounded-lg bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium">
                      {customer.payment_type === 'emi' 
                        ? `EMI ${item.emi_number}/${item.total_emi_count}`
                        : formatDate(item.rent_month)
                      }
                    </div>
                    <Badge className={`${getStatusColor(item.payment_status)} text-xs`}>
                      {item.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Amount: {formatCurrency(item.amount)}</span>
                    <span>Due: {formatDate(item.due_date)}</span>
                  </div>
                  {customer.payment_type === 'emi' && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Remaining: {formatCurrency(item.remaining_amount)}
                    </div>
                  )}
                </div>
              ))}
              {scheduleData.data.length > 5 && (
                <div className="text-center">
                  <Button variant="outline" size="sm">
                    View All ({scheduleData.data.length})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Desktop: Table layout
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">
                    {customer.payment_type === 'emi' ? 'EMI #' : 'Month'}
                  </TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  {customer.payment_type === 'emi' && (
                    <TableHead className="text-xs">Remaining</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduleData.data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">
                      {customer.payment_type === 'emi' 
                        ? `${item.emi_number}/${item.total_emi_count}`
                        : formatDate(item.rent_month)
                      }
                    </TableCell>
                    <TableCell className="text-sm">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-sm">{formatDate(item.due_date)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(item.payment_status)} text-xs`}>
                        {item.payment_status}
                      </Badge>
                    </TableCell>
                    {customer.payment_type === 'emi' && (
                      <TableCell className="text-sm">{formatCurrency(item.remaining_amount)}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  };

  const renderPaymentDetails = () => {
    if (customer.payment_type === 'emi') {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Total Amount</label>
            <p className="text-base font-semibold text-foreground">{formatCurrency(customer.total_amount || 0)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Down Payment</label>
            <p className="text-base font-semibold text-foreground">{formatCurrency(customer.down_payment || 0)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">EMI Count</label>
            <p className="text-base font-semibold text-foreground">{customer.emi_count || 'N/A'} months</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">EMI Amount</label>
            <p className="text-base font-semibold text-foreground">{formatCurrency(customer.emi_amount || 0)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">EMI Start Date</label>
            <p className="text-base font-semibold text-foreground">
              {customer.emi_start_date ? formatDate(customer.emi_start_date) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Next Due Date</label>
            <p className="text-base font-semibold text-foreground">
              {customer.next_due_date ? formatDate(customer.next_due_date) : 'N/A'}
            </p>
          </div>
        </div>
      );
    } else if (customer.payment_type === 'monthly_rent') {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Monthly Rent</label>
            <p className="text-base font-semibold text-foreground">{formatCurrency(customer.monthly_rent || 0)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Security Deposit</label>
            <p className="text-base font-semibold text-foreground">{formatCurrency(customer.security_deposit || 0)}</p>
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground">Join Date</label>
            <p className="text-base font-semibold text-foreground">
              {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
            </p>
          </div>
        </div>
      );
    } else if (customer.payment_type === 'one_time_purchase') {
      return (
        <div className={isMobile ? "space-y-4" : "space-y-3"}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Purchase Amount</label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(customer.purchase_amount || 0)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Purchase Date</label>
              <p className="text-base font-semibold text-foreground">
                {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">Payment Complete</p>
            </div>
            <p className="text-xs text-green-600 dark:text-green-500 mt-1">This customer has completed their purchase.</p>
          </div>
        </div>
      );
    }
  };

  if (!customer) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md glass-card border-0 shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Customer Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">The customer you're looking for doesn't exist or has been removed.</p>
            {showBackButton && (
              <Button onClick={handleBack} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Modern Mobile Header with Action Buttons */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between p-4">
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBack}
                className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Customer Profile</h1>
            </div>
            <div className="flex items-center gap-2">
              {customer.payment_type !== 'one_time_purchase' && (
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg px-3"
                  onClick={() => setIsPaymentModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                className="border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 rounded-lg px-3"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Swipable Customer Info & Documents Carousel */}
          <div className="relative">
            <Card className="overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-lg">
              <div 
                className="relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {/* Slide 1: Personal Information */}
                  <div className="w-full flex-shrink-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center shadow-inner">
                            {customer.customer_photo_url ? (
                              <img 
                                src={customer.customer_photo_url} 
                                alt={customer.name}
                                className="w-full h-full object-cover rounded-2xl"
                              />
                            ) : (
                              <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{customer.name}</h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Joined {customer.join_date ? formatDate(customer.join_date) : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge className={`${getStatusColor(customer.status)} rounded-full px-3 py-1 font-medium`}>
                          {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                        </Badge>
                        <Badge className={`${getPaymentTypeColor(customer.payment_type)} rounded-full px-3 py-1 font-medium`}>
                          {getPaymentTypeLabel(customer.payment_type)}
                        </Badge>
                      </div>

                      {customer.address && (
                        <div className="flex items-start gap-3 mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <MapPin className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-600 dark:text-slate-300">{customer.address}</span>
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* Slide 2: Identity Documents */}
                  <div className="w-full flex-shrink-0">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                          <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Identity Documents</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Aadhaar Front</div>
                          {customer.aadhaar_front_url ? (
                            <img 
                              src={customer.aadhaar_front_url} 
                              alt="Aadhaar Front" 
                              className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                              <User className="w-6 h-6 text-slate-400 mb-1" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Not uploaded</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Aadhaar Back</div>
                          {customer.aadhaar_back_url ? (
                            <img 
                              src={customer.aadhaar_back_url} 
                              alt="Aadhaar Back" 
                              className="w-full h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-full h-24 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                              <User className="w-6 h-6 text-slate-400 mb-1" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">Not uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={() => setCurrentSlide(currentSlide === 0 ? 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                >
                  {currentSlide === 0 ? (
                    <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
              </div>

              {/* Slide indicators */}
              <div className="flex justify-center gap-2 pb-4">
                {[0, 1].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      currentSlide === index 
                        ? 'bg-blue-600 dark:bg-blue-400' 
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </Card>
          </div>


          {/* Modern Payment Details */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                {customer.payment_type === 'emi' ? 'EMI Details' : 
                 customer.payment_type === 'monthly_rent' ? 'Rental Details' : 
                 'Purchase Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {renderPaymentDetails()}
            </CardContent>
          </Card>

          {/* Modern Schedule Section */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-0 shadow-lg rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 rounded-xl">
                  {scheduleData && <scheduleData.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />}
                </div>
                {scheduleData?.title || 'Schedule'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderScheduleContent()}
            </CardContent>
          </Card>

          {/* Modern Battery and Partner Info */}
          {(battery || partner) && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 rounded-xl">
                    <Battery className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {battery && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3 text-blue-800 dark:text-blue-300 flex items-center gap-2">
                      <Battery className="w-4 h-4" />
                      Assigned Battery
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                        <Battery className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{battery.serial_number}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{battery.model} - {battery.capacity}</p>
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 text-xs mt-1 rounded-full">
                          {battery.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {partner && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-4 rounded-xl">
                    <h4 className="font-semibold mb-3 text-green-800 dark:text-green-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned Partner
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{partner.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{partner.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Modern Payment Ledger - Only show for EMI and Rental customers */}
          {customer.payment_type !== 'one_time_purchase' && !loading && billingData?.ledger && billingData.ledger.length > 0 && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-xl">
                    <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  Payment Ledger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData.ledger.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{formatDate(entry.payment_date)}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                            {entry.payment_type} {entry.remarks && `- ${entry.remarks}`}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 capitalize">
                            {entry.payment_mode}
                            {entry.reference_number && ` • Ref: ${entry.reference_number}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(entry.amount_paid)}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Balance: {formatCurrency(entry.running_balance)}
                        </div>
                      </div>
                    </div>
                  ))}
                  {billingData.ledger.length > 5 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" className="rounded-xl border-2">
                        View Full Ledger ({billingData.ledger.length})
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modern Recent Transactions - Only show for EMI and Rental customers */}
          {customer.payment_type !== 'one_time_purchase' && !loading && billingData?.transactions && billingData.transactions.length > 0 && (
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                  <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/50 dark:to-emerald-900/50 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {billingData.transactions.slice(0, 3).map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">{formatDate(transaction.transaction_date)}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 capitalize">{transaction.transaction_type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(transaction.amount)}</div>
                        <Badge className={`${getStatusColor(transaction.payment_status)} text-xs rounded-full`}>
                          {transaction.payment_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {billingData.transactions.length > 3 && (
                    <div className="text-center pt-2">
                      <Button variant="outline" size="sm" className="rounded-xl border-2">
                        View All Transactions
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}


          {/* Payment Modal */}
          {customer.payment_type !== 'one_time_purchase' && (
            <PaymentModal
              isOpen={isPaymentModalOpen}
              onClose={() => setIsPaymentModalOpen(false)}
              customerId={customerId}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  // Desktop version remains unchanged
  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      {showBackButton && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 sm:p-6 rounded-2xl glass-card border-0 shadow-lg">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-3 hover:bg-white/50 dark:hover:bg-black/20 rounded-xl transition-all duration-200 flex items-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200">Back</span>
            </button>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                👤 {customer.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Customer Profile</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(customer.status)} border-0 font-semibold shadow-sm`}>
                {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
              </Badge>
              <Badge className={`${getPaymentTypeColor(customer.payment_type)} border-0 font-semibold shadow-sm`}>
                {getPaymentTypeLabel(customer.payment_type)}
              </Badge>
              {customer.payment_type !== 'one_time_purchase' && (
                <Button 
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
              )}
              <Button variant="outline" size="sm" className="glass-card border-0 shadow-sm hover:shadow-md transition-all duration-200">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side - Photo and Information */}
        <div className="lg:col-span-1 space-y-4">
          {/* Enhanced Customer Photo */}
          <Card className="glass-card border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                {customer.customer_photo_url ? (
                  <img 
                    src={customer.customer_photo_url} 
                    alt={customer.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <User className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{customer.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Personal Information */}
          <Card className="glass-card border-0 shadow-xl">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-700">
              <CardTitle className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold text-sm">{customer.name}</p>
              </div>
              <div>
                <p className="font-semibold text-sm">{customer.phone}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Join Date</label>
                <p className="font-semibold text-sm">
                  {customer.join_date ? new Date(customer.join_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              {customer.address && (
                <div>
                  <label className="text-xs font-medium text-gray-500">Address</label>
                  <p className="font-semibold text-sm">{customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Battery and Partner Information */}
          {(battery || partner) && (
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-b border-purple-200 dark:border-purple-700">
                <CardTitle className="flex items-center gap-3 text-base font-bold text-gray-900 dark:text-gray-100">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <Battery className="w-4 h-4 text-white" />
                  </div>
                  Battery & Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {battery && (
                  <div>
                    <h4 className="font-semibold mb-2 text-xs text-blue-700">Assigned Battery</h4>
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-blue-50">
                      <div className="p-1 bg-blue-100 rounded-full">
                        <Battery className="w-3 h-3 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{battery.serial_number}</p>
                        <p className="text-xs text-gray-600">{battery.model} - {battery.capacity}</p>
                        <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">{battery.status}</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {partner && (
                  <div>
                    <h4 className="font-semibold mb-2 text-xs text-green-700">Assigned Partner</h4>
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-green-50">
                      <div className="p-1 bg-green-100 rounded-full">
                        <Users className="w-3 h-3 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{partner.name}</p>
                        <p className="text-xs text-gray-600">{partner.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Payment Details, Schedule, Summary, and Transactions */}
        <div className="lg:col-span-3 space-y-6">
          {/* Upper Section - Payment Details and Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left - Payment Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5" />
                    {customer.payment_type === 'emi' ? 'EMI Details' : 
                     customer.payment_type === 'monthly_rent' ? 'Rental Details' : 
                     'Purchase Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderPaymentDetails()}
                </CardContent>
              </Card>

              {/* Key Metrics - Only show for EMI and Rental customers */}
              {customer.payment_type !== 'one_time_purchase' && !loading && billingData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-green-600">{formatCurrency(billingData.totalPaid)}</div>
                      <div className="text-sm text-gray-600">Total Paid</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-red-600">{formatCurrency(billingData.totalDue)}</div>
                      <div className="text-sm text-gray-600">Outstanding Balance</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(billingData.credits?.credit_balance || 0)}</div>
                      <div className="text-sm text-gray-600">Credit Balance</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-xl font-bold text-purple-600">
                        {billingData.nextDueDate ? formatDate(billingData.nextDueDate) : 'No Due'}
                      </div>
                      <div className="text-sm text-gray-600">Next Due Date</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Right - Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {scheduleData && <scheduleData.icon className="w-5 h-5" />}
                  {scheduleData?.title || 'Schedule'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderScheduleContent()}
              </CardContent>
            </Card>
          </div>

          {/* Transaction List - Only show for EMI and Rental customers */}
          {customer.payment_type !== 'one_time_purchase' && (
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Loading transactions...</p>
                  </div>
                )}

                {!loading && billingData?.transactions && billingData.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingData.transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell className="capitalize">{transaction.transaction_type}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.payment_status)}>
                              {transaction.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell>{transaction.remarks || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : !loading && (
                  <p className="text-center text-gray-600 py-4">No transactions found.</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Identity Documents</CardTitle>
              <CardDescription>Customer's identification documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 mb-2">Aadhaar Front</div>
                  {customer.aadhaar_front_url ? (
                    <img 
                      src={customer.aadhaar_front_url} 
                      alt="Aadhaar Front" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Document not uploaded</p>
                  )}
                </div>
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-gray-400 mb-2">Aadhaar Back</div>
                  {customer.aadhaar_back_url ? (
                    <img 
                      src={customer.aadhaar_back_url} 
                      alt="Aadhaar Back" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-500">Document not uploaded</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal - Only show for EMI and Rental customers */}
      {customer.payment_type !== 'one_time_purchase' && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          customerId={customerId}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default memo(CustomerProfile);
