"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Brain, Eye, Activity, Download, Share } from "lucide-react"
import { format } from "date-fns"

interface AnalysisDetailModalProps {
  analysis: {
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
  } | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnalysisDetailModal({ analysis, open, onOpenChange }: AnalysisDetailModalProps) {
  if (!analysis) return null

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Analysis Details
          </DialogTitle>
          <DialogDescription>
            Comprehensive results from multimodal AI analysis • {format(new Date(analysis.created_at), "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Primary Results */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="text-center p-4 bg-medical-surface rounded-lg">
              <div className="text-2xl font-bold text-medical-primary mb-1">{analysis.color_blindness_type}</div>
              <div className={`text-lg font-medium ${getSeverityColor(analysis.severity_level)}`}>
                {analysis.severity_level} Severity
              </div>
            </div>

            <div className="text-center p-4 bg-medical-surface rounded-lg">
              <div className={`text-2xl font-bold mb-1 ${getConfidenceColor(analysis.combined_confidence)}`}>
                {Math.round(analysis.combined_confidence * 100)}%
              </div>
              <div className="text-sm text-medical-text-secondary">Combined Confidence</div>
            </div>
          </div>

          <Separator />

          {/* Model Breakdown */}
          <div className="space-y-4">
            <h3 className="font-medium text-medical-primary">AI Model Breakdown</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4 text-medical-accent" />
                  <span className="font-medium">Fundus CNN Analysis</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Confidence:</span>
                    <span className={`font-medium ${getConfidenceColor(analysis.fundus_confidence)}`}>
                      {Math.round(analysis.fundus_confidence * 100)}%
                    </span>
                  </div>
                  {analysis.fundus_image && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Image:</span>
                        <span className="text-sm font-mono">{analysis.fundus_image.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Quality:</span>
                        <span className="text-sm">{Math.round(analysis.fundus_image.quality_score * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="h-4 w-4 text-medical-accent" />
                  <span className="font-medium">ERG MLP Analysis</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Confidence:</span>
                    <span className={`font-medium ${getConfidenceColor(analysis.erg_confidence)}`}>
                      {Math.round(analysis.erg_confidence * 100)}%
                    </span>
                  </div>
                  {analysis.erg_data && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">Data:</span>
                        <span className="text-sm font-mono">{analysis.erg_data.filename}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Signal:</span>
                        <span className="text-sm">{Math.round(analysis.erg_data.signal_quality * 100)}%</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Clinical Information */}
          <div className="space-y-3">
            <h3 className="font-medium text-medical-primary">Clinical Information</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Diagnosis:</strong> {analysis.color_blindness_type}
                </div>
                <div>
                  <strong>Severity:</strong> {analysis.severity_level}
                </div>
                <div>
                  <strong>Analysis Date:</strong> {format(new Date(analysis.created_at), "PPP")}
                </div>
                <div>
                  <strong>Analysis ID:</strong> <code className="text-xs">{analysis.id}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Share className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
