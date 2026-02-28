import { Card, CardContent } from "@/components/ui/card"
import { FileText, Brain, UserCheck, Users } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Patient Submits Details",
    description:
      "Patients submit their medical records, hospital details, and required treatment costs through our secure portal.",
    icon: FileText,
  },
  {
    step: "02",
    title: "AI Verifies Documents",
    description:
      "Our AI system performs OCR extraction, duplicate detection, hospital validation, and cost anomaly analysis.",
    icon: Brain,
  },
  {
    step: "03",
    title: "Admin Review & Approval",
    description:
      "Verified applications are reviewed by our admin team for final approval before going live for fundraising.",
    icon: UserCheck,
  },
  {
    step: "04",
    title: "Public & Universities Contribute",
    description:
      "Approved cases are listed publicly. Individuals and university communities can donate transparently.",
    icon: Users,
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-background py-12 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How It Works
          </h2>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
            A simple, transparent, and AI-powered process to connect patients in need with donors.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => {
            const Icon = item.icon
            return (
              <Card
                key={item.step}
                className="group relative overflow-hidden border-border bg-card transition-shadow hover:shadow-lg"
              >
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-primary">
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="mb-1 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.description}
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
