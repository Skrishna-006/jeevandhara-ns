import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck, Eye, Lock, FileSearch } from "lucide-react"

const trustFeatures = [
  {
    title: "AI-Powered Verification",
    description:
      "Every application undergoes automated OCR extraction, duplicate detection, and cost anomaly analysis before it reaches donors.",
    icon: FileSearch,
  },
  {
    title: "Full Transparency",
    description:
      "Track every donation in real-time. Our public dashboard shows exactly where funds go, with a complete transaction ledger.",
    icon: Eye,
  },
  {
    title: "Secure & Private",
    description:
      "Patient documents and donor information are encrypted and handled with the highest privacy standards. Government IDs are masked.",
    icon: Lock,
  },
  {
    title: "Admin Oversight",
    description:
      "A dedicated admin team reviews every AI-verified case before approval, adding a critical human review layer to the process.",
    icon: ShieldCheck,
  },
]

export function TrustSection() {
  return (
    <section className="bg-card py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Transparency & Trust
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            Built on verification, transparency, and accountability at every step.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {trustFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border-border bg-background transition-shadow hover:shadow-md"
              >
                <CardContent className="flex gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
