import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              mindhue
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-indigo-600 transition-colors">
              Contact
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-transparent">
                Login
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent mb-6 text-balance">
            Revolutionary Color Vision Analysis with AI
          </h2>
          <p className="text-xl text-slate-600 mb-8 text-pretty">
            mindhue combines advanced fundus imaging and electroretinography with cutting-edge machine learning for
            precise color blindness detection and analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="w-full sm:w-auto">
                Start Analysis
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">📷</span>
                </div>
                Fundus Image Analysis
              </CardTitle>
              <CardDescription>
                Advanced CNN processing of retinal fundus images to detect structural indicators of color vision
                deficiencies.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">⚡</span>
                </div>
                Advanced ERG Processing
              </CardTitle>
              <CardDescription>
                Multi-tier analysis including XGBoost classification, 1D-CNN for time-series, and transformer encoders
                for multichannel ERG sequence processing.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-indigo-100 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs">🧠</span>
                </div>
                Multimodal AI Fusion
              </CardTitle>
              <CardDescription>
                Intelligent combination of imaging and electrophysiological data for enhanced diagnostic accuracy and
                confidence.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="mt-16 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-indigo-100">
          <h3 className="text-2xl font-bold text-center mb-8">Clinical Benefits</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-2">Enhanced Accuracy</h4>
              <p className="text-slate-600">
                Multimodal approach provides higher diagnostic confidence than single-modality assessments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Objective Analysis</h4>
              <p className="text-slate-600">
                AI-powered analysis reduces subjective interpretation and provides quantitative metrics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Efficient Workflow</h4>
              <p className="text-slate-600">
                Streamlined data upload and automated analysis accelerates clinical decision-making.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Comprehensive Reports</h4>
              <p className="text-slate-600">
                Detailed analysis results with clinical recommendations and follow-up suggestions.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>&copy; 2024 mindhue. Advanced AI-powered color vision analysis for healthcare professionals.</p>
        </div>
      </footer>
    </div>
  )
}
