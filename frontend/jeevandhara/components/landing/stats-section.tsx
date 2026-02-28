"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Users, Activity, CheckCircle } from "lucide-react"
import { stats, formatCurrency } from "@/lib/data"

interface StatItem {
  label: string
  value: number
  displayValue: string
  icon: React.ComponentType<{ className?: string }>
  suffix?: string
}

const statItems: StatItem[] = [
  {
    label: "Total Funds Raised",
    value: stats.totalFundsRaised,
    displayValue: formatCurrency(stats.totalFundsRaised),
    icon: TrendingUp,
    suffix: "+",
  },
  {
    label: "Patients Supported",
    value: stats.totalPatientsSupported,
    displayValue: stats.totalPatientsSupported.toString(),
    icon: Users,
    suffix: "+",
  },
  {
    label: "Active Cases",
    value: stats.activeCases,
    displayValue: stats.activeCases.toString(),
    icon: Activity,
  },
  {
    label: "Verified Cases",
    value: stats.verifiedCases,
    displayValue: stats.verifiedCases.toString(),
    icon: CheckCircle,
    suffix: "+",
  },
]

function AnimatedNumber({ target, suffix }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0")

  useEffect(() => {
    const num = parseFloat(target.replace(/[^0-9.]/g, ""))
    const unit = target.replace(/[0-9.]/g, "")
    const duration = 1500
    const steps = 40
    const increment = num / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(current + increment, num)
      if (step >= steps) {
        setDisplay(target + (suffix || ""))
        clearInterval(timer)
      } else {
        const decimals = target.includes(".") ? 1 : 0
        setDisplay(current.toFixed(decimals) + unit)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target, suffix])

  return <span>{display}</span>
}

export function StatsSection() {
  return (
    <section className="bg-primary py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-primary-foreground md:text-3xl">
            Real-Time Impact
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/70">
            Every number represents a life transformed through transparent giving.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statItems.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.label}
                className="border-primary-foreground/10 bg-primary-foreground/10 backdrop-blur-sm"
              >
                <CardContent className="p-4 text-center">
                  <Icon className="mx-auto mb-2 h-6 w-6 text-primary-foreground/80" />
                  <div className="text-2xl font-bold text-primary-foreground">
                    <AnimatedNumber target={item.displayValue} suffix={item.suffix} />
                  </div>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    {item.label}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
