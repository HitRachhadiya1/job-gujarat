import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase, 
  LogOut, 
  Search, 
  MapPin, 
  DollarSign, 
  Clock,
  Moon,
  Sun,
  Target
} from "lucide-react"

export default function JobSeekerDashboard({ onLogout }) {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      location: "San Francisco, CA",
      salary: "$120k - $150k",
      type: "Full-time",
      posted: "2 days ago",
      match: 95,
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "Design Studio",
      location: "Remote",
      salary: "$80k - $100k",
      type: "Full-time", 
      posted: "1 day ago",
      match: 88,
    },
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? "bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100"
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100/30 to-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-slate-100/30 to-blue-200/30 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 backdrop-blur-sm border-b shadow-sm transition-colors duration-300 ${
        isDarkMode ? "bg-slate-900/80 border-slate-700/50" : "bg-white/80 border-slate-200/50"
      }`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}>
                  Job Seeker Hub
                </h1>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}>
                  Professional Career Discovery
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <div className={`flex items-center space-x-2 backdrop-blur-sm rounded-full px-4 py-2 border transition-colors duration-300 ${
                isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white/60 border-slate-200"
              }`}>
                <Target className="w-4 h-4 text-blue-600" />
                <span className={`text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  95% Match Rate
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={`transition-colors duration-300 ${
                  isDarkMode ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                }`}
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
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
            Recommended Jobs
          </h2>
          <p className={`${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
            Find your perfect career match
          </p>
        </div>

        <div className="grid gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className={`${isDarkMode ? "bg-slate-800/50" : "bg-white/80"} backdrop-blur-sm`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className={`${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      {job.title}
                    </CardTitle>
                    <CardDescription className={`${isDarkMode ? "text-slate-300" : "text-slate-600"} text-lg mt-1`}>
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800">
                    {job.match}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-sm text-slate-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {job.posted}
                  </div>
                </div>
                <Badge variant="outline">{job.type}</Badge>
                <div className="flex gap-2 mt-4">
                  <Button className="bg-gradient-to-r from-blue-600 to-slate-700 text-white">
                    Apply Now
                  </Button>
                  <Button variant="outline">
                    Save Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
