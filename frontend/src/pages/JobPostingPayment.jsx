import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  ArrowLeft,
  Star,
  Zap,
} from "lucide-react";
import { API_URL, PUBLIC_API_URL } from "../config";
import LoadingOverlay from "../components/LoadingOverlay";
import PaymentSuccessAlert from "../components/comp-271";

const JobPostingPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);
  const [success, setSuccess] = useState(false);

  // Get job posting data from navigation state
  const jobData = location.state?.jobData || null;

  useEffect(() => {
    if (!jobData) {
      navigate("/jobs");
    }
  }, [jobData, navigate]);

  // Fetch pricing plans from API
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        const response = await fetch(`${PUBLIC_API_URL}/pricing-plans`);
        if (response.ok) {
          const plans = await response.json();
          setPricingPlans(plans);
          // Set the first plan as default, or the popular one if available
          const defaultPlan = plans.find((plan) => plan.popular) || plans[0];
          if (defaultPlan) {
            setSelectedPlan(defaultPlan.id);
          }
        } else {
          console.error("Failed to fetch pricing plans");
          // Fallback to static plans if API fails
          const fallbackPlans = [
            {
              id: "basic",
              name: "Basic Posting",
              price: 499,
              duration: 30,
              features: [
                "Job visible for 30 days",
                "Up to 50 applications",
                "Basic applicant filtering",
                "Email notifications",
                "Standard support",
              ],
              popular: false,
            },
            {
              id: "standard",
              name: "Standard Posting",
              price: 999,
              duration: 45,
              features: [
                "Job visible for 45 days",
                "Up to 150 applications",
                "Advanced applicant filtering",
                "Priority listing",
                "Email & SMS notifications",
                "Dedicated support",
                "Application analytics",
              ],
              popular: true,
            },
            {
              id: "premium",
              name: "Premium Posting",
              price: 1999,
              duration: 60,
              features: [
                "Job visible for 60 days",
                "Unlimited applications",
                "AI-powered candidate matching",
                "Featured listing",
                "Multi-channel notifications",
                "Priority support",
                "Detailed analytics & insights",
                "Company branding options",
              ],
              popular: false,
            },
          ];
          setPricingPlans(fallbackPlans);
          setSelectedPlan("standard");
        }
      } catch (error) {
        console.error("Error fetching pricing plans:", error);
        // Fallback to static plans if API fails
        const fallbackPlans = [
          {
            id: "basic",
            name: "Basic Posting",
            price: 499,
            duration: 30,
            features: [
              "Job visible for 30 days",
              "Up to 50 applications",
              "Basic applicant filtering",
              "Email notifications",
              "Standard support",
            ],
            popular: false,
          },
          {
            id: "standard",
            name: "Standard Posting",
            price: 999,
            duration: 45,
            features: [
              "Job visible for 45 days",
              "Up to 150 applications",
              "Advanced applicant filtering",
              "Priority listing",
              "Email & SMS notifications",
              "Dedicated support",
              "Application analytics",
            ],
            popular: true,
          },
          {
            id: "premium",
            name: "Premium Posting",
            price: 1999,
            duration: 60,
            features: [
              "Job visible for 60 days",
              "Unlimited applications",
              "AI-powered candidate matching",
              "Featured listing",
              "Multi-channel notifications",
              "Priority support",
              "Detailed analytics & insights",
              "Company branding options",
            ],
            popular: false,
          },
        ];
        setPricingPlans(fallbackPlans);
        setSelectedPlan("standard");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPricingPlans();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1) Get Razorpay key: prefer env var; fallback to public endpoint if available
      let key =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.REACT_APP_RAZORPAY_KEY_ID ||
        "";
      if (!key) {
        const fallbackUrl = `${API_URL}/payments/key`;
        const keyRes = await fetch(fallbackUrl);
        const contentType = keyRes.headers.get("content-type") || "";
        if (!keyRes.ok) {
          const text = await keyRes.text();
          throw new Error(
            `Failed to fetch Razorpay key (${keyRes.status}): ${text.slice(
              0,
              200
            )}`
          );
        }
        if (!contentType.includes("application/json")) {
          const text = await keyRes.text();
          throw new Error(
            `Unexpected response for Razorpay key: ${text.slice(0, 120)}`
          );
        }
        const json = await keyRes.json();
        key = json.key;
      }
      if (!key)
        throw new Error(
          "Razorpay key not configured. Set VITE_RAZORPAY_KEY_ID in frontend env or provide a public API endpoint."
        );

      // 2) Create order on backend (auth required)
      const token = await getAccessTokenSilently();
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
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
            // Show success banner immediately when Razorpay returns success
            setSuccess(true);
            // 4) Verify payment on backend
            const verifyRes = await fetch(`${API_URL}/payments/verify`, {
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
              setSuccess(false);
              return;
            }

            // 5) Confirm and publish job atomically on backend
            const confirmRes = await fetch(
              `${API_URL}/payments/confirm-and-publish`,
              {
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
                  pricingPlanId: selectedPlan || undefined,
                }),
              }
            );
            const confirmData = await confirmRes.json();
            if (!confirmRes.ok) {
              console.error("Confirm-and-publish error:", confirmData);
              alert(confirmData.error || "Could not publish job after payment");
              setSuccess(false);
              return;
            }

            // Navigate after a short delay to give the user visible success feedback
            setTimeout(() => navigate("/jobs"), 1600);
          } catch (e) {
            console.error("Verification/Publish error:", e);
            alert("Verification failed");
            setSuccess(false);
          }
        },
        prefill: {},
        theme: { color: "#2b2b2b" },
      };

      if (!window.Razorpay)
        throw new Error(
          "Razorpay script not loaded. Please ensure checkout script is included in index.html."
        );
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = pricingPlans.find(
    (plan) => plan.id === selectedPlan
  );

  if (!jobData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 pb-10 relative overflow-x-hidden overflow-y-auto">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {loading && <LoadingOverlay message="Processing payment..." />}
      {success && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <PaymentSuccessAlert message="Payment successful! Publishing your job..." />
        </div>
      )}
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/jobs")}
            className="mb-4 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Management
          </Button>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                Complete Your Job Posting
              </h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Choose the perfect plan to publish your job and start receiving
              quality applications from verified candidates
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Pricing Plans */}
          <div className="lg:col-span-2">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
                Select Your Plan
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                Choose the perfect plan for your hiring needs and start
                attracting top talent today
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingPlans
                ? // Loading skeleton
                  [...Array(3)].map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardHeader className="text-center pb-4">
                        <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded mb-4"></div>
                        <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded mb-2"></div>
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded"></div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className="h-4 bg-stone-200 dark:bg-stone-700 rounded"
                            ></div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : pricingPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative cursor-pointer transition-all duration-300 bg-white dark:bg-slate-900 border-2 rounded-3xl overflow-visible ${
                        selectedPlan === plan.id
                          ? "border-blue-500 ring-4 ring-blue-500/20 shadow-2xl shadow-blue-500/20"
                          : plan.popular
                          ? "border-purple-500 shadow-xl shadow-purple-500/10"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl"
                      } min-h-[320px] flex flex-col group`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-[#155AA4] dark:bg-[#155AA4] text-white px-3 py-1 shadow">
                            Most Popular
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
                          </div>
                          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
                            Valid for {plan.duration} days
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {Array.isArray(plan.features) &&
                            plan.features.slice(0, 3).map((feature, index) => (
                              <li
                                key={index}
                                className="flex items-start space-x-3"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-stone-700 dark:text-stone-300">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          {/* {Array.isArray(plan.features) && plan.features.length > 3 && (
                        <li>
                          <button
                            type="button"
                            className="text-sm text-stone-700 dark:text-stone-300 underline"
                            onClick={(e) => { e.stopPropagation(); setFeaturesPlan(plan); setShowFeaturesDialog(true); }}
                          >
                            View all features
                          </button>
                        </li>
                      )} */}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
            </div>

            {/* Features Highlight */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                <Users className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Quality Candidates
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Access to verified job seekers with relevant skills
                </p>
              </Card>

              <Card className="text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
                <TrendingUp className="w-8 h-8 text-stone-600 dark:text-stone-400 mx-auto mb-3" />
                <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Better Visibility
                </h3>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Higher ranking in search results and recommendations
                </p>
              </Card>

              <Card className="text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl">
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
            <Card className="lg:sticky lg:top-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg">
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
                      {jobData.location && <span>• {jobData.location}</span>}
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
                        {selectedPlanData?.duration} days
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700 dark:text-stone-300">
                      Subtotal
                    </span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{selectedPlanData?.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-700 dark:text-stone-300">
                      GST (18%)
                    </span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{Math.round(selectedPlanData?.price * 0.18)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-stone-900 dark:text-stone-100">
                      Total
                    </span>
                    <span className="text-stone-900 dark:text-stone-100">
                      ₹{Math.round(selectedPlanData?.price * 1.18)}
                    </span>
                  </div>
                </div>

                {/* Payment Button */}
                <Button
                  onClick={handlePayment}
                  disabled={loading || loadingPlans || !selectedPlan}
                  className="w-full bg-stone-900 dark:bg-stone-700 hover:bg-stone-800 dark:hover:bg-stone-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : loadingPlans ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading Plans...</span>
                    </div>
                  ) : !selectedPlan ? (
                    <span>Select a Plan</span>
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

      {/* Features Dialog */}
      <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
        <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{featuresPlan?.name} Features</DialogTitle>
            <DialogDescription>
              Complete list of features included in this plan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {featuresPlan?.features?.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobPostingPayment;
