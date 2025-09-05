import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if patient profile exists
  const { data: patient } = await supabase.from("patients").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Medical AI Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {data.user.email}</span>
            <form action="/auth/logout" method="post">
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!patient ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                Please complete your patient profile to start using the medical AI system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile/setup">
                <Button>Setup Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Welcome back, {patient.first_name}</h2>
              <p className="text-muted-foreground">Patient ID: {patient.patient_id}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">📷</span>
                    </div>
                    Upload Fundus Images
                  </CardTitle>
                  <CardDescription>Upload retinal fundus images for AI analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/fundus-upload">
                    <Button className="w-full">Upload Images</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center">
                      <span className="text-secondary-foreground text-xs">⚡</span>
                    </div>
                    Input ERG Data
                  </CardTitle>
                  <CardDescription>Enter electroretinography measurements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/erg-upload">
                    <Button className="w-full" variant="secondary">
                      Input Data
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                      <span className="text-accent-foreground text-xs">🧠</span>
                    </div>
                    AI Analysis
                  </CardTitle>
                  <CardDescription>Run multimodal AI analysis on your data</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/analysis">
                    <Button className="w-full bg-transparent" variant="outline">
                      Run Analysis
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-medical-accent rounded flex items-center justify-center">
                      <span className="text-white text-xs">📊</span>
                    </div>
                    View Results
                  </CardTitle>
                  <CardDescription>Review AI analysis results and reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/dashboard/results">
                    <Button className="w-full bg-medical-accent text-white hover:bg-medical-accent/90">
                      View Results
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest medical AI analyses and uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  No recent activity. Start by uploading fundus images or ERG data.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
