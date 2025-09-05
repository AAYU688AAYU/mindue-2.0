"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download, Trash2, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface FundusImageCardProps {
  image: {
    id: string
    filename: string
    file_url: string
    quality_score?: number
    processing_status: "pending" | "processing" | "completed" | "failed"
    extracted_features?: any
    created_at: string
  }
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

export function FundusImageCard({ image, onDelete, onView }: FundusImageCardProps) {
  const getStatusIcon = () => {
    switch (image.processing_status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "processing":
        return <div className="h-4 w-4 border-2 border-medical-accent border-t-transparent rounded-full animate-spin" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const getQualityBadge = () => {
    if (!image.quality_score) return null

    const score = image.quality_score
    const percentage = Math.round(score * 100)

    if (score >= 0.8)
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Excellent ({percentage}%)
        </Badge>
      )
    if (score >= 0.6)
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Good ({percentage}%)
        </Badge>
      )
    return (
      <Badge variant="destructive" className="bg-red-100 text-red-800">
        Poor ({percentage}%)
      </Badge>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="aspect-square bg-medical-surface">
        <img src={image.file_url || "/placeholder.svg"} alt={image.filename} className="w-full h-full object-cover" />
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h4 className="font-medium text-sm truncate" title={image.filename}>
            {image.filename}
          </h4>
          <p className="text-xs text-medical-text-secondary">{new Date(image.created_at).toLocaleDateString()}</p>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-xs capitalize text-medical-text-secondary">{image.processing_status}</span>
        </div>

        {getQualityBadge()}

        {image.extracted_features && (
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>Optic Disc:</span>
              <span className={image.extracted_features.optic_disc_detected ? "text-green-600" : "text-red-600"}>
                {image.extracted_features.optic_disc_detected ? "Detected" : "Not Found"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Macula:</span>
              <span className={image.extracted_features.macula_detected ? "text-green-600" : "text-red-600"}>
                {image.extracted_features.macula_detected ? "Detected" : "Not Found"}
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => onView?.(image.id)} className="flex-1">
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.open(image.file_url, "_blank")}>
            <Download className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(image.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
