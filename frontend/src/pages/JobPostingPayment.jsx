import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  ArrowLeft,
  Star,
  Zap
} from 'lucide-react';

const JobPostingPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('standard');
  
  // Get job posting data from navigation state
  const jobData = location.state?.jobData || null;

  useEffect(() => {
    if (!jobData) {
      navigate('/jobs');
    }
  }, [jobData, navigate]);

  const pricingPlans = [
    {
      id: 'basic',
      name: 'Basic Posting',
      price: 499,
      originalPrice: 699,
      duration: '30 days',
      features: [
        'Job visible for 30 days',
        'Up to 50 applications',
        'Basic applicant filtering',
        'Email notifications',
        'Standard support'
      ],
      badge: null,
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard Posting',
      price: 999,
      originalPrice: 1299,
      duration: '45 days',
      features: [
        'Job visible for 45 days',
        'Up to 150 applications',
        'Advanced applicant filtering',
        'Priority listing',
        'Email & SMS notifications',
        'Dedicated support',
        'Application analytics'
      ],
      badge: 'Most Popular',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Posting',
      price: 1999,
      originalPrice: 2499,
      duration: '60 days',
      features: [
        'Job visible for 60 days',
        'Unlimited applications',
        'AI-powered candidate matching',
        'Featured listing',
        'Multi-channel notifications',
        'Priority support',
        'Detailed analytics & insights',
        'Company branding options'
      ],
      badge: 'Best Value',
      popular: false
    }
  ];

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1) Get publishable key (no auth required)
      const keyRes = await fetch("http://localhost:5000/api/payment/key");
      const { key } = await keyRes.json();

      // 2) Create order on backend (auth required)
      const token = await getAccessTokenSilently();
      const orderRes = await fetch("http://localhost:5000/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: selectedPlanData.price }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        throw new Error(errText || "Failed to create payment order");
      }

      const order = await orderRes.json();

      // 3) Open Razorpay checkout
      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Job Gujarat",
        description: `${selectedPlanData.name} for \"${jobData.title}\"`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 4) Verify payment on backend
            const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              alert(verifyData.message || "Verification failed");
              return;
            }

            // 5) Confirm and publish job atomically on backend
            const confirmRes = await fetch("http://localhost:5000/api/payment/confirm-and-publish", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                payment: response,
                order,
                amount: selectedPlanData.price,
                jobData,
              }),
            });
            const confirmData = await confirmRes.json();
            if (!confirmRes.ok) {
              console.error("Confirm-and-publish error:", confirmData);
              alert(confirmData.error || "Could not publish job after payment");
              return;
            }

            alert("Payment verified and job published successfully!");
            navigate("/jobs");
          } catch (e) {
            console.error("Verification/Publish error:", e);
            alert("Verification failed");
          }
        },
        prefill: {},
        theme: { color: "#2b2b2b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = pricingPlans.find(plan => plan.id === selectedPlan);

  if (!jobData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/jobs')}
            className="mb-4 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Management
          </Button>
          
          <div className="flex items-center space-x-3 mb-3">
            <CreditCard className="w-8 h-8 text-stone-700 dark:text-stone-300" />
            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-100 tracking-tight">
              Complete Your Job Posting
            </h1>
          </div>
          <p className="text-lg text-stone-700 dark:text-stone-400 font-medium ml-11">
            Choose a plan to publish your job and start receiving applications
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                Select Your Plan
              </h2>
              <p className="text-stone-600 dark:text-stone-400">
                Choose the perfect plan for your hiring needs
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    selectedPlan === plan.id
                      ? 'ring-2 ring-stone-600 dark:ring-stone-400 shadow-lg'
                      : 'hover:shadow-md'
                  } ${plan.popular ? 'border-stone-600 dark:border-stone-400' : ''}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-stone-900 dark:bg-stone-700 text-white px-3 py-1">
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-100">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                          ₹{plan.price}
                        </span>
                        <span className="text-lg text-stone-500 dark:text-stone-400 line-through">
                          ₹{plan.originalPrice}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                        Valid for {plan.duration}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-stone-700 dark:text-stone-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Highlight */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <Users className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Quality Candidates
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Access to verified job seekers with relevant skills
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <TrendingUp className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Better Visibility
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Higher ranking in search results and recommendations
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <Zap className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Fast Hiring
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Advanced tools to streamline your hiring process
                </p>
              </Card>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  Order Summary
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Job Details */}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    Job Details
                  </h3>
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4 space-y-2">
                    <h4 className="font-medium text-stone-900 dark:text-stone-100">
                      {jobData.title}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-stone-600 dark:text-stone-400">
                      <Badge variant="secondary">{jobData.jobType}</Badge>
                      {jobData.location && (
                        <span>• {jobData.location}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Selected Plan */}
                <div>
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    Selected Plan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-700 dark:text-stone-300">
                        {selectedPlanData?.name}
                      </span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">
                        ₹{selectedPlanData?.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-stone-600 dark:text-stone-400">
                        Duration
                      </span>
                      <span className="text-stone-700 dark:text-stone-300">
                        {selectedPlanData?.duration}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700 dark:text-stone-300">Subtotal</span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{selectedPlanData?.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700 dark:text-stone-300">GST (18%)</span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{Math.round(selectedPlanData?.price * 0.18)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-stone-900 dark:text-stone-100">Total</span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{Math.round(selectedPlanData?.price * 1.18)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Proceed to Payment</span>
                    </div>
                  )}
                </Button>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-lg p-3">
                  <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span>Secure payment powered by Razorpay</span>
                </div>

                {/* Money Back Guarantee */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-stone-600 dark:text-stone-400">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPayment;
