"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Brain, Eye, Activity, TrendingUp, Download, CalendarIcon, Search, FileText, Share } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  id: string
  fundus_confidence: number
  erg_confidence: number
  combined_confidence: number
  color_blindness_type: string
  severity_level: string
  created_at: string
  fundus_image?: {
    filename: string
    quality_score: number
  }
  erg_data?: {
    filename: string
    signal_quality: number
  }
}

interface DashboardStats {
  totalAnalyses: number
  normalResults: number
  abnormalResults: number
  averageConfidence: number
  recentAnalyses: AnalysisResult[]
}

export default function ResultsDashboardPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load all multimodal analyses with related data
      const { data: analysesData } = await supabase
        .from("multimodal_analyses")
        .select(
          `
          *,
          fundus_images!inner(filename, quality_score),
          erg_data!inner(filename, signal_quality)
        `,
        )
        .eq("analysis_status", "completed")
        .order("created_at", { ascending: false })

      const formattedAnalyses: AnalysisResult[] =
        analysesData?.map((analysis) => ({
          id: analysis.id,
          fundus_confidence: analysis.fundus_confidence,
          erg_confidence: analysis.erg_confidence,
          combined_confidence: analysis.combined_confidence,
          color_blindness_type: analysis.color_blindness_type,
          severity_level: analysis.severity_level,
          created_at: analysis.created_at,
          fundus_image: {
            filename: analysis.fundus_images.filename,
            quality_score: analysis.fundus_images.quality_score,
          },
          erg_data: {
            filename: analysis.erg_data.filename,
            signal_quality: analysis.erg_data.signal_quality,
          },
        })) || []

      setAnalyses(formattedAnalyses)

      // Calculate dashboard statistics
      const totalAnalyses = formattedAnalyses.length
      const normalResults = formattedAnalyses.filter((a) => a.color_blindness_type === "Normal").length
      const abnormalResults = totalAnalyses - normalResults
      const averageConfidence =
        formattedAnalyses.reduce((sum, a) => sum + a.combined_confidence, 0) / totalAnalyses || 0

      setStats({
        totalAnalyses,
        normalResults,
        abnormalResults,
        averageConfidence,
        recentAnalyses: formattedAnalyses.slice(0, 5),
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnalyses = analyses.filter((analysis) => {
    const matchesSearch =
      analysis.color_blindness_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.fundus_image?.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.erg_data?.filename.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || analysis.color_blindness_type === filterType

    const matchesDate =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(analysis.created_at) >= dateRange.from && new Date(analysis.created_at) <= dateRange.to)

    return matchesSearch && matchesType && matchesDate
  })

  // Prepare chart data
  const confidenceData = filteredAnalyses.map((analysis, index) => ({
    name: `Analysis ${index + 1}`,
    fundus: Math.round(analysis.fundus_confidence * 100),
    erg: Math.round(analysis.erg_confidence * 100),
    combined: Math.round(analysis.combined_confidence * 100),
  }))

  const typeDistribution = analyses.reduce(
    (acc, analysis) => {
      acc[analysis.color_blindness_type] = (acc[analysis.color_blindness_type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(typeDistribution).map(([type, count]) => ({
    name: type,
    value: count,
  }))

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"]

  const exportResults = () => {
    const csvContent = [
      ["Date", "Type", "Severity", "Combined Confidence", "Fundus Confidence", "ERG Confidence"].join(","),
      ...filteredAnalyses.map((analysis) =>
        [
          format(new Date(analysis.created_at), "yyyy-MM-dd"),
          analysis.color_blindness_type,
          analysis.severity_level,
          Math.round(analysis.combined_confidence * 100),
          Math.round(analysis.fundus_confidence * 100),
          Math.round(analysis.erg_confidence * 100),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `color-blindness-results-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-2 border-medical-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-medical-text-secondary">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-medical-primary mb-2">Results Dashboard</h1>
        <p className="text-medical-text-secondary">
          Comprehensive overview of your color blindness analysis results and trends
        </p>
      </div>

      {/* Dashboard Statistics */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Brain className="h-8 w-8 text-medical-accent" />
                <div>
                  <div className="text-2xl font-bold text-medical-primary">{stats.totalAnalyses}</div>
                  <div className="text-sm text-medical-text-secondary">Total Analyses</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Eye className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.normalResults}</div>
                  <div className="text-sm text-medical-text-secondary">Normal Results</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.abnormalResults}</div>
                  <div className="text-sm text-medical-text-secondary">Abnormal Results</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-medical-accent" />
                <div>
                  <div className="text-2xl font-bold text-medical-primary">
                    {Math.round(stats.averageConfidence * 100)}%
                  </div>
                  <div className="text-sm text-medical-text-secondary">Avg Confidence</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analyses">All Analyses</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Analyses</CardTitle>
                <CardDescription>Your latest color blindness assessments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.recentAnalyses.map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 bg-medical-surface rounded">
                      <div>
                        <div className="font-medium">{analysis.color_blindness_type}</div>
                        <div className="text-sm text-medical-text-secondary">
                          {format(new Date(analysis.created_at), "MMM dd, yyyy")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {Math.round(analysis.combined_confidence * 100)}% confidence
                        </div>
                        <Badge
                          variant={
                            analysis.severity_level === "None"
                              ? "default"
                              : analysis.severity_level === "Mild"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {analysis.severity_level}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Diagnosis Distribution</CardTitle>
                <CardDescription>Breakdown of color blindness types detected</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analyses" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-medical-text-secondary" />
                    <Input
                      placeholder="Search analyses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Protanopia">Protanopia</SelectItem>
                      <SelectItem value="Deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="Tritanopia">Tritanopia</SelectItem>
                      <SelectItem value="Protanomaly">Protanomaly</SelectItem>
                      <SelectItem value="Deuteranomaly">Deuteranomaly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("justify-start text-left font-normal")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button onClick={exportResults} variant="outline" className="w-full bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results ({filteredAnalyses.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="border rounded-lg p-4 hover:bg-medical-surface cursor-pointer transition-colors"
                    onClick={() => setSelectedAnalysis(analysis)}
                  >
                    <div className="grid md:grid-cols-6 gap-4 items-center">
                      <div>
                        <div className="font-medium">{analysis.color_blindness_type}</div>
                        <div className="text-sm text-medical-text-secondary">
                          {format(new Date(analysis.created_at), "MMM dd, yyyy")}
                        </div>
                      </div>

                      <div className="text-center">
                        <Badge
                          variant={
                            analysis.severity_level === "None"
                              ? "default"
                              : analysis.severity_level === "Mild"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {analysis.severity_level}
                        </Badge>
                      </div>

                      <div className="text-center">
                        <div className="text-sm font-medium">{Math.round(analysis.combined_confidence * 100)}%</div>
                        <div className="text-xs text-medical-text-secondary">Combined</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm">{Math.round(analysis.fundus_confidence * 100)}%</div>
                        <div className="text-xs text-medical-text-secondary">Fundus</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm">{Math.round(analysis.erg_confidence * 100)}%</div>
                        <div className="text-xs text-medical-text-secondary">ERG</div>
                      </div>

                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAnalyses.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
                    <p className="text-medical-text-secondary">No analyses found matching your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Confidence Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Confidence Score Trends</CardTitle>
              <CardDescription>Track AI model confidence across your analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="combined" stroke="#0ea5e9" strokeWidth={2} name="Combined" />
                    <Line type="monotone" dataKey="fundus" stroke="#10b981" strokeWidth={2} name="Fundus CNN" />
                    <Line type="monotone" dataKey="erg" stroke="#f59e0b" strokeWidth={2} name="ERG MLP" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Model Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Analysis</CardTitle>
              <CardDescription>Comparison of CNN and MLP model confidence scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={confidenceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="fundus" fill="#10b981" name="Fundus CNN" />
                    <Bar dataKey="erg" fill="#f59e0b" name="ERG MLP" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <CardDescription>Create comprehensive reports for medical records or sharing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Comprehensive Report</span>
                  <span className="text-xs opacity-75">All analyses with detailed insights</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Share className="h-6 w-6" />
                  <span>Summary Report</span>
                  <span className="text-xs opacity-75">Key findings and recommendations</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <TrendingUp className="h-6 w-6" />
                  <span>Trend Analysis</span>
                  <span className="text-xs opacity-75">Progress tracking over time</span>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent">
                  <Download className="h-6 w-6" />
                  <span>Raw Data Export</span>
                  <span className="text-xs opacity-75">CSV/JSON format for analysis</span>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-900 mb-2">Report Features</div>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• HIPAA-compliant formatting for medical records</li>
                  <li>• Detailed AI model explanations and confidence metrics</li>
                  <li>• Visual charts and trend analysis</li>
                  <li>• Clinical recommendations and follow-up suggestions</li>
                  <li>• Secure sharing options with healthcare providers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
