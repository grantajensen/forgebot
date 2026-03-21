import Link from "next/link";
import { Zap, Camera, Lightbulb, Globe, Megaphone, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Zap className="w-5 h-5" />
            ForgeBot
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm bg-primary text-primary-foreground px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
          Turn <span className="text-primary">any object</span> into a
          full startup
        </h1>
        <p className="text-xl text-muted-foreground max-w-xl mx-auto">
          Upload a photo. AI agents generate your startup concept, landing page,
          and marketing campaign in seconds.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors text-lg"
          >
            Start Forging <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Camera,
                title: "1. Upload",
                desc: "Take a photo of any object around you.",
              },
              {
                icon: Lightbulb,
                title: "2. Ideate",
                desc: "AI generates a unique startup concept inspired by your object.",
              },
              {
                icon: Globe,
                title: "3. Build",
                desc: "Watch a full landing page get generated in real-time.",
              },
              {
                icon: Megaphone,
                title: "4. Launch",
                desc: "Get a complete marketing campaign ready to deploy.",
              },
            ].map((step) => (
              <div key={step.title} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to launch
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: "AI Vision Analysis",
              desc: "Claude identifies your object, its properties, target demographics, and market potential.",
            },
            {
              title: "Startup Concept",
              desc: "Get a company name, tagline, value prop, pricing model, and competitive advantage.",
            },
            {
              title: "Landing Page",
              desc: "A production-ready, responsive HTML landing page streamed in real-time.",
            },
            {
              title: "Email Campaigns",
              desc: "3-email welcome sequence ready to load into your email tool.",
            },
            {
              title: "Social Media",
              desc: "Twitter, LinkedIn, and Instagram posts tailored to your brand.",
            },
            {
              title: "Ad Copy",
              desc: "Google ad headlines and descriptions optimized for clicks.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="border rounded-lg p-6 space-y-2 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to forge?</h2>
          <p className="text-muted-foreground">
            3 free generations. No credit card required.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> ForgeBot
          </div>
        </div>
      </footer>
    </div>
  );
}
