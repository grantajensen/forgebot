import type { ReactNode } from "react";
import Link from "next/link";
import {
  Camera,
  Lightbulb,
  Globe,
  Megaphone,
  ArrowRight,
  Hammer,
} from "lucide-react";

function BrandWordmark({ className }: { className?: string }) {
  return (
    <span
      className={`font-brand font-semibold tracking-tight text-zinc-800 ${className ?? ""}`}
    >
      ForgeBot
    </span>
  );
}

type StepCardProps = {
  label: string;
  title: string;
  body: ReactNode;
  icon: typeof Camera;
};

function StepCard({ label, title, body, icon: Icon }: StepCardProps) {
  return (
    <article className="flex min-h-[24rem] flex-col rounded-[1.75rem] border border-zinc-900/[0.08] bg-cream-card p-6 shadow-sm md:min-h-[28rem]">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </span>
      <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-zinc-900">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">{body}</p>
      <div className="mt-auto flex min-h-0 flex-1 flex-col justify-end pt-10">
        <div className="flex min-h-[10rem] w-full flex-1 items-center justify-center rounded-2xl bg-cream-well/70 md:min-h-[11rem]">
          <Icon className="h-12 w-12 text-olive md:h-14 md:w-14" strokeWidth={1.75} aria-hidden />
        </div>
      </div>
    </article>
  );
}

/**
 * Marketing landing — warm cream + olive accents (docs/landing-page-spec.md)
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream text-zinc-900 antialiased">
      <header className="sticky top-0 z-20 border-b border-zinc-900/[0.06] bg-cream/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Hammer className="h-5 w-5 text-olive" strokeWidth={2} aria-hidden />
            <BrandWordmark />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="text-zinc-600 transition-colors hover:text-zinc-900"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-olive px-4 py-2 font-medium text-olive-foreground transition-colors hover:bg-olive-deep"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-zinc-900/[0.05] bg-[linear-gradient(180deg,hsl(var(--cream))_0%,hsl(var(--cream-warm))_100%)]">
          <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-olive sm:text-sm">
              Forge your next business from scratch.
            </p>
            <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
              Turn{" "}
              <span className="text-orange-muted-faded font-semibold">
                any object
              </span>{" "}
              into a full startup
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-600">
              Upload a <span className="font-medium text-olive">photo</span>. Get
              your <span className="font-medium text-olive">startup concept</span>
              , <span className="font-medium text-olive">landing page</span>, and{" "}
              <span className="font-medium text-olive">marketing campaign</span>{" "}
              in seconds.
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-olive px-7 py-3.5 text-base font-semibold text-olive-foreground transition-colors hover:bg-olive-deep"
              >
                <Camera className="h-5 w-5" aria-hidden />
                Upload photo
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed text-zinc-600">
              From one photo to a concept, landing page, and campaign—four
              straightforward steps.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-4 md:gap-4 lg:gap-5">
              <StepCard
                label="Capture"
                title="Upload"
                body={
                  <>
                    Take a photo of{" "}
                    <span className="text-orange-muted-faded font-semibold">
                      any object
                    </span>{" "}
                    around you.
                  </>
                }
                icon={Camera}
              />
              <StepCard
                label="Strategy"
                title="Ideate"
                body="A unique startup concept is generated from your object."
                icon={Lightbulb}
              />
              <StepCard
                label="Build"
                title="Ship the page"
                body="Watch a full landing page come together in real time."
                icon={Globe}
              />
              <StepCard
                label="Reach"
                title="Launch"
                body="Get a complete marketing campaign ready to deploy."
                icon={Megaphone}
              />
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-900/[0.06] bg-cream-well/55 py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Everything you need to launch
            </h2>
            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {[
                {
                  title: "Object analysis",
                  desc: "Identifies your object, its properties, audience fit, and market angle.",
                },
                {
                  title: "Startup concept",
                  desc: "Company name, tagline, value prop, pricing model, and edge over alternatives.",
                },
                {
                  title: "Landing page",
                  desc: "A production-ready, responsive HTML page streamed as it's built.",
                },
                {
                  title: "Email campaigns",
                  desc: "A three-email welcome sequence you can paste into your tool of choice.",
                },
                {
                  title: "Social media",
                  desc: "Posts tailored to your brand across the channels you care about.",
                },
                {
                  title: "Ad copy",
                  desc: "Headlines and descriptions tuned for clicks.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="flex min-h-[14rem] flex-col rounded-[1.75rem] border border-zinc-900/[0.08] bg-cream-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="h-1 w-12 rounded-full bg-olive/85" />
                  <h3 className="mt-4 text-xl font-bold tracking-tight text-zinc-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Ready to{" "}
              <span className="text-orange-muted-faded font-semibold">forge</span>{" "}
              your{" "}
              <span className="text-orange-muted-faded font-semibold">
                next launch
              </span>
              ?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-zinc-600">
              Three free generations. No credit card required.
            </p>
            <Link
              href="/login"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-olive px-7 py-3.5 font-semibold text-olive-foreground transition-colors hover:bg-olive-deep"
            >
              Get started free
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-900/[0.06] py-10">
        <div className="mx-auto flex max-w-6xl items-center px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-olive" aria-hidden />
            <BrandWordmark className="text-base" />
          </div>
        </div>
      </footer>
    </div>
  );
}
