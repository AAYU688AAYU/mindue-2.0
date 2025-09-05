import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              mindhue
            </h1>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-indigo-600 font-medium">
              About
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Contact
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent mb-8 text-center">
            About mindhue
          </h1>

          <div className="prose prose-lg max-w-none">
            <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle>Revolutionary Color Vision Analysis</CardTitle>
                <CardDescription>
                  mindhue represents the next generation of AI-powered medical diagnostics, specifically designed for
                  comprehensive color blindness detection and analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our platform combines cutting-edge computer vision, advanced machine learning, and clinical expertise
                  to provide healthcare professionals with unprecedented accuracy in color vision assessment.
                </p>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Advanced ERG Modeling</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-slate-600">
                    <li>
                      • <strong>Baseline 1:</strong> Gradient Boosted Trees (XGBoost/LightGBM) on engineered features
                    </li>
                    <li>
                      • <strong>Baseline 2:</strong> 1D-CNN on raw waveform time-series vectors
                    </li>
                    <li>
                      • <strong>Advanced:</strong> Transformer-encoder for multichannel ERG sequences
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Multimodal AI Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Our fusion network intelligently combines fundus image analysis with ERG data processing to achieve
                    superior diagnostic accuracy compared to single-modality approaches.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
