import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  MapPin, 
  DollarSign, 
  Clock,
  Filter,
  Bookmark,
  BookmarkCheck,
  Building2,
  Users,
  Search,
  TrendingUp,
  Star,
  ExternalLink,
  ChevronRight
} from "lucide-react"
import Spinner from "./Spinner"

export default function JobSeekerDashboard() {
  const { getAccessTokenSilently } = useAuth0()
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("")
  const [savedJobs, setSavedJobs] = useState(new Set([2, 5]))
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [visibleCount, setVisibleCount] = useState(1)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = await getAccessTokenSilently()
        const response = await fetch('http://localhost:5000/api/job-postings', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        if (response.ok) {
          const jobsData = await response.json()
          setJobs(jobsData)
        } else {
          console.error('Failed to fetch jobs:', response.status, response.statusText)
        }
      } catch (err) {
        console.error('Error fetching jobs:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [getAccessTokenSilently])

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = !locationFilter || locationFilter === "all" || (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()))
    const matchesType = !jobTypeFilter || jobTypeFilter === "all" || job.jobType === jobTypeFilter
    return matchesSearch && matchesLocation && matchesType
  })

  const displayedJobs = filteredJobs.slice(0, visibleCount)

  const stats = {
    totalJobs: jobs.length,
    appliedJobs: 8,
    savedJobs: savedJobs.size,
    profileViews: 156
  }

  if (loading) {
    return <Spinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100/20 to-indigo-200/20 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-100/20 to-blue-200/20 dark:from-slate-900/10 dark:to-blue-900/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                Job Opportunities
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-lg">
                Discover your next career opportunity from top companies
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalJobs}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Available Jobs</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.appliedJobs}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Applied</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.savedJobs}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Saved</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.profileViews}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Profile Views</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filters */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Search jobs, companies, or keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="ahmedabad">Ahmedabad</SelectItem>
                    <SelectItem value="mumbai">Mumbai</SelectItem>
                    <SelectItem value="bangalore">Bangalore</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                  <SelectTrigger className="h-12 bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Listings */}
        <div className="space-y-4">
          {filteredJobs.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">No jobs found</h3>
                <p className="text-slate-600 dark:text-slate-400">Try adjusting your search criteria or filters</p>
              </CardContent>
            </Card>
          ) : (
            displayedJobs.map((job) => (
              <Card key={job.id} className={`group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden ${
                job.featured 
                  ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/50 dark:to-indigo-950/50 ring-2 ring-blue-200/50 dark:ring-blue-800/30' 
                  : 'bg-white/80 dark:bg-slate-800/80'
              } backdrop-blur-sm`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {job.featured && (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 text-xs px-2 py-1">
                                <Star className="w-3 h-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-0">
                              {job.match ?? 90}% Match
                            </Badge>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <span className="text-slate-600 dark:text-slate-300 font-medium">{job.company?.name || 'Company'}</span>
                              <span className="text-slate-400 dark:text-slate-500">•</span>
                              {job.companySize && (
                                <span className="text-sm text-slate-500 dark:text-slate-400">{job.companySize} employees</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSaveJob(job.id)}
                          className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {savedJobs.has(job.id) ? (
                            <BookmarkCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Bookmark className="w-5 h-5" />
                          )}
                        </Button>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {job.description}
                      </p>

                      {/* Job Details Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-300">{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{job.salaryRange || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 dark:text-slate-300">{job.posted || ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-slate-400" />
                          {typeof job.applicants === 'number' && (
                            <span className="text-slate-600 dark:text-slate-300">{job.applicants} applicants</span>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      {Array.isArray(job.skills) && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Separator className="bg-slate-200 dark:bg-slate-700" />

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            {job.jobType || job.type || '—'}
                          </Badge>
                          {job.experience && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">{job.experience} experience</span>
                          )}
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                            View Details
                            <ExternalLink className="w-4 h-4 ml-2" />
                          </Button>
                          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all">
                            Apply Now
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Load More */}
        {filteredJobs.length > visibleCount && (
          <div className="text-center mt-8">
            <Button onClick={() => setVisibleCount(filteredJobs.length)} variant="outline" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Load More Jobs ({filteredJobs.length - visibleCount} more)
              <TrendingUp className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
