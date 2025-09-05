"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, TrendingUp, Zap, Eye } from "lucide-react"

interface ERGDataVisualizationProps {
  file: {
    id: string
    filename: string
    signal_quality?: number
    extracted_features?: any
    processing_status: string
  }
}

export function ERGDataVisualization({ file }: ERGDataVisualizationProps) {
  if (!file.extracted_features) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
          <p className="text-medical-text-secondary">
            ERG data is still processing. Please wait for feature extraction to complete.
          </p>
        </CardContent>
      </Card>
    )
  }

  const features = file.extracted_features

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getAmplitudeStatus = (amplitude: number, type: "a" | "b") => {
    const normal = type === "a" ? [50, 150] : [200, 500]
    if (amplitude >= normal[0] && amplitude <= normal[1]) return "Normal"
    if (amplitude < normal[0]) return "Reduced"
    return "Elevated"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            ERG Signal Analysis: {file.filename}
          </CardTitle>
          <CardDescription>Comprehensive analysis of electroretinography signal characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-medical-primary">
                {file.signal_quality ? Math.round(file.signal_quality * 100) : 0}%
              </div>
              <div className="text-sm text-medical-text-secondary">Signal Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-medical-primary">
                {features.signal_to_noise_ratio?.toFixed(1)} dB
              </div>
              <div className="text-sm text-medical-text-secondary">SNR</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-medical-primary">
                {features.baseline_stability ? Math.round(features.baseline_stability * 100) : 0}%
              </div>
              <div className="text-sm text-medical-text-secondary">Baseline Stability</div>
            </div>
          </div>

          {features.artifact_detection && (
            <div className="mb-4">
              <Badge variant="destructive" className="bg-red-100 text-red-800">
                Artifacts Detected - Review Signal Quality
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="waveforms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waveforms">Waveform Analysis</TabsTrigger>
          <TabsTrigger value="features">Feature Extraction</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Interpretation</TabsTrigger>
        </TabsList>

        <TabsContent value="waveforms" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-4 w-4" />
                  A-Wave Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Amplitude:</span>
                    <span className="font-mono font-medium">{features.a_wave_amplitude?.toFixed(1)} μV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Latency:</span>
                    <span className="font-mono font-medium">{features.a_wave_latency?.toFixed(1)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Status:</span>
                    <Badge
                      variant={
                        getAmplitudeStatus(features.a_wave_amplitude, "a") === "Normal" ? "default" : "secondary"
                      }
                    >
                      {getAmplitudeStatus(features.a_wave_amplitude, "a")}
                    </Badge>
                  </div>
                </div>

                {/* Mock waveform visualization */}
                <div className="h-32 bg-medical-surface rounded border flex items-center justify-center">
                  <div className="text-medical-text-secondary text-sm">
                    A-Wave Visualization
                    <br />
                    <span className="text-xs">Negative deflection at ~{features.a_wave_latency?.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-4 w-4" />
                  B-Wave Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Amplitude:</span>
                    <span className="font-mono font-medium">{features.b_wave_amplitude?.toFixed(1)} μV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Latency:</span>
                    <span className="font-mono font-medium">{features.b_wave_latency?.toFixed(1)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-medical-text-secondary">Status:</span>
                    <Badge
                      variant={
                        getAmplitudeStatus(features.b_wave_amplitude, "b") === "Normal" ? "default" : "secondary"
                      }
                    >
                      {getAmplitudeStatus(features.b_wave_amplitude, "b")}
                    </Badge>
                  </div>
                </div>

                {/* Mock waveform visualization */}
                <div className="h-32 bg-medical-surface rounded border flex items-center justify-center">
                  <div className="text-medical-text-secondary text-sm">
                    B-Wave Visualization
                    <br />
                    <span className="text-xs">Positive deflection at ~{features.b_wave_latency?.toFixed(0)}ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Signal Features</CardTitle>
              <CardDescription>Quantitative measurements derived from ERG signal analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-medical-primary">Amplitude Measurements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>A-wave Amplitude:</span>
                      <span className="font-mono">{features.a_wave_amplitude?.toFixed(1)} μV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B-wave Amplitude:</span>
                      <span className="font-mono">{features.b_wave_amplitude?.toFixed(1)} μV</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B/A Ratio:</span>
                      <span className="font-mono">
                        {(features.b_wave_amplitude / features.a_wave_amplitude).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-medical-primary">Timing Measurements</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>A-wave Latency:</span>
                      <span className="font-mono">{features.a_wave_latency?.toFixed(1)} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>B-wave Latency:</span>
                      <span className="font-mono">{features.b_wave_latency?.toFixed(1)} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Implicit Time:</span>
                      <span className="font-mono">{features.implicit_time?.toFixed(1)} ms</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-medical-primary mb-3">Additional Features</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Oscillatory Potentials:</span>
                    <Badge variant={features.oscillatory_potentials ? "default" : "secondary"}>
                      {features.oscillatory_potentials ? "Present" : "Absent"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Signal Quality:</span>
                    <span className={`font-medium ${getQualityColor(file.signal_quality || 0)}`}>
                      {file.signal_quality ? Math.round(file.signal_quality * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Clinical Interpretation
              </CardTitle>
              <CardDescription>Automated assessment based on ERG signal characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-medical-primary">Retinal Function Assessment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-medical-surface rounded">
                      <div className="font-medium mb-1">Photoreceptor Function</div>
                      <div className="text-medical-text-secondary">
                        {getAmplitudeStatus(features.a_wave_amplitude, "a") === "Normal"
                          ? "Normal photoreceptor response detected"
                          : "Potential photoreceptor dysfunction indicated"}
                      </div>
                    </div>
                    <div className="p-3 bg-medical-surface rounded">
                      <div className="font-medium mb-1">Bipolar Cell Function</div>
                      <div className="text-medical-text-secondary">
                        {getAmplitudeStatus(features.b_wave_amplitude, "b") === "Normal"
                          ? "Normal bipolar cell response detected"
                          : "Potential bipolar cell dysfunction indicated"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-medical-primary">Color Vision Indicators</h4>
                  <div className="space-y-2 text-sm">
                    <div className="p-3 bg-medical-surface rounded">
                      <div className="font-medium mb-1">Cone Response</div>
                      <div className="text-medical-text-secondary">
                        {features.oscillatory_potentials
                          ? "Oscillatory potentials suggest normal cone function"
                          : "Reduced oscillatory potentials may indicate cone dysfunction"}
                      </div>
                    </div>
                    <div className="p-3 bg-medical-surface rounded">
                      <div className="font-medium mb-1">Signal Integrity</div>
                      <div className="text-medical-text-secondary">
                        {(file.signal_quality || 0) >= 0.8
                          ? "High signal quality supports reliable color vision assessment"
                          : "Signal quality may affect color vision analysis accuracy"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-900 mb-2">Multimodal Analysis Recommendation</div>
                <div className="text-blue-800 text-sm">
                  Combine this ERG analysis with fundus imaging for comprehensive color blindness assessment. The ERG
                  provides functional data while fundus images offer structural information for improved diagnostic
                  accuracy.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
