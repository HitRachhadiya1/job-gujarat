import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { motion } from "framer-motion";
import { API_URL, PUBLIC_API_URL } from "@/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import LoadingOverlay from "@/components/LoadingOverlay";
import { CheckCircle, ArrowLeft, CreditCard, Star, Zap, Crown, Sparkles } from "lucide-react";

export default function CompanyPricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();
  const jobData = location.state?.jobData || null;

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);
  const [planCredits, setPlanCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const activeExpiry = useMemo(
    () => (planCredits?.activePlan?.expiryDate ? new Date(planCredits.activePlan.expiryDate) : null),
    [planCredits]
  );
  const hasActivePlan = useMemo(
    () => !!planCredits?.activePlan && (!activeExpiry || activeExpiry >= new Date()),
    [planCredits, activeExpiry]
  );
  const activePlanName = planCredits?.activePlan?.planName || null;
  const activeExpiryText = useMemo(
    () => (activeExpiry ? activeExpiry.toLocaleDateString() : null),
    [activeExpiry]
  );

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${PUBLIC_API_URL}/pricing-plans`);
        if (!res.ok) throw new Error("Failed to load plans");
        const json = await res.json();
        setPlans(Array.isArray(json) ? json.slice(0, 4) : []);
        if (Array.isArray(json) && json.length > 0) {
          setSelectedPlanId(json[0].id);
        }
      } catch (e) {
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch(`${API_URL}/company/plan-credits`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setPlanCredits(json);
        } else {
          setPlanCredits(null);
        }
      } catch (e) {
        setPlanCredits(null);
      } finally {
        setLoadingCredits(false);
      }
    };
    fetchCredits();
  }, [getAccessTokenSilently]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) || null,
    [plans, selectedPlanId]
  );

  const gridCols = useMemo(() => {
    const count = Math.min(plans.length || 1, 4);
    if (count === 1) return "grid-cols-1 max-w-md mx-auto";
    if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto";
    if (count === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
  }, [plans.length]);

  const getPlanIcon = (index) => {
    const icons = [Star, Zap, Crown, Sparkles];
    return icons[index % icons.length];
  };

  const handleChoose = async () => {
    if (!selectedPlan) return;
    if (hasActivePlan) {
      alert("You already have an active plan. Purchase a new plan after the current one expires.");
      return;
    }
    setLoading(true);
    try {
      // 1) Get Razorpay key
      let key =
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        import.meta.env.REACT_APP_RAZORPAY_KEY_ID ||
        "";
      if (!key) {
        const keyRes = await fetch(`${API_URL}/payments/key`);
        const json = await keyRes.json().catch(() => ({}));
        key = json.key || "";
      }
      if (!key) throw new Error("Razorpay key not configured");

      // 2) Create order
      const token = await getAccessTokenSilently();
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: selectedPlan.price }),
      });
      if (!orderRes.ok) throw new Error(await orderRes.text());
      const order = await orderRes.json();

      // 3) Open Razorpay
      if (!window.Razorpay) throw new Error("Razorpay script not loaded");
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: order.currency,
        name: "Job Gujarat",
        description: jobData ? `${selectedPlan.name} for "${jobData.title}"` : `${selectedPlan.name} Plan Purchase`,
        order_id: order.id,
        handler: async (response) => {
          try {
            setSuccess(true);
            // 4) Verify
            const verifyRes = await fetch(`${API_URL}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json().catch(() => ({}));
            if (!verifyRes.ok || !verifyJson.success) {
              setSuccess(false);
              alert(verifyJson.message || "Verification failed");
              return;
            }
            // 5) Confirm
            if (jobData) {
              // With job data: publish immediately
              const confirmRes = await fetch(`${API_URL}/payments/confirm-and-publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  payment: response,
                  order,
                  amount: selectedPlan.price,
                  jobData,
                  pricingPlanId: selectedPlan.id,
                }),
              });
              const confirmJson = await confirmRes.json().catch(() => ({}));
              if (!confirmRes.ok || !confirmJson?.success) {
                setSuccess(false);
                alert(confirmJson?.error || "Could not publish job after payment");
                return;
              }
              setTimeout(() => navigate("/jobs"), 1400);
            } else {
              // Plan-only purchase: allocate credits, no job created
              const confirmRes = await fetch(`${API_URL}/payments/confirm-plan-purchase`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  payment: response,
                  order,
                  amount: selectedPlan.price,
                  pricingPlanId: selectedPlan.id,
                }),
              });
              const confirmJson = await confirmRes.json().catch(() => ({}));
              if (!confirmRes.ok || !confirmJson?.success) {
                setSuccess(false);
                alert(confirmJson?.error || "Could not confirm plan purchase");
                return;
              }
              setTimeout(() => navigate("/jobs"), 1400);
            }
          } catch (e) {
            setSuccess(false);
            alert("Verification failed");
          }
        },
        theme: { color: "#2b2b2b" },
      });
      rzp.open();
    } catch (e) {
      alert(e.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] bg-[size:50px_50px]" />
      </div>

      {loading && <LoadingOverlay message="Processing payment..." />}
      
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 shadow-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">{jobData ? "Payment successful! Publishing your job..." : "Plan purchased! Credits added to your account."}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0">
              <Button
                variant="ghost"
                onClick={() => navigate("/jobs")}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-white/20 dark:border-slate-700/50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Jobs
              </Button>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-700 dark:from-white dark:via-blue-200 dark:to-slate-200 bg-clip-text text-transparent leading-tight text-center">
              Choose Your Plan
            </h1>
          </div>
        </motion.div>

        {hasActivePlan && (
          <div className="mb-8 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 px-4 py-3">
            <div className="text-sm font-medium">
              You already have an active plan{activePlanName ? ` (${activePlanName})` : ""}
              {activeExpiryText ? ` valid until ${activeExpiryText}.` : "."} Purchase a new plan after it expires.
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`grid items-stretch gap-6 ${gridCols} mb-8`}
        >
          {loadingPlans
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl">
                  <CardHeader className="text-center pb-6 pt-8">
                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl mx-auto mb-4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                  </CardHeader>
                  <CardContent className="pb-8">
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <div key={j} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            : plans.map((plan, index) => {
                const PlanIcon = getPlanIcon(index);
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Card
                      className={`relative h-full flex flex-col cursor-pointer transition-all duration-500 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden transform group-hover:shadow-3xl ${
                        selectedPlanId === plan.id
                          ? "ring-4 ring-blue-500/30 shadow-blue-500/25"
                          : "hover:shadow-slate-900/10 dark:hover:shadow-black/20"
                      } ${plan.popular ? 'scale-105' : ''}`}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      {/* Popular Badge */}
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg border-0 rounded-full">
                            <Crown className="w-4 h-4 mr-1" />
                            Most Popular
                          </Badge>
                        </div>
                      )}

                      {/* Selection Indicator */}
                      {selectedPlanId === plan.id && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4 pt-8 relative">
                        {/* Plan Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <PlanIcon className="w-8 h-8 text-white" />
                        </div>

                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                          {plan.name}
                        </CardTitle>
                        
                        <div className="space-y-2">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400">₹</span>
                            <span className="text-3xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            Valid for {plan.duration} days
                          </p>
                          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                            <Sparkles className="w-4 h-4" />
                            {plan.jobCount || 1} Job {Number(plan.jobCount) === 1 ? 'Post' : 'Posts'}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pb-6 px-6 flex-1">
                        <div className="flex flex-col h-full">
                          <ul className="space-y-3">
                            {Array.isArray(plan.features) && plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                  <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {Array.isArray(plan.features) && plan.features.length > 3 && (
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                                onClick={(e) => { e.stopPropagation(); setFeaturesPlan(plan); setFeaturesOpen(true); }}
                              >
                                View all features
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
        </motion.div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="w-full max-w-md">
            <Button
              onClick={handleChoose}
              disabled={loading || loadingPlans || loadingCredits || !selectedPlan || hasActivePlan}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Payment...</span>
                </div>
              ) : hasActivePlan ? (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span>Active plan in progress</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <span>{jobData ? `Choose ${selectedPlan?.name} & Publish` : `Buy ${selectedPlan?.name}`}</span>
                </div>
              )}
            </Button>
          </div>
        </motion.div>
        {/* Features Modal */}
        <Dialog open={featuresOpen} onOpenChange={setFeaturesOpen}>
          <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">{featuresPlan?.name} - Full Features</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Detailed list of everything included in this plan
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <ul className="space-y-3">
                {Array.isArray(featuresPlan?.features) && featuresPlan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
