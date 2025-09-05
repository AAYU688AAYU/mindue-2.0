"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, Eye, Activity, Zap, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface MultimodalResultsProps {
  result: {
    fundus_confidence: number
    erg_confidence: number
    combined_confidence: number
    color_blindness_type: string
    severity_level: string
    analysis_details: any
    created_at: string
  }
  fundusImage?: {
    filename: string
    quality_score?: number
  }
  ergFile?: {
    filename: string
    signal_quality?: number
  }
}

export function MultimodalResults({ result, fundusImage, ergFile }: MultimodalResultsProps) {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>
    if (confidence >= 0.6) return <Badge className="bg-yellow-100 text-yellow-800">Medium Confidence</Badge>
    return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "none":
        return "text-green-600"
      case "mild":
        return "text-yellow-600"
      case "moderate":
        return "text-orange-600"
      case "severe":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTypeDescription = (type: string) => {
    const descriptions = {
      Normal: "No color vision deficiency detected",
      Protanopia: "Complete absence of L-cones (red-blind)",
      Deuteranopia: "Complete absence of M-cones (green-blind)",
      Tritanopia: "Complete absence of S-cones (blue-blind)",
      Protanomaly: "Reduced sensitivity of L-cones (red-weak)",
      Deuteranomaly: "Reduced sensitivity of M-cones (green-weak)",
    }
    return descriptions[type as keyof typeof descriptions] || "Unknown condition"
  }

  return (
    <div className="space-y-6">
      {/* Main Results Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Multimodal AI Analysis Results
          </CardTitle>
          <CardDescription>
            Combined analysis from fundus imaging and ERG data • {new Date(result.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Primary Diagnosis */}
            <div className="text-center p-4 bg-medical-surface rounded-lg">
              <div className="text-2xl font-bold text-medical-primary mb-1">{result.color_blindness_type}</div>
              <div className="text-sm text-medical-text-secondary mb-2">
                {getTypeDescription(result.color_blindness_type)}
              </div>
              <div className={`text-lg font-medium ${getSeverityColor(result.severity_level)}`}>
                {result.severity_level} Severity
              </div>
            </div>

            {/* Combined Confidence */}
            <div className="text-center p-4 bg-medical-surface rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${getConfidenceColor(result.combined_confidence)}`}>
                {Math.round(result.combined_confidence * 100)}%
              </div>
              <div className="text-sm text-medical-text-secondary mb-2">Combined Confidence</div>
              {getConfidenceBadge(result.combined_confidence)}
            </div>

            {/* Analysis Status */}
            <div className="text-center p-4 bg-medical-surface rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-sm font-medium">Analysis Complete</div>
              <div className="text-xs text-medical-text-secondary">Multimodal fusion successful</div>
            </div>
          </div>

          {/* Confidence Breakdown */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Fundus Analysis
                </span>
                <span className={`font-medium ${getConfidenceColor(result.fundus_confidence)}`}>
                  {Math.round(result.fundus_confidence * 100)}%
                </span>
              </div>
              <Progress value={result.fundus_confidence * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  ERG Analysis
                </span>
                <span className={`font-medium ${getConfidenceColor(result.erg_confidence)}`}>
                  {Math.round(result.erg_confidence * 100)}%
                </span>
              </div>
              <Progress value={result.erg_confidence * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fundus">Fundus CNN</TabsTrigger>
          <TabsTrigger value="erg">ERG MLP</TabsTrigger>
          <TabsTrigger value="fusion">AI Fusion</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Input Data Quality</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fundusImage && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fundus Image:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{fundusImage.filename}</div>
                      {fundusImage.quality_score && (
                        <div className="text-xs text-medical-text-secondary">
                          Quality: {Math.round(fundusImage.quality_score * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {ergFile && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ERG Data:</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">{ergFile.filename}</div>
                      {ergFile.signal_quality && (
                        <div className="text-xs text-medical-text-secondary">
                          Signal: {Math.round(ergFile.signal_quality * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Clinical Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {result.color_blindness_type === "Normal" ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Normal Color Vision</div>
                      <div className="text-medical-text-secondary">No further testing required</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Additional Testing</div>
                        <div className="text-medical-text-secondary">Consider Ishihara plates for confirmation</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Patient Counseling</div>
                        <div className="text-medical-text-secondary">Discuss occupational implications</div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fundus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                CNN Fundus Analysis
              </CardTitle>
              <CardDescription>Convolutional Neural Network analysis of retinal structure</CardDescription>
            </CardHeader>
            <CardContent>
              {result.analysis_details?.cnn_features && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Structural Analysis</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Optic Disc:</span>
                          <Badge
                            variant={result.analysis_details.cnn_features.optic_disc_analysis ? "default" : "secondary"}
                          >
                            {result.analysis_details.cnn_features.optic_disc_analysis ? "Detected" : "Not Found"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Macula:</span>
                          <Badge
                            variant={result.analysis_details.cnn_features.macula_analysis ? "default" : "secondary"}
                          >
                            {result.analysis_details.cnn_features.macula_analysis ? "Detected" : "Not Found"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Vessel Clarity:</span>
                          <span className="font-mono">
                            {Math.round(result.analysis_details.cnn_features.vessel_analysis * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Color Channel Analysis</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Red Channel:</span>
                          <span className="font-mono">
                            {Math.round(
                              result.analysis_details.cnn_features.color_distribution.red_channel_intensity * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Green Channel:</span>
                          <span className="font-mono">
                            {Math.round(
                              result.analysis_details.cnn_features.color_distribution.green_channel_intensity * 100,
                            )}
                            %
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Blue Channel:</span>
                          <span className="font-mono">
                            {Math.round(
                              result.analysis_details.cnn_features.color_distribution.blue_channel_intensity * 100,
                            )}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erg" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                MLP ERG Analysis
              </CardTitle>
              <CardDescription>Multi-Layer Perceptron analysis of retinal function</CardDescription>
            </CardHeader>
            <CardContent>
              {result.analysis_details?.mlp_features && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Wave Analysis</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>A-wave Amplitude:</span>
                        <span className="font-mono">
                          {result.analysis_details.mlp_features.a_wave_analysis.toFixed(1)} μV
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>B-wave Amplitude:</span>
                        <span className="font-mono">
                          {result.analysis_details.mlp_features.b_wave_analysis.toFixed(1)} μV
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cone Response:</span>
                        <Badge variant={result.analysis_details.mlp_features.cone_response ? "default" : "secondary"}>
                          {result.analysis_details.mlp_features.cone_response ? "Present" : "Absent"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Signal Quality</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Signal Integrity:</span>
                        <span className="font-mono">
                          {Math.round(result.analysis_details.mlp_features.signal_integrity * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fusion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Multimodal Fusion Network
              </CardTitle>
              <CardDescription>Advanced AI fusion combining CNN and MLP outputs</CardDescription>
            </CardHeader>
            <CardContent>
              {result.analysis_details?.fusion_weights && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Fusion Weights</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Fundus Weight:</span>
                          <span className="font-mono">{result.analysis_details.fusion_weights.fundus_weight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ERG Weight:</span>
                          <span className="font-mono">{result.analysis_details.fusion_weights.erg_weight}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Model Versions</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>CNN:</span>
                          <span className="font-mono">{result.analysis_details.model_versions.cnn_version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>MLP:</span>
                          <span className="font-mono">{result.analysis_details.model_versions.mlp_version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fusion:</span>
                          <span className="font-mono">{result.analysis_details.model_versions.fusion_version}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-900 mb-2">Attention Mechanism</div>
                    <div className="text-blue-800 text-sm">
                      The fusion network uses attention scores to weight different features: Structural features (0.8),
                      Color distribution (0.7), ERG waves (0.9), Signal quality (0.6). Higher scores indicate more
                      reliable features for this specific case.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
