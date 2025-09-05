"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Activity, FileText, CheckCircle, AlertCircle, X, TrendingUp } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { ERGDataVisualization } from "@/components/erg-data-visualization"

interface ERGDataFile {
  id: string
  filename: string
  file_url: string
  processing_status: "pending" | "processing" | "completed" | "failed"
  signal_quality?: number
  extracted_features?: any
  created_at: string
  patient_id?: string
}

export default function ERGUploadPage() {
  const [ergFiles, setErgFiles] = useState<ERGDataFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<ERGDataFile | null>(null)
  const supabase = createBrowserClient()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null)
      setUploading(true)
      setUploadProgress(0)

      for (const file of acceptedFiles) {
        try {
          // Validate file type
          const validTypes = [".csv", ".xlsx", ".xls", ".txt"]
          const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()

          if (!validTypes.includes(fileExtension)) {
            throw new Error(`${file.name} is not a valid ERG data file. Supported: CSV, Excel, TXT`)
          }

          if (file.size > 50 * 1024 * 1024) {
            // 50MB limit for data files
            throw new Error(`${file.name} exceeds 50MB size limit`)
          }

          // Upload to Blob storage
          const formData = new FormData()
          formData.append("file", file)
          formData.append("type", "erg")

          const uploadResponse = await fetch("/api/erg/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            throw new Error("Upload failed")
          }

          const uploadResult = await uploadResponse.json()

          // Store metadata in database
          const { data: ergData, error: dbError } = await supabase
            .from("erg_data")
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

          const newFile: ERGDataFile = {
            id: ergData.id,
            filename: file.name,
            file_url: uploadResult.url,
            processing_status: "pending",
            created_at: ergData.created_at,
          }

          setErgFiles((prev) => [...prev, newFile])

          // Start processing
          await fetch("/api/erg/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ergId: ergData.id }),
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
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/plain": [".txt"],
    },
    multiple: true,
    disabled: uploading,
  })

  const removeFile = async (fileId: string) => {
    try {
      const file = ergFiles.find((f) => f.id === fileId)
      if (!file) return

      // Delete from Blob storage
      await fetch("/api/erg/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: file.file_url }),
      })

      // Delete from database
      await supabase.from("erg_data").delete().eq("id", fileId)

      setErgFiles((prev) => prev.filter((f) => f.id !== fileId))
    } catch (err) {
      setError("Failed to delete file")
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-medical-primary mb-2">ERG Data Processing</h1>
        <p className="text-medical-text-secondary">
          Upload and analyze Electroretinography (ERG) signal data for comprehensive retinal function assessment
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload Data</TabsTrigger>
          <TabsTrigger value="files">Processed Files</TabsTrigger>
          <TabsTrigger value="analysis">Signal Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload ERG Data Files
              </CardTitle>
              <CardDescription>
                Upload ERG signal data in CSV, Excel, or TXT format. Files should contain time-series voltage
                measurements.
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
                <Activity className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
                {isDragActive ? (
                  <p className="text-medical-accent font-medium">Drop the ERG files here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium mb-2">Drop ERG data files here, or click to select</p>
                    <p className="text-sm text-medical-text-secondary mb-4">
                      Supported formats: CSV, Excel (.xlsx, .xls), TXT (max 50MB each)
                    </p>
                    <div className="text-xs text-medical-text-secondary space-y-1">
                      <p>
                        <strong>Expected format:</strong> Time (ms) | Voltage (μV) columns
                      </p>
                      <p>
                        <strong>Sample rate:</strong> 1000-4000 Hz recommended
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {uploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-medical-text-secondary mt-2">Processing ERG data files...</p>
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

          {/* Data Format Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                ERG Data Format Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Required Columns:</h4>
                  <ul className="text-sm text-medical-text-secondary space-y-1">
                    <li>
                      • <strong>Time:</strong> Milliseconds (0-500ms typical)
                    </li>
                    <li>
                      • <strong>Voltage:</strong> Microvolts (μV)
                    </li>
                    <li>
                      • <strong>Condition:</strong> Light intensity (optional)
                    </li>
                    <li>
                      • <strong>Eye:</strong> OD (right) / OS (left) (optional)
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Signal Characteristics:</h4>
                  <ul className="text-sm text-medical-text-secondary space-y-1">
                    <li>
                      • <strong>A-wave:</strong> Negative deflection (~15ms)
                    </li>
                    <li>
                      • <strong>B-wave:</strong> Positive deflection (~50ms)
                    </li>
                    <li>
                      • <strong>Amplitude:</strong> 100-600μV typical
                    </li>
                    <li>
                      • <strong>Duration:</strong> 200-500ms recording
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          {ergFiles.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ergFiles.map((file) => (
                <Card
                  key={file.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedFile(file)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate" title={file.filename}>
                        {file.filename}
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(file.id)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {file.processing_status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {file.processing_status === "processing" && (
                        <div className="h-4 w-4 border-2 border-medical-accent border-t-transparent rounded-full animate-spin" />
                      )}
                      {file.processing_status === "failed" && <AlertCircle className="h-4 w-4 text-red-500" />}
                      <span className="capitalize text-medical-text-secondary">{file.processing_status}</span>
                    </div>

                    {file.signal_quality && (
                      <div className="text-xs">
                        <span className="text-medical-text-secondary">Signal Quality: </span>
                        <span
                          className={`font-medium ${
                            file.signal_quality >= 0.8
                              ? "text-green-600"
                              : file.signal_quality >= 0.6
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {Math.round(file.signal_quality * 100)}%
                        </span>
                      </div>
                    )}

                    {file.extracted_features && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>A-wave:</span>
                          <span className="font-mono">{file.extracted_features.a_wave_amplitude?.toFixed(1)}μV</span>
                        </div>
                        <div className="flex justify-between">
                          <span>B-wave:</span>
                          <span className="font-mono">{file.extracted_features.b_wave_amplitude?.toFixed(1)}μV</span>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-medical-text-secondary">
                      {new Date(file.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
                <p className="text-medical-text-secondary">No ERG files uploaded yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {selectedFile ? (
            <ERGDataVisualization file={selectedFile} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-medical-text-secondary" />
                <p className="text-medical-text-secondary">
                  Select an ERG file from the "Processed Files" tab to view signal analysis
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
