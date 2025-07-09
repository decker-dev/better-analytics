import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center space-x-3 mb-8">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">
              BA
            </span>
          </div>
          <h1 className="text-4xl font-bold">Better Analytics</h1>
        </div>

        <p className="text-xl text-fd-muted-foreground mb-8 max-w-2xl mx-auto">
          Open-source analytics platform designed for developers. Self-host or
          use our cloud service. Unlimited events, privacy-first, and
          developer-friendly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🚀 Quick Start</h3>
            <p className="text-fd-muted-foreground mb-4">
              Get started in minutes with our SDK or SaaS platform
            </p>
            <Link
              href="/docs/getting-started"
              className="text-fd-foreground font-semibold underline"
            >
              Get Started →
            </Link>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">📚 SDK Reference</h3>
            <p className="text-fd-muted-foreground mb-4">
              Complete API reference for all frameworks
            </p>
            <Link
              href="/docs/sdk"
              className="text-fd-foreground font-semibold underline"
            >
              Browse SDK →
            </Link>
          </div>

          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">🔧 Self-Host</h3>
            <p className="text-fd-muted-foreground mb-4">
              Deploy your own analytics infrastructure
            </p>
            <Link
              href="/docs/self-hosting"
              className="text-fd-foreground font-semibold underline"
            >
              Deploy →
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/docs"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Read Documentation
          </Link>
          <a
            href="https://better-analytics.app"
            className="border border-border text-foreground px-6 py-3 rounded-lg hover:bg-muted/50 transition-colors font-medium"
          >
            Try SaaS
          </a>
        </div>
      </div>
    </main>
  );
}
