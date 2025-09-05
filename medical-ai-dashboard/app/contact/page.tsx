import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
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
            <Link href="/about" className="text-slate-600 hover:text-indigo-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-indigo-600 font-medium">
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-indigo-800 bg-clip-text text-transparent mb-8 text-center">
            Contact Us
          </h1>

          <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Have questions about mindhue? We'd love to hear from you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@hospital.com" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Inquiry about mindhue" />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Tell us how we can help..." rows={5} />
                </div>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
