"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Brain, Eye, Activity, BarChart3, Home, MessageCircle } from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Fundus Upload",
    href: "/dashboard/fundus-upload",
    icon: Eye,
  },
  {
    name: "ERG Upload",
    href: "/dashboard/erg-upload",
    icon: Activity,
  },
  {
    name: "AI Analysis",
    href: "/dashboard/analysis",
    icon: Brain,
  },
  {
    name: "Results",
    href: "/dashboard/results",
    icon: BarChart3,
  },
  {
    name: "AI Assistant",
    href: "/dashboard/chat",
    icon: MessageCircle,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col space-y-2">
      {navigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link key={item.name} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                isActive && "bg-medical-accent text-white hover:bg-medical-accent/90",
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.name}
            </Button>
          </Link>
        )
      })}
    </nav>
  )
}
