import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, HeartPulse, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center pt-0 mt-0">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1576091160550-112173f7f869?w=1920&q=80')",
        }}
      />
      
      {/* Multi-layer overlay for better text readability and emotion */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-blue-600/20" />
      
      {/* Animated gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/40 via-background/30 to-primary/10" />
      
      {/* Glowing orbs */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl opacity-30 animate-pulse animation-delay-2000" />
      <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl opacity-25" />
      
      {/* Enhanced grid pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-radial-gradient opacity-30" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.15) 100%)"
      }} />

      <div className="relative mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12 z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge with glow effect */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/20 px-4 py-2 backdrop-blur-md hover:border-primary/60 transition-colors shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-semibold text-primary">
                AI-Verified Medical Fundraising
              </span>
            </div>
          </div>

          {/* Main heading with enhanced typography */}
          <h1 className="text-balance text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight text-foreground mb-4 drop-shadow-lg">
            Life Flows When{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent drop-shadow-lg">
                Society Supports
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 blur-lg opacity-30 -z-10" />
            </span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-3xl text-pretty text-base md:text-lg lg:text-xl leading-relaxed text-muted-foreground drop-shadow-md">
            Transform lives through transparent, AI-verified medical fundraising. 
            <span className="block mt-3 text-foreground font-semibold">
              Reduce fraud. Build trust. Save lives.
            </span>
          </p>

          {/* Enhanced CTAs */}
          <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center items-center">
            <Link href="/apply" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto gap-2 px-8 py-5 text-sm md:text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
              >
                <HeartPulse className="h-5 w-5" />
                Apply for Medical Support
              </Button>
            </Link>
            <Link href="/payment" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto gap-2 px-8 py-5 text-sm md:text-base font-semibold border-2 border-primary/50 hover:border-primary hover:bg-primary/10 transition-all duration-300"
              >
                Donate Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-primary/20 flex flex-col sm:flex-row justify-center gap-6 text-sm">
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground text-xs">AI-Powered Verification</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground text-xs">100% Transparent</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <HeartPulse className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground text-xs">Verified Impact</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
