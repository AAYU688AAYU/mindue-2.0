import { AlertTriangle, Shield, Lock } from "lucide-react"

export function MedicalDisclaimer() {
  return (
    <div className="space-y-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
      <div className="flex items-center gap-2 text-amber-800">
        <AlertTriangle className="h-5 w-5" />
        <h3 className="font-semibold">Important Medical Disclaimer</h3>
      </div>

      <div className="space-y-3 text-sm text-amber-700">
        <p>
          <strong>This AI system is for educational and research purposes only.</strong>
          It is not intended to replace professional medical diagnosis or treatment.
        </p>

        <p>Always consult with a qualified ophthalmologist or healthcare provider for:</p>

        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Medical diagnosis and treatment decisions</li>
          <li>Interpretation of ERG and fundus examination results</li>
          <li>Color vision testing and management</li>
          <li>Any concerns about your eye health</li>
        </ul>

        <div className="flex items-center gap-2 mt-4 p-3 bg-white/50 rounded border border-amber-200">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-xs">Your data is encrypted and protected according to HIPAA standards</span>
        </div>
      </div>
    </div>
  )
}

export function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Lock className="h-3 w-3" />
      <span>HIPAA Compliant • End-to-End Encrypted</span>
    </div>
  )
}
