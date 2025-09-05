import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">AI</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Medical AI</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Account Created Successfully!</CardTitle>
              <CardDescription className="text-center">Please check your email to verify your account</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a verification email to your address. Please click the link in the email to activate your
                account and access the medical AI dashboard.
              </p>
              <Link href="/auth/login">
                <Button className="w-full">Return to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
