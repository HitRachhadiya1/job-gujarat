import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  MapPin, 
  Building, 
  DollarSign, 
  Clock, 
  Bookmark, 
  Briefcase,
  SlidersHorizontal,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Bell,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  ExternalLink,
  ChevronRight,
  User,
  Settings,
  BookOpen,
  Star,
  Medal,
  Globe2,
  Zap,
  Activity,
  PieChart,
  Layers3,
  ShieldCheck
} from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react'
import Spinner from './Spinner'

export default function JobSeekerDashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("")
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { getAccessTokenSilently } = useAuth0()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const token = await getAccessTokenSilently()
      const response = await fetch('http://localhost:5000/api/job-postings', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setJobs(Array.isArray(data) ? data : [])
      } else {
        setError('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !locationFilter || 
      job.location?.toLowerCase().includes(locationFilter.toLowerCase())
    
    const matchesJobType = !jobTypeFilter || jobTypeFilter === 'all' || 
      job.jobType === jobTypeFilter

    return matchesSearch && matchesLocation && matchesJobType
  })

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const stats = {
    totalJobs: jobs.length,
    appliedJobs: 8,
    savedJobs: savedJobs.size,
    profileViews: 156
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(241,245,249,0.4)_1px,_transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,_rgba(51,65,85,0.1)_1px,_transparent_0)] bg-[length:60px_60px]"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Professional Header */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl blur-sm opacity-20"></div>
                <div className="relative p-4 bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-light tracking-tight text-slate-900 dark:text-slate-100">
                  Executive Dashboard
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-1 font-light">
                  Professional opportunities curated for you
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 font-medium">
                <User className="w-4 h-4 mr-2" />
                Account
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Professional Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                  <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                    {stats.totalJobs}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Available Positions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">This Week</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-slate-700 dark:bg-slate-300 h-1.5 rounded-full transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white" style={{width: '68%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                  <Bookmark className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                    {stats.savedJobs}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Saved Positions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Priority Level</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    High
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-slate-700 dark:bg-slate-300 h-1.5 rounded-full transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white" style={{width: '72%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                  <FileText className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                    {stats.appliedJobs}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Applied Positions
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">This Week</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    3 pending
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-slate-700 dark:bg-slate-300 h-1.5 rounded-full transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white" style={{width: '60%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300 cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                  <BarChart3 className="w-5 h-5 text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors duration-200" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                    {stats.profileViews}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Profile Views
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Engagement</span>
                  <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center">
                    <PieChart className="w-3 h-3 mr-1" />
                    92%
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                  <div className="bg-slate-700 dark:bg-slate-300 h-1.5 rounded-full transition-all duration-500 group-hover:bg-black dark:group-hover:bg-white" style={{width: '92%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Search Section */}
        <Card className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Search Opportunities
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Find positions matching your profile
                  </CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Position, company, keywords"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="pl-10 border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
              <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                <SelectTrigger className="border-slate-300 focus:border-slate-500 focus:ring-slate-500/20 dark:border-slate-600 dark:bg-slate-800">
                  <SelectValue placeholder="Employment Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="FULL_TIME">Full Time</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Professional Job Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                Available Positions
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {filteredJobs.length} opportunities found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 rounded-full animate-spin border-t-slate-600 dark:border-t-slate-300"></div>
            </div>
          ) : error ? (
            <Card className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <CardContent className="p-8 text-center">
                <ExternalLink className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                  Connection Error
                </h3>
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <Button onClick={fetchJobs} className="bg-red-600 hover:bg-red-700 text-white">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredJobs.length === 0 ? (
            <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <CardContent className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  No positions found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Try adjusting your search criteria to find more opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-slate-400 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-black dark:group-hover:text-white transition-colors duration-200">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                              <div className="flex items-center space-x-1">
                                <Building className="w-4 h-4" />
                                <span>{job.company?.name || 'Company'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location || 'Location not specified'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{job.jobType || 'Full-time'}</span>
                              </div>
                              {job.salaryRange && (
                                <div className="flex items-center space-x-1 text-slate-700 dark:text-slate-300 font-medium">
                                  <DollarSign className="w-4 h-4" />
                                  <span>{job.salaryRange}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSaveJob(job.id)}
                            className={`${
                              savedJobs.has(job.id)
                                ? 'text-slate-900 hover:text-black dark:text-slate-100 dark:hover:text-white'
                                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            } transition-colors duration-200`}
                          >
                            <Bookmark className={`w-4 h-4 ${savedJobs.has(job.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                        
                        <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-2">
                          {job.description?.substring(0, 200)}...
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors duration-200">
                              {job.jobType || 'Full-time'}
                            </Badge>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="bg-slate-900 hover:bg-black dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 transition-all duration-200 hover:shadow-md">
                              Apply Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
