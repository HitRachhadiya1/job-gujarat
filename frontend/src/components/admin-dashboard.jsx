import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import AppLogo from "./AppLogo";
import { useLogo } from "../context/LogoContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  LogOut,
  Users,
  Building2,
  Briefcase,
  Settings,
  TrendingUp,
  IndianRupee,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  UserCheck,
  UserX,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Globe,
  Clock,
  ExternalLink,
  Tag,
  Layers,
  CreditCard,
  Ban,
  ThumbsUp,
  ThumbsDown,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";

export default function AdminDashboard({ onLogout }) {
  const { isDark, toggleTheme } = useTheme();
  const { getAccessTokenSilently } = useAuth0();
  const { appLogo } = useLogo();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    activeJobs: 0,
    totalApplications: 0,
    totalPayments: 0,
    revenue: 0,
  });
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditCategoryDialog, setShowEditCategoryDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: "",
    duration: "",
    features: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [userProfileData, setUserProfileData] = useState(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false);
  const [featuresPlan, setFeaturesPlan] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();

      // Fetch all data in parallel
      const [
        usersRes,
        companiesRes,
        jobsRes,
        paymentsRes,
        categoriesRes,
        plansRes,
      ] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/companies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/jobs", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/payments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:5000/api/admin/pricing-plans", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
        const jobSeekerCount = usersData.filter(
          (u) => u.role === "JOB_SEEKER" || !u.role
        ).length;
        setStats((prev) => ({ ...prev, totalUsers: jobSeekerCount }));
      }

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
        setStats((prev) => ({ ...prev, totalCompanies: companiesData.length }));
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
        setStats((prev) => ({
          ...prev,
          activeJobs: jobsData.filter((job) => job.status === "PUBLISHED")
            .length,
          totalApplications: jobsData.reduce(
            (sum, job) => sum + (job._count?.Applications || 0),
            0
          ),
        }));
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        setPayments(paymentsData);
        setStats((prev) => ({
          ...prev,
          totalPayments: paymentsData.length,
          revenue: paymentsData.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0
          ),
        }));
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPricingPlans(plansData);
      }

      // App logo is provided by LogoContext via public endpoint
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${userId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success(`User ${action}d successfully`);
        fetchDashboardData();
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    }
  };

  const handleJobAction = async (jobId, action) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/jobs/${jobId}/${action}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success(`Job ${action}d successfully`);
        fetchDashboardData();
      } else {
        toast.error(`Failed to ${action} job`);
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      toast.error(`Failed to ${action} job`);
    }
  };

  const handleCompanyAction = async (companyId, action) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/companies/${companyId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success(`Company ${action}ed successfully`);
        fetchDashboardData();
      } else {
        toast.error(`Failed to ${action} company`);
      }
    } catch (error) {
      console.error(`Error ${action}ing company:`, error);
      toast.error(`Failed to ${action} company`);
    }
  };

  const handlePaymentAction = async (paymentId, action) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/payments/${paymentId}/${action}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        toast.success(`Payment ${action} processed successfully`);
        fetchDashboardData();
      } else {
        toast.error(`Failed to process payment ${action}`);
      }
    } catch (error) {
      console.error(`Error processing payment ${action}:`, error);
      toast.error(`Failed to process payment ${action}`);
    }
  };

  const handleAddCategory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        "http://localhost:5000/api/admin/categories",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCategory),
        }
      );

      if (response.ok) {
        toast.success("Category created successfully");
        setNewCategory({ name: "", description: "" });
        setShowAddCategoryDialog(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to create category");
      }
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category");
    }
  };

  const handleAddPlan = async () => {
    try {
      const token = await getAccessTokenSilently();
      const featuresArray = newPlan.features
        ? newPlan.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : [];

      const response = await fetch(
        "http://localhost:5000/api/admin/pricing-plans",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newPlan,
            features: featuresArray,
            price: parseFloat(newPlan.price),
            duration: parseInt(newPlan.duration),
          }),
        }
      );

      if (response.ok) {
        toast.success("Pricing plan created successfully");
        setNewPlan({ name: "", price: "", duration: "", features: "" });
        setShowAddPlanDialog(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to create pricing plan");
      }
    } catch (error) {
      console.error("Error creating pricing plan:", error);
      toast.error("Failed to create pricing plan");
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowEditCategoryDialog(true);
  };

  const handleUpdateCategory = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingCategory.name,
            description: editingCategory.description,
          }),
        }
      );

      if (response.ok) {
        toast.success("Category updated successfully");
        setEditingCategory(null);
        setShowEditCategoryDialog(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Category deleted successfully");
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlan({
      ...plan,
      features: Array.isArray(plan.features)
        ? plan.features.join(", ")
        : plan.features || "",
    });
    setShowEditPlanDialog(true);
  };

  const handleUpdatePlan = async () => {
    try {
      const token = await getAccessTokenSilently();
      const featuresArray = editingPlan.features
        ? editingPlan.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f.length > 0)
        : [];

      const response = await fetch(
        `http://localhost:5000/api/admin/pricing-plans/${editingPlan.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...editingPlan,
            features: featuresArray,
            price: parseFloat(editingPlan.price),
            duration: parseInt(editingPlan.duration),
          }),
        }
      );

      if (response.ok) {
        toast.success("Pricing plan updated successfully");
        setEditingPlan(null);
        setShowEditPlanDialog(false);
        fetchDashboardData();
      } else {
        toast.error("Failed to update pricing plan");
      }
    } catch (error) {
      console.error("Error updating pricing plan:", error);
      toast.error("Failed to update pricing plan");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this pricing plan?")) return;

    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/pricing-plans/${planId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Pricing plan deleted successfully");
        fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete pricing plan");
      }
    } catch (error) {
      console.error("Error deleting pricing plan:", error);
      toast.error("Failed to delete pricing plan");
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;

    // Validate file
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast.error("Logo must be PNG or JPG format");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      toast.error("Logo size must be less than 5MB");
      return;
    }

    setUploadingLogo(true);
    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append("logo", file);

      const response = await fetch(
        "http://localhost:5000/api/admin/upload-logo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("Logo uploaded successfully!");
        // Notify all components to refresh logo
        window.dispatchEvent(new Event("logoUpdated"));
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("An error occurred while uploading logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch("http://localhost:5000/api/admin/app-logo", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        toast.success("Logo removed successfully");
        window.dispatchEvent(new Event("logoUpdated"));
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || "Failed to remove logo");
      }
    } catch (error) {
      console.error("Error removing logo:", error);
      toast.error("An error occurred while removing logo");
    }
  };

  const jobSeekerUsers = users.filter(
    (u) => u.role === "JOB_SEEKER" || !u.role
  );
  const filteredUsers = jobSeekerUsers.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "verified" && company.verified && !company.blocked) ||
      (filterStatus === "pending" && !company.verified && !company.blocked) ||
      (filterStatus === "blocked" && company.blocked);
    return matchesSearch && matchesFilter;
  });

  const openUserProfile = async (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
    setLoadingUserProfile(true);
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(
        `http://localhost:5000/api/admin/job-seeker-profile?email=${encodeURIComponent(
          user.email
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserProfileData(data);
      } else {
        setUserProfileData({ profileExists: false });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUserProfileData({ profileExists: false });
    } finally {
      setLoadingUserProfile(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-stone-200/30 to-stone-300/30 dark:from-stone-800/20 dark:to-stone-700/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-stone-200/30 to-stone-300/30 dark:from-stone-800/20 dark:to-stone-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 backdrop-blur-sm bg-stone-100/90 dark:bg-stone-900/90 border-b border-stone-300/70 dark:border-stone-700/60 shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AppLogo size="w-12 h-12" rounded="rounded-xl" mode="contain" />
              <div>
                <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-200">
                  Admin Control Center
                </h1>
                <p className="text-xs text-stone-600 dark:text-stone-400">
                  Job Gujarat Administration Panel
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-stone-200/60 dark:bg-stone-700/40 rounded-lg p-1 border border-stone-300/60 dark:border-stone-700/60">
                <ThemeToggle />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
                className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 bg-transparent"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-200/70 dark:hover:bg-stone-800 bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-4 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg rounded-xl p-2">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Companies
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Jobs
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Job Seekers
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Categories
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="data-[state=active]:bg-stone-900 data-[state=active]:text-white dark:data-[state=active]:bg-stone-700"
            >
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-stone-800 dark:text-white">
                Platform Overview
              </h2>
              <p className="text-stone-600 dark:text-stone-300">
                Monitor and manage your Job Gujarat platform
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Job Seekers
                  </CardTitle>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {stats.totalUsers}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Registered job seekers
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Companies
                  </CardTitle>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {stats.totalCompanies}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Registered employers
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Active Jobs
                  </CardTitle>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    {stats.activeJobs}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    Published positions
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Total Revenue
                  </CardTitle>
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    ₹{stats.revenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                    From {stats.totalPayments} transactions
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-stone-800 dark:text-white flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Recent Job Seekers
                  </CardTitle>
                  <CardDescription className="text-stone-600 dark:text-stone-300">
                    Latest job seeker registrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobSeekerUsers.slice(0, 5).map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 dark:text-white">
                              {user.name || user.email}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            user.role === "ADMIN"
                              ? "default"
                              : user.role === "COMPANY"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {user.role || "Job Seeker"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-stone-800 dark:text-white flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Recent Job Postings
                  </CardTitle>
                  <CardDescription className="text-stone-600 dark:text-stone-300">
                    Latest job opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.slice(0, 5).map((job, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-stone-900/50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                            <Briefcase className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                          </div>
                          <div>
                            <p className="font-medium text-stone-900 dark:text-white">
                              {job.title}
                            </p>
                            <p className="text-sm text-stone-600 dark:text-stone-400">
                              {job.company?.name}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            job.status === "PUBLISHED"
                              ? "default"
                              : job.status === "DRAFT"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Company Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Approve, verify and manage company registrations
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <Input
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredCompanies.map((company) => (
                <Card
                  key={company.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-stone-600 dark:text-stone-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                              {company.name}
                            </h4>
                            <Badge
                              variant={
                                company.verified
                                  ? "default"
                                  : company.blocked
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {company.verified
                                ? "Verified"
                                : company.blocked
                                ? "Blocked"
                                : "Pending Review"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 dark:text-stone-400">
                            <div className="flex items-start space-x-2 break-words">
                              <Mail className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{company.email || "Not provided"}</span>
                            </div>
                            <div className="flex items-start space-x-2 break-words">
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              {(company.website || company.websiteUrl || company.url || company.webUrl) ? (
                                <a
                                  href={(company.website || company.websiteUrl || company.url || company.webUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline break-words"
                                >
                                  {company.website || company.websiteUrl || company.url || company.webUrl}
                                </a>
                              ) : (
                                <span>Not provided</span>
                              )}
                            </div>
                            <div className="flex items-start space-x-2 break-words">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{company.location || "Location not specified"}</span>
                            </div>
                            <div className="flex items-start space-x-2 break-words">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{company._count?.Jobs || 0} job postings</span>
                            </div>
                          </div>
                          {company.description && (
                            <p className="mt-3 text-sm text-stone-700 dark:text-stone-300 break-words">
                              {company.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-stone-500 dark:text-stone-400">
                            <span className="break-words">Industry: {company.industry || "Not specified"}</span>
                            <span className="break-words">Size: {company.size || "Not specified"}</span>
                            <span className="break-words">Joined: {new Date(company.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!company.verified && !company.blocked && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleCompanyAction(company.id, "approve")}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCompanyAction(company.id, "reject")}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {company.verified && !company.blocked && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCompanyAction(company.id, "block")}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Block
                          </Button>
                        )}
                        {company.blocked && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleCompanyAction(company.id, "unblock")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unblock
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Job Seeker Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Monitor and manage job seeker accounts
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <Input
                    placeholder="Search job seekers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredUsers.map((user) => (
                <Card
                  key={user.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center">
                          <Users className="w-8 h-8 text-stone-600 dark:text-stone-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                              {user.name || user.email}
                            </h4>
                            <Badge
                              variant={
                                user.role === "ADMIN"
                                  ? "default"
                                  : user.role === "COMPANY"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {user.role || "Job Seeker"}
                            </Badge>
                            <Badge
                              variant={user.blocked ? "destructive" : "default"}
                            >
                              {user.blocked ? "Blocked" : "Active"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-600 dark:text-stone-400 mb-3">
                            <div className="flex items-center space-x-2">
                              <Globe className="w-4 h-4" />
                              <span>{user.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Joined{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
                            <span>
                              Last active:{" "}
                              {user.lastLogin
                                ? new Date(user.lastLogin).toLocaleDateString()
                                : "Never"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50"
                          onClick={() => openUserProfile(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant={user.blocked ? "default" : "destructive"}
                          onClick={() =>
                            handleUserAction(
                              user.id,
                              user.blocked ? "unblock" : "block"
                            )
                          }
                        >
                          {user.blocked ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unblock
                            </>
                          ) : (
                            <>
                              <UserX className="h-4 w-4 mr-1" />
                              Block
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Job Seeker Profile Dialog */}
          {selectedUser && (
            <Dialog
              open={showUserDialog}
              onOpenChange={(open) => {
                setShowUserDialog(open);
                if (!open) {
                  setSelectedUser(null);
                  setUserProfileData(null);
                }
              }}
            >
              <DialogContent className="bg-white dark:bg-stone-900 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-stone-900 dark:text-white">
                    {selectedUser.name || selectedUser.email}
                  </DialogTitle>
                  <DialogDescription>
                    Job Seeker Profile
                  </DialogDescription>
                </DialogHeader>
                {loadingUserProfile ? (
                  <p className="text-stone-600 dark:text-stone-300">Loading profile...</p>
                ) : (
                  <div className="space-y-4">
                    {userProfileData?.profileExists && userProfileData.profile ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-stone-700 dark:text-stone-300">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{userProfileData.profile.fullName}</span>
                          </div>
                          {userProfileData.profile.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{userProfileData.profile.phone}</span>
                            </div>
                          )}
                          {userProfileData.profile.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{userProfileData.profile.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span>{selectedUser.email}</span>
                          </div>
                          {Array.isArray(userProfileData.profile.skills) && userProfileData.profile.skills.length > 0 && (
                            <div className="md:col-span-2">
                              <span className="font-semibold">Skills:</span>{" "}
                              <span>{userProfileData.profile.skills.join(", ")}</span>
                            </div>
                          )}
                          {userProfileData.profile.experienceYears !== null && userProfileData.profile.experienceYears !== undefined && (
                            <div>
                              <span className="font-semibold">Experience:</span>{" "}
                              <span>{userProfileData.profile.experienceYears} years</span>
                            </div>
                          )}
                          {userProfileData.profile.resumeUrl && (
                            <div>
                              <a href={userProfileData.profile.resumeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:underline">
                                <ExternalLink className="w-4 h-4" /> View Resume
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2">
                          <Button
                            size="sm"
                            variant={selectedUser.blocked ? "default" : "destructive"}
                            onClick={async () => {
                              await handleUserAction(
                                selectedUser.id,
                                selectedUser.blocked ? "unblock" : "block"
                              );
                              setShowUserDialog(false);
                            }}
                          >
                            {selectedUser.blocked ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" /> Unblock
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4 mr-1" /> Block
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-stone-700 dark:text-stone-300">
                        <p>No job seeker profile found. Showing available details:</p>
                        <ul className="list-disc pl-5 mt-2">
                          <li>Email: {selectedUser.email}</li>
                          <li>Status: {userProfileData?.dbStatus || "Unknown"}</li>
                        </ul>
                        <div className="flex items-center justify-end gap-2 pt-3">
                          <Button
                            size="sm"
                            variant={selectedUser.blocked ? "default" : "destructive"}
                            onClick={async () => {
                              await handleUserAction(
                                selectedUser.id,
                                selectedUser.blocked ? "unblock" : "block"
                              );
                              setShowUserDialog(false);
                            }}
                          >
                            {selectedUser.blocked ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-1" /> Unblock
                              </>
                            ) : (
                              <>
                                <UserX className="w-4 h-4 mr-1" /> Block
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          )}

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Job Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Moderate, approve and manage job postings
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobs</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="FLAGGED">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center">
                          <Briefcase className="w-8 h-8 text-stone-600 dark:text-stone-300" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                              {job.title}
                            </h4>
                            <Badge
                              variant={
                                job.status === "PUBLISHED"
                                  ? "default"
                                  : job.status === "CLOSED"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {job.status}
                            </Badge>
                            {job.featured && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 text-yellow-800 border-yellow-300"
                              >
                                Featured
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-stone-600 dark:text-stone-400 mb-3">
                            <div className="flex items-start space-x-2 min-w-0 break-words">
                              <Building2 className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate break-words">{job.company?.name || "Company"}</span>
                            </div>
                            <div className="flex items-start space-x-2 min-w-0 break-words">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{job.location || "Location not specified"}</span>
                            </div>
                            <div className="flex items-start space-x-2 min-w-0 break-words">
                              <IndianRupee className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{job.salaryRange || "Not specified"}</span>
                            </div>
                            <div className="flex items-start space-x-2 min-w-0 break-words">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{job.jobType || "Job type not specified"}</span>
                            </div>
                          </div>
                          {false && job.description && (
                            <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-2 mb-3">
                              {job.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
                            <span>
                              Posted:{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                            <span>•</span>
                            <span>
                              Applications: {job._count?.Applications || 0}
                            </span>
                            {/* <span>•</span>
                            <span>Views: {job.views || 0}</span> */}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50"
                          onClick={() => {
                            setSelectedJob(job);
                            setShowJobDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {/* Moderation actions removed per requirement */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Job Details Dialog */}
          {selectedJob && (
            <Dialog
              open={showJobDialog}
              onOpenChange={(open) => {
                setShowJobDialog(open);
                if (!open) setSelectedJob(null);
              }}
            >
              <DialogContent className="bg-white dark:bg-stone-900 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-stone-900 dark:text-white">
                    {selectedJob.title}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedJob.company?.name || "Company"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 text-sm text-stone-700 dark:text-stone-300">
                    <Badge variant="outline">{selectedJob.status}</Badge>
                    {selectedJob.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {selectedJob.location}
                      </span>
                    )}
                    {selectedJob.jobType && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {selectedJob.jobType}
                      </span>
                    )}
                    {selectedJob.salaryRange && (
                      <span className="inline-flex items-center gap-1">
                        <IndianRupee className="w-4 h-4" /> {selectedJob.salaryRange}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Posted {new Date(selectedJob.createdAt).toLocaleDateString()}
                    </span>
                    {selectedJob.expiresAt && (
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires {new Date(selectedJob.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-4 h-4" /> Applicants: {selectedJob._count?.Applications || 0}
                    </span>
                  </div>

                  {selectedJob.description && (
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-white mb-1">Description</h4>
                      <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-line">
                        {selectedJob.description}
                      </p>
                    </div>
                  )}

                  {Array.isArray(selectedJob.requirements) && selectedJob.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-stone-900 dark:text-white mb-1">Requirements</h4>
                      <ul className="list-disc pl-5 text-sm text-stone-700 dark:text-stone-300">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}

          <TabsContent value="payments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Payment Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Monitor transactions and manage refunds
                </p>
              </div>
              <Button
                variant="outline"
                className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border-stone-300 dark:border-stone-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    ₹{stats.revenue.toLocaleString()}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    From {stats.totalPayments} transactions
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    ₹{Math.floor(stats.revenue * 0.3).toLocaleString()}
                  </div>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Success Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    98.5%
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Payment success rate
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Refunds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-stone-900 dark:text-white">
                    ₹{Math.floor(stats.revenue * 0.02).toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600">2% refund rate</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6">
              {payments.map((payment) => (
                <Card
                  key={payment.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-stone-900 dark:text-white">
                          ₹{Number(payment.amount).toLocaleString()}
                        </div>
                        <div className="text-sm text-stone-600 dark:text-stone-400">
                          Type: {payment.paymentType}
                        </div>
                        <div className="text-sm text-stone-600 dark:text-stone-400">
                          Date: {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50"
                          onClick={() => { setSelectedPayment(payment); setShowPaymentDialog(true); }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        {payment.status === "SUCCESS" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={() => handlePaymentAction(payment.id, "refund")}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Payment Details Dialog */}
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogContent className="bg-white dark:bg-stone-900 max-w-lg">
                <DialogHeader>
                  <DialogTitle>Payment Details</DialogTitle>
                  <DialogDescription>Detailed transaction information</DialogDescription>
                </DialogHeader>
                {selectedPayment && (
                  <div className="space-y-3 text-sm text-stone-700 dark:text-stone-300">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="font-medium">Amount</div>
                      <div>₹{Number(selectedPayment.amount).toLocaleString()}</div>

                      <div className="font-medium">Type</div>
                      <div>{selectedPayment.paymentType}</div>

                      <div className="font-medium">Status</div>
                      <div>{selectedPayment.status}</div>

                      <div className="font-medium">Date</div>
                      <div>{new Date(selectedPayment.createdAt).toLocaleString()}</div>

                      <div className="font-medium">Gateway</div>
                      <div>{selectedPayment.gateway}</div>

                      <div className="font-medium">Transaction ID</div>
                      <div className="font-mono text-xs break-all">{selectedPayment.transactionId}</div>

                      <div className="font-medium">Payer</div>
                      <div>{(() => {
                        const pType = (selectedPayment.paymentType || "").toString().toUpperCase();

                        // Extract common fields first
                        let companyName = selectedPayment.Company?.name || selectedPayment.company?.name || null;
                        let jobSeekerName = selectedPayment.JobSeeker?.fullName
                          || selectedPayment.JobSeeker?.name
                          || selectedPayment.jobSeeker?.fullName
                          || selectedPayment.jobSeeker?.name
                          || null;
                        const userName = selectedPayment.User?.name || selectedPayment.user?.name || null;
                        const payerName = selectedPayment.payerName || selectedPayment.payer || selectedPayment.name || selectedPayment.email || null;
                        const userEmail = selectedPayment.userEmail || selectedPayment.email || selectedPayment.User?.email || selectedPayment.JobSeeker?.email || selectedPayment.jobSeeker?.email || null;

                        const companyId = selectedPayment.companyId || selectedPayment.CompanyId || selectedPayment.company_id;
                        const jobSeekerId = selectedPayment.jobSeekerId || selectedPayment.JobSeekerId || selectedPayment.job_seeker_id || selectedPayment.userId || selectedPayment.jobSeeker?.userId;
                        const payerId = selectedPayment.payerId || selectedPayment.payer_id;
                        const jobRefId = selectedPayment.jobPostingId || selectedPayment.jobId || selectedPayment.JobPostingId || selectedPayment.JobId;

                        // Helper resolvers
                        const resolveCompanyName = () => {
                          // 1) direct id
                          if (!companyName && companyId && Array.isArray(companies) && companies.length) {
                            const foundCompany = companies.find((c) => String(c.id) === String(companyId));
                            if (foundCompany) companyName = foundCompany.name;
                          }
                          // 2) via payer/user id mapping
                          if (!companyName && (payerId || jobSeekerId) && Array.isArray(companies) && companies.length) {
                            const candidateUserId = payerId || jobSeekerId;
                            const companyByUser = companies.find((c) => String(c.userId) === String(candidateUserId));
                            if (companyByUser) companyName = companyByUser.name;
                          }
                          // 3) via job ref
                          if (!companyName && jobRefId && Array.isArray(jobs) && jobs.length) {
                            const foundJob = jobs.find((j) => String(j.id) === String(jobRefId));
                            if (foundJob) companyName = foundJob.company?.name || foundJob.Company?.name || foundJob.companyName || companyName;
                          }
                        };

                        const resolveJobSeekerName = () => {
                          if (!jobSeekerName && jobSeekerId && Array.isArray(users) && users.length) {
                            const foundUser = users.find((u) => String(u.id) === String(jobSeekerId));
                            if (foundUser) jobSeekerName = foundUser.name || foundUser.email;
                          }
                          if (!jobSeekerName && userEmail && Array.isArray(users) && users.length) {
                            const foundByEmail = users.find((u) => (u.email || "").toLowerCase() === (userEmail || "").toLowerCase());
                            if (foundByEmail) jobSeekerName = foundByEmail.name || foundByEmail.email;
                          }
                        };

                        // Decide expected payer based on payment type
                        if (pType.includes("APPLICATION") || pType.includes("APPROVAL")) {
                          // Always show job seeker for these
                          resolveJobSeekerName();
                          const name = jobSeekerName || userName || payerName || userEmail || (jobSeekerId ? `User #${jobSeekerId}` : "Unknown");
                          return `${name} (jobseeker)`;
                        }

                        // For job posting or other company-side fees, prefer company
                        if (pType.includes("JOB") || pType.includes("POST")) {
                          resolveCompanyName();
                          const name = companyName || payerName || (companyId ? `Company #${companyId}` : "Unknown");
                          return `${name} (company)`;
                        }

                        // Fallback heuristic if type is unknown
                        resolveCompanyName();
                        resolveJobSeekerName();
                        let type = "unknown";
                        if (companyName || companyId) type = "company";
                        else if (jobSeekerName || jobSeekerId) type = "jobseeker";
                        else if (selectedPayment.payerType || selectedPayment.payerRole) type = (selectedPayment.payerType || selectedPayment.payerRole).toString().toLowerCase();
                        else if (pType === "APPROVAL_FEE") type = "jobseeker";

                        const name = (type === "company" ? (companyName || payerName || (companyId ? `Company #${companyId}` : null))
                                   : (jobSeekerName || userName || payerName || userEmail || (jobSeekerId ? `User #${jobSeekerId}` : null)))
                                   || (payerId ? `Payer #${payerId}` : "Unknown");
                        return `${name} (${type})`;
                      })()}</div>
                    </div>

                    {selectedPayment.JobPosting && (
                      <div className="pt-2">
                        <div className="font-medium">Job</div>
                        <div>{selectedPayment.JobPosting.title}</div>
                      </div>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Category & Skill Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Manage job categories and skill tags
                </p>
              </div>
              <Dialog
                open={showAddCategoryDialog}
                onOpenChange={setShowAddCategoryDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-stone-900 hover:bg-stone-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-stone-900">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                      Create a new job category for better organization
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Information Technology"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Brief description of this category"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCategoryDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleAddCategory()}>
                        Create Category
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                          <Layers className="w-6 h-6 text-stone-600 dark:text-stone-300" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                            {category.name}
                          </h4>
                          <p className="text-sm text-stone-600 dark:text-stone-400">
                            {category._count?.jobs || 0} jobs
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50 text-red-600"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-stone-700 dark:text-stone-300 mb-4">
                        {category.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {category.skills?.slice(0, 3).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                      {category.skills?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Edit Category Dialog */}
            <Dialog
              open={showEditCategoryDialog}
              onOpenChange={setShowEditCategoryDialog}
            >
              <DialogContent className="bg-white dark:bg-stone-900">
                <DialogHeader>
                  <DialogTitle>Edit Category</DialogTitle>
                  <DialogDescription>
                    Update the category information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editCategoryName">Category Name</Label>
                    <Input
                      id="editCategoryName"
                      value={editingCategory?.name || ""}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Information Technology"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editCategoryDescription">Description</Label>
                    <Textarea
                      id="editCategoryDescription"
                      value={editingCategory?.description || ""}
                      onChange={(e) =>
                        setEditingCategory((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Brief description of this category"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditCategoryDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateCategory}>
                      Update Category
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800 dark:text-white">
                  Pricing Plans Management
                </h3>
                <p className="text-stone-600 dark:text-stone-300">
                  Create and manage job posting pricing plans
                </p>
              </div>
              <Dialog
                open={showAddPlanDialog}
                onOpenChange={setShowAddPlanDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-stone-900 hover:bg-stone-800 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-stone-900">
                  <DialogHeader>
                    <DialogTitle>Create Pricing Plan</DialogTitle>
                    <DialogDescription>
                      Set up a new pricing plan for job postings
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="planName">Plan Name</Label>
                      <Input
                        id="planName"
                        value={newPlan.name}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Basic Plan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planPrice">Price (₹)</Label>
                      <Input
                        id="planPrice"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        placeholder="299"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planDuration">Duration (days)</Label>
                      <Input
                        id="planDuration"
                        type="number"
                        value={newPlan.duration}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            duration: e.target.value,
                          }))
                        }
                        placeholder="30"
                      />
                    </div>
                    <div>
                      <Label htmlFor="planFeatures">
                        Features (comma separated)
                      </Label>
                      <Textarea
                        id="planFeatures"
                        value={newPlan.features}
                        onChange={(e) =>
                          setNewPlan((prev) => ({
                            ...prev,
                            features: e.target.value,
                          }))
                        }
                        placeholder="Featured listing, Priority support, Analytics"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddPlanDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={() => handleAddPlan()}>
                        Create Plan
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pricingPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className="bg-white/80 dark:bg-stone-800/50 backdrop-blur-sm border border-stone-200 dark:border-stone-700 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[240px] flex flex-col"
                >
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                          {plan.name}
                        </h4>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-3xl font-bold text-stone-900 dark:text-white">
                            ₹{plan.price}
                          </span>
                          <span className="text-sm text-stone-600 dark:text-stone-400">
                            /{plan.duration} days
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/50 dark:bg-stone-800/50 text-red-600"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      {plan.features?.slice(0, 3).map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-sm text-stone-700 dark:text-stone-300"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>{feature.trim()}</span>
                        </div>
                      ))}
                      {Array.isArray(plan.features) && plan.features.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-0 text-stone-700 dark:text-stone-300"
                          onClick={() => { setFeaturesPlan(plan); setShowFeaturesDialog(true); }}
                        >
                          View all features
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <span>
                        Used by {plan._count?.purchases || 0} companies
                      </span>
                      <Badge variant={plan.active ? "default" : "secondary"}>
                        {plan.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Details Dialog */}
            <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
              <DialogContent className="bg-white dark:bg-stone-900 max-w-lg">
                <DialogHeader>
                  <DialogTitle>{featuresPlan?.name} - All Features</DialogTitle>
                  <DialogDescription>Full list of features for this plan</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  {Array.isArray(featuresPlan?.features) && featuresPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-sm text-stone-700 dark:text-stone-300">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Pricing Plan Dialog */}
            <Dialog
              open={showEditPlanDialog}
              onOpenChange={setShowEditPlanDialog}
            >
              <DialogContent className="bg-white dark:bg-stone-900">
                <DialogHeader>
                  <DialogTitle>Edit Pricing Plan</DialogTitle>
                  <DialogDescription>
                    Update the pricing plan information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editPlanName">Plan Name</Label>
                    <Input
                      id="editPlanName"
                      value={editingPlan?.name || ""}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="e.g., Basic Plan"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPlanPrice">Price (₹)</Label>
                    <Input
                      id="editPlanPrice"
                      type="number"
                      value={editingPlan?.price || ""}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      placeholder="299"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPlanDuration">Duration (days)</Label>
                    <Input
                      id="editPlanDuration"
                      type="number"
                      value={editingPlan?.duration || ""}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editPlanFeatures">
                      Features (comma separated)
                    </Label>
                    <Textarea
                      id="editPlanFeatures"
                      value={editingPlan?.features || ""}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({
                          ...prev,
                          features: e.target.value,
                        }))
                      }
                      placeholder="Featured listing, Priority support, Analytics"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editPlanPopular"
                      checked={editingPlan?.popular || false}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({
                          ...prev,
                          popular: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="editPlanPopular">Mark as Popular</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowEditPlanDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpdatePlan}>Update Plan</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>
          <TabsContent value="settings" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 text-stone-800 dark:text-white">
                Application Settings
              </h2>
              <p className="text-stone-600 dark:text-stone-300">
                Manage Job Gujarat application settings and branding
              </p>
            </div>

            {/* Logo Management */}
            <Card className="bg-white/80 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-stone-800 dark:text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Application Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  {appLogo ? (
                    <AppLogo
                      size="w-12 h-12"
                      rounded="rounded-xl"
                      mode="contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-stone-200 dark:bg-stone-700 rounded-xl flex items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-600">
                      <Briefcase className="w-6 h-6 text-stone-400" />
                    </div>
                  )}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        id="logoUpload"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) handleLogoUpload(file);
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="logoUpload"
                        className="inline-flex items-center px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg cursor-pointer transition-colors duration-200 font-medium"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        {uploadingLogo
                          ? "Uploading..."
                          : appLogo
                          ? "Change Logo"
                          : "Upload Logo"}
                      </label>
                      {appLogo && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveLogo}
                          className="border-stone-300 dark:border-stone-600"
                        >
                          Remove Logo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
