"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Eye, CheckCircle, AlertCircle, X } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface UploadedImage {
  id: string
  url: string
  filename: string
  size: number
  uploadedAt: string
  quality_score?: number
  processing_status: "pending" | "processing" | "completed" | "failed"
}

export default function FundusUploadPage() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const supabase = createBrowserClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      setUploading(true)
      setUploadProgress(0)

      for (const file of acceptedFiles) {
        try {
          // Validate file type and size
          if (!file.type.startsWith("image/")) {
            throw new Error(`${file.name} is not a valid image file`)
          }

          if (file.size > 10 * 1024 * 1024) {
            // 10MB limit
            throw new Error(`${file.name} exceeds 10MB size limit`)
          }

          // Upload to Blob storage
          const formData = new FormData()
          formData.append("file", file)
          formData.append("type", "fundus")

          const uploadResponse = await fetch("/api/fundus/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Upload failed")
          }

          const uploadResult = await uploadResponse.json()

          // Store metadata in database
          const { data: imageData, error: dbError } = await supabase
            .from("fundus_images")
            .insert({
              filename: file.name,
              file_url: uploadResult.url,
              file_size: file.size,
              mime_type: file.type,
              processing_status: "pending",
            })
            .select()
            .single()

          if (dbError) throw dbError

          const newImage: UploadedImage = {
            id: imageData.id,
            url: uploadResult.url,
            filename: file.name,
            size: file.size,
            uploadedAt: imageData.created_at,
            processing_status: "pending",
          }

          setUploadedImages((prev) => [...prev, newImage])

          // Start processing
          await fetch("/api/fundus/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageId: imageData.id }),
          })
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed")
        }
      }

      setUploading(false)
      setUploadProgress(100)
    },
    [supabase],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".tiff", ".bmp"],
    },
    multiple: true,
    disabled: uploading,
  })

  const removeImage = async (imageId: string) => {
    try {
      const image = uploadedImages.find((img) => img.id === imageId)
      if (!image) return

      // Delete from Blob storage
      await fetch("/api/fundus/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: image.url }),
      })

      // Delete from database
      await supabase.from("fundus_images").delete().eq("id", imageId)

      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      setError("Failed to delete image")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-medical-primary mb-2">Fundus Image Upload</h1>
        <p className="text-medical-text-secondary">
          Upload retinal fundus images for AI-powered color blindness analysis
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Fundus Images
          </CardTitle>
          <CardDescription>
            Drag and drop fundus images or click to browse. Supported formats: JPG, PNG, TIFF, BMP (max 10MB each)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-medical-accent bg-medical-accent/5"
                : "border-medical-border hover:border-medical-accent"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            <Eye className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
            {isDragActive ? (
              <p className="text-medical-accent font-medium">Drop the images here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">Drop fundus images here, or click to select files</p>
                <p className="text-sm text-medical-text-secondary">
                  High-quality retinal images provide better analysis results
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-medical-text-secondary mt-2">Uploading and processing images...</p>
            </div>
          )}

          {error && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Images ({uploadedImages.length})</CardTitle>
            <CardDescription>Monitor processing status and quality assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {uploadedImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  <div className="aspect-square bg-medical-surface rounded-lg overflow-hidden">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={image.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate" title={image.filename}>
                        {image.filename}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {image.processing_status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {image.processing_status === "processing" && (
                        <div className="h-4 w-4 border-2 border-medical-accent border-t-transparent rounded-full animate-spin" />
                      )}
                      {image.processing_status === "failed" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="capitalize text-medical-text-secondary">{image.processing_status}</span>
                    </div>

                    {image.quality_score && (
                      <div className="text-xs">
                        <span className="text-medical-text-secondary">Quality: </span>
                        <span
                          className={`font-medium ${
                            image.quality_score >= 0.8
                              ? "text-green-600"
                              : image.quality_score >= 0.6
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {Math.round(image.quality_score * 100)}%
                        </span>
                      </div>
                    )}

                    <div className="text-xs text-medical-text-secondary">
                      {(image.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
