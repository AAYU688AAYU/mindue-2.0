"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, Eye, Activity, Zap, AlertCircle, Play, RefreshCw } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { MultimodalResults } from "@/components/multimodal-results"

interface FundusImage {
  id: string
  filename: string
  file_url: string
  processing_status: string
  quality_score?: number
}

interface ERGData {
  id: string
  filename: string
  processing_status: string
  signal_quality?: number
}

interface AnalysisResult {
  id: string
  fundus_confidence: number
  erg_confidence: number
  combined_confidence: number
  color_blindness_type: string
  severity_level: string
  analysis_details: any
  created_at: string
}

export default function MultimodalAnalysisPage() {
  const [fundusImages, setFundusImages] = useState<FundusImage[]>([])
  const [ergData, setErgData] = useState<ERGData[]>([])
  const [selectedFundus, setSelectedFundus] = useState<string>("")
  const [selectedERG, setSelectedERG] = useState<string>("")
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Load processed fundus images
      const { data: fundusData } = await supabase
        .from("fundus_images")
        .select("*")
        .eq("processing_status", "completed")
        .order("created_at", { ascending: false })

      // Load processed ERG data
      const { data: ergDataResult } = await supabase
        .from("erg_data")
        .select("*")
        .eq("processing_status", "completed")
        .order("created_at", { ascending: false })

      setFundusImages(fundusData || [])
      setErgData(ergDataResult || [])
    } catch (err) {
      setError("Failed to load data")
    }
  }

  const runMultimodalAnalysis = async () => {
    if (!selectedFundus || !selectedERG) {
      setError("Please select both fundus image and ERG data")
      return
    }

    setError(null)
    setAnalyzing(true)
    setAnalysisProgress(0)

    try {
      // Start analysis
      const response = await fetch("/api/analysis/multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fundusId: selectedFundus,
          ergId: selectedERG,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const result = await response.json()

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Wait for analysis completion (simulated)
      setTimeout(async () => {
        clearInterval(progressInterval)
        setAnalysisProgress(100)

        // Fetch the completed analysis
        const { data: analysisData } = await supabase
          .from("multimodal_analyses")
          .select("*")
          .eq("id", result.analysisId)
          .single()

        setCurrentResult(analysisData)
        setAnalyzing(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed")
      setAnalyzing(false)
      setAnalysisProgress(0)
    }
  }

  const selectedFundusImage = fundusImages.find((img) => img.id === selectedFundus)
  const selectedERGFile = ergData.find((erg) => erg.id === selectedERG)

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-medical-primary mb-2">Multimodal AI Analysis</h1>
        <p className="text-medical-text-secondary">
          Combine fundus imaging and ERG data for comprehensive color blindness detection using advanced AI models
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Model Setup
              </CardTitle>
              <CardDescription>Select data inputs for multimodal analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fundus Image Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Fundus Image
                </label>
                <Select value={selectedFundus} onValueChange={setSelectedFundus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fundus image" />
                  </SelectTrigger>
                  <SelectContent>
                    {fundusImages.map((image) => (
                      <SelectItem key={image.id} value={image.id}>
                        <div className="flex items-center gap-2">
                          <span>{image.filename}</span>
                          {image.quality_score && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(image.quality_score * 100)}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ERG Data Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  ERG Data
                </label>
                <Select value={selectedERG} onValueChange={setSelectedERG}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ERG data" />
                  </SelectTrigger>
                  <SelectContent>
                    {ergData.map((erg) => (
                      <SelectItem key={erg.id} value={erg.id}>
                        <div className="flex items-center gap-2">
                          <span>{erg.filename}</span>
                          {erg.signal_quality && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(erg.signal_quality * 100)}%
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Analysis Button */}
              <Button
                onClick={runMultimodalAnalysis}
                disabled={!selectedFundus || !selectedERG || analyzing}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run AI Analysis
                  </>
                )}
              </Button>

              {analyzing && (
                <div className="space-y-2">
                  <Progress value={analysisProgress} className="w-full" />
                  <div className="text-xs text-medical-text-secondary">
                    {analysisProgress < 30 && "Processing fundus image with CNN..."}
                    {analysisProgress >= 30 && analysisProgress < 60 && "Analyzing ERG signals with MLP..."}
                    {analysisProgress >= 60 && analysisProgress < 90 && "Fusing multimodal features..."}
                    {analysisProgress >= 90 && "Generating final predictions..."}
                  </div>
                </div>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Model Architecture Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Model Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-medical-accent" />
                <div>
                  <div className="font-medium">CNN for Fundus Images</div>
                  <div className="text-medical-text-secondary">ResNet-50 based feature extraction</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-medical-accent" />
                <div>
                  <div className="font-medium">MLP for ERG Signals</div>
                  <div className="text-medical-text-secondary">Multi-layer perceptron for signal analysis</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-medical-accent" />
                <div>
                  <div className="font-medium">Fusion Network</div>
                  <div className="text-medical-text-secondary">Late fusion with attention mechanism</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-2">
          {currentResult ? (
            <MultimodalResults result={currentResult} fundusImage={selectedFundusImage} ergFile={selectedERGFile} />
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Brain className="h-16 w-16 mx-auto mb-4 text-medical-text-secondary" />
                  <h3 className="text-lg font-medium mb-2">Ready for AI Analysis</h3>
                  <p className="text-medical-text-secondary">
                    Select fundus image and ERG data, then run the multimodal analysis to get comprehensive color
                    blindness assessment
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
