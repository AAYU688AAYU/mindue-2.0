"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield } from "lucide-react"

interface ConsentFormProps {
  onConsentComplete: (consents: Record<string, boolean>) => void
}

export function ConsentForm({ onConsentComplete }: ConsentFormProps) {
  const [consents, setConsents] = useState({
    hipaa: false,
    dataProcessing: false,
    research: false,
    aiAnalysis: false,
  })

  const handleConsentChange = (type: string, checked: boolean) => {
    setConsents((prev) => ({ ...prev, [type]: checked }))
  }

  const canProceed = consents.hipaa && consents.dataProcessing && consents.aiAnalysis

  const handleSubmit = () => {
    if (canProceed) {
      onConsentComplete(consents)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Medical Data Consent & Privacy Agreement
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <ScrollArea className="h-64 p-4 border rounded-lg bg-muted/30">
          <div className="space-y-4 text-sm">
            <h4 className="font-semibold">Privacy Notice & Consent</h4>
            <p>
              mindhue processes your medical data (fundus images, ERG data) to provide AI-powered color blindness
              analysis. Your data is encrypted, stored securely, and processed in compliance with HIPAA regulations.
            </p>

            <h4 className="font-semibold">Data Usage</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Fundus images and ERG data for AI analysis</li>
              <li>Analysis results and confidence scores</li>
              <li>Audit logs for security and compliance</li>
              <li>Anonymized data for research (optional)</li>
            </ul>

            <h4 className="font-semibold">Your Rights</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Access your data at any time</li>
              <li>Request data deletion (subject to legal requirements)</li>
              <li>Withdraw consent for research participation</li>
              <li>Receive copies of your analysis results</li>
            </ul>
          </div>
        </ScrollArea>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hipaa"
              checked={consents.hipaa}
              onCheckedChange={(checked) => handleConsentChange("hipaa", checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="hipaa" className="text-sm font-medium cursor-pointer">
                HIPAA Authorization (Required)
              </label>
              <p className="text-xs text-muted-foreground">
                I authorize mindhue to use and disclose my protected health information for treatment, payment, and
                healthcare operations as described above.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="dataProcessing"
              checked={consents.dataProcessing}
              onCheckedChange={(checked) => handleConsentChange("dataProcessing", checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="dataProcessing" className="text-sm font-medium cursor-pointer">
                Data Processing Consent (Required)
              </label>
              <p className="text-xs text-muted-foreground">
                I consent to the processing of my medical data for AI analysis and result generation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="aiAnalysis"
              checked={consents.aiAnalysis}
              onCheckedChange={(checked) => handleConsentChange("aiAnalysis", checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="aiAnalysis" className="text-sm font-medium cursor-pointer">
                AI Analysis Consent (Required)
              </label>
              <p className="text-xs text-muted-foreground">
                I understand that AI analysis is for educational purposes and does not replace professional medical
                advice.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="research"
              checked={consents.research}
              onCheckedChange={(checked) => handleConsentChange("research", checked as boolean)}
            />
            <div className="space-y-1">
              <label htmlFor="research" className="text-sm font-medium cursor-pointer">
                Research Participation (Optional)
              </label>
              <p className="text-xs text-muted-foreground">
                I consent to the use of my anonymized data for medical research to improve color blindness detection.
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={!canProceed} className="w-full">
          {canProceed ? "Accept & Continue" : "Please accept required consents"}
        </Button>
      </CardContent>
    </Card>
  )
}
