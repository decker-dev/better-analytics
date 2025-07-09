import AnalyticsParticles from "@/components/analytics-particles";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Marketing Content (responsive width) */}
      <div className="w-full lg:w-1/2 bg-background flex items-center justify-center px-8 py-12 lg:py-8">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                BA
              </span>
            </div>
            <span className="text-2xl font-bold">Better Analytics</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Analytics for <span className="text-primary">Developers</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Open-source analytics platform designed for developers. Self-host or
            use our cloud service. Unlimited events, privacy-first, and
            developer-friendly.
          </p>

          {/* Key Features */}
          <div className="space-y-3 mb-10">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">
                Open Source & Self-hostable
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">Unlimited Events</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">
                Privacy-First Design
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-primary rounded-full" />
              <span className="text-muted-foreground">
                Developer Experience Focused
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/sign-in">
              <button
                type="button"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium w-full sm:w-auto"
              >
                Get Started
              </button>
            </Link>
            <a
              href="https://github.com/your-org/better-analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium text-center"
            >
              View Docs
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Free to start • No credit card required • Deploy anywhere</p>
          </div>
        </div>
      </div>

      {/* Right Side - Particle Analytics (hidden on mobile, half width on desktop) */}
      <div className="hidden lg:block lg:w-1/2 bg-black">
        <AnalyticsParticles />
      </div>
    </div>
  );
}
