import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { useAuthMeta } from '../context/AuthMetaContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Home,
  Briefcase,
  FileText,
  Heart,
  Target,
  Search,
  User,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Calendar,
  Clock,
  BarChart3,
  Edit,
  MapPin,
  Building2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Menu,
  X
} from "lucide-react"
import Spinner from "./Spinner"
import ThemeToggle from './ThemeToggle'
import Profile from '../pages/Profile'
import BrowseJobs from '../pages/BrowseJobs'
import MyApplications from '../pages/MyApplications'

export default function JobSeekerDashboard() {
  const { getAccessTokenSilently, user, logout } = useAuth0()
  const { role } = useAuthMeta()
  const [searchTerm, setSearchTerm] = useState("")
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')

  // Dynamic data states
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviewSchedule: 0,
    profileViews: 0
  })

  const [profileViewsData, setProfileViewsData] = useState([])

  // Navigation items for sidebar
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'browse-jobs', label: 'Browse Jobs', icon: Search },
    { id: 'applications', label: 'My Applications', icon: FileText },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Heart },
    { id: 'recommendations', label: 'Recommendations', icon: Target }
  ]

  const handleLogout = () => {
    logout({ returnTo: window.location.origin })
  }

  const handleNavigation = (viewId) => {
    setActiveView(viewId)
  }

  // Render the active view component
  const renderActiveView = () => {
    switch (activeView) {
      case 'profile':
        return <Profile />
      case 'browse-jobs':
        return <BrowseJobs />
      case 'applications':
        return <MyApplications />
      case 'saved-jobs':
        return (
          <div className="max-w-7xl mx-auto p-8 text-center">
            <Heart className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Saved Jobs</h2>
            <p className="text-slate-600 dark:text-slate-400">This feature is coming soon!</p>
          </div>
        )
      case 'recommendations':
        return (
          <div className="max-w-7xl mx-auto p-8 text-center">
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Job Recommendations</h2>
            <p className="text-slate-600 dark:text-slate-400">Personalized job recommendations coming soon!</p>
          </div>
        )
      default:
        return renderDashboardContent()
    }
  }

  // Dashboard content as a separate function
  const renderDashboardContent = () => (
    <div className="max-w-7xl mx-auto">
      {/* Top dashboard summary removed to keep header concise */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats and Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full shadow-lg">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.appliedJobs}</div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">Applied Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.savedJobs}</div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">Saved Jobs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700/50 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.interviewSchedule}</div>
                    <div className="text-sm text-green-600 dark:text-green-400">Interviews</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Views Chart */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">Profile Views</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">Your profile visibility over time</p>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-slate-100">{stats.profileViews}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between space-x-2">
                {profileViewsData.map((data, index) => (
                  <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t shadow-sm"
                      style={{
                        height: `${(data.views / 400) * 200}px`,
                        minHeight: '20px'
                      }}
                    ></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Applications Table */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">My Applications</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">Track your job application progress</p>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => handleNavigation('applications')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {applications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Company</th>
                        <th className="text-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="text-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Applied Date</th>
                        <th className="text-center py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.slice(0, 3).map((app) => (
                        <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {typeof app.jobPosting?.company === 'object' ? app.jobPosting?.company?.name : app.jobPosting?.company || 'Company'}
                                </div>
                                <div className="text-sm text-slate-500 dark:text-slate-400">{app.jobPosting?.title || 'Job Title'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-4">
                            <Badge
                              variant={app.status === "applied" ? "secondary" : app.status === "interview_scheduled" ? "default" : "outline"}
                              className={
                                app.status === "applied" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" :
                                app.status === "interview_scheduled" ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" :
                                "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                              }
                            >
                              {app.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </td>
                          <td className="text-center py-4 text-sm text-slate-600 dark:text-slate-400">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="text-center py-4">
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No applications yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleNavigation('browse-jobs')}>
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Jobs Section */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">Recent Jobs</CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">Latest job opportunities for you</p>
              </div>
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700" onClick={() => handleNavigation('browse-jobs')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-slate-700 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">{job.title}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {typeof job.company === 'object' ? job.company?.name : job.company}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500 dark:text-slate-400">{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {job.type}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={() => handleNavigation('browse-jobs')}>
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">No jobs available</p>
                  <Button variant="outline" className="mt-4" onClick={() => handleNavigation('browse-jobs')}>
                    Browse Jobs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Profile Card */}
        <div className="space-y-6">
          {/* Job Search Progress */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 border-green-200 dark:border-green-700/50 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-green-800 dark:text-green-300">Job Search Progress</h3>
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 dark:text-green-300">Profile Completion</span>
                  <span className="font-medium text-green-800 dark:text-green-200">85%</span>
                </div>
                <div className="w-full bg-green-200 dark:bg-green-800/30 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-green-700 dark:text-green-300">Applications This Week</span>
                  <span className="font-medium text-green-800 dark:text-green-200">{stats.appliedJobs}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Card */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardContent className="p-6 text-center">
              <img
                src={user?.picture || "https://via.placeholder.com/80/6B7280/FFFFFF?text=U"}
                alt="Profile"
                className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-slate-200 dark:border-slate-600"
              />
              <h3 className="font-semibold text-lg bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                {user?.name || "User"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Job Seeker</p>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.appliedJobs}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Applications</div>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100">{stats.profileViews}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Profile Views</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white shadow-md"
                  onClick={() => handleNavigation('profile')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  onClick={() => handleNavigation('browse-jobs')}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find Jobs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-slate-900 dark:text-slate-100">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navigationItems.slice(1).map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    <span className="text-sm">{item.label}</span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = await getAccessTokenSilently()
        
        // Fetch applications
        const appsResponse = await fetch('http://localhost:5000/api/applications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (appsResponse.ok) {
          const appsData = await appsResponse.json()
          setApplications(appsData)
          
          // Calculate stats from real data
          setStats({
            appliedJobs: appsData.length,
            savedJobs: 0, // Will be fetched separately
            interviewSchedule: appsData.filter(app => app.status === 'interview_scheduled').length,
            profileViews: Math.floor(Math.random() * 1000) + 500 // Mock for now
          })
        }

        // Fetch recent jobs
        const jobsResponse = await fetch('http://localhost:5000/api/job-postings?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json()
          setJobs(jobsData)
        }

        // Generate mock profile views data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const viewsData = months.map(month => ({
          month,
          views: Math.floor(Math.random() * 300) + 100
        }))
        setProfileViewsData(viewsData)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [getAccessTokenSilently])

  const getStatusIcon = (status) => {
    switch (status) {
      case "applied":
      case "selected":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "waiting":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "hired":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "applied": return "Applied"
      case "selected": return "Selected"
      case "waiting": return "Waiting"
      case "rejected": return "Rejected"
      case "hired": return "Hired"
      default: return "Unknown"
    }
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="h-screen bg-white dark:bg-slate-900 flex transition-colors duration-300 overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-slate-700 dark:from-blue-500 dark:to-slate-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                  Job Gujarat
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Connecting you to What's Next</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 bg-white dark:bg-slate-800 overflow-hidden">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant="ghost"
                className={`w-full ${sidebarCollapsed ? 'justify-center px-3' : 'justify-start px-4'} py-3 text-left transition-all duration-200 ${
                  activeView === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-slate-700 text-white shadow-md hover:from-blue-700 hover:to-slate-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                onClick={() => handleNavigation(item.id)}
              >
                <Icon className="w-5 h-5" />
                {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Button>
            )
          })}
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
                {`Welcome, ${user?.given_name || (user?.name?.split(' ')[0]) || 'User'}`}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* User Profile Dropdown */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <img
                  src={user?.picture || "https://via.placeholder.com/32/6B7280/FFFFFF?text=U"}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.given_name || user?.name?.split(' ')[0] || "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Job Seeker</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-50/50 dark:bg-slate-900/50">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}
