import Link from "next/link";
import { BookOpen, Sparkles, Map, Wand2, Users, BarChart3 } from "lucide-react";
import CanvasBloom from "@/components/landing/CanvasBloom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-warm-400/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold text-warm-500">
            AdventureBuildr
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-warm-300 hover:text-warm-500 transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-warm-300 hover:text-warm-500 transition-colors">
              Pricing
            </Link>
            <Link
              href="/dashboard"
              className="bg-amber-story text-white text-sm px-4 py-2 rounded-tight hover:bg-amber-dark transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-display-xl text-warm-600 mb-6 leading-tight">
            Describe a world.
            <br />
            <span className="text-amber-story">Watch it bloom.</span>
          </h1>
          <p className="text-xl text-warm-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Type a story premise. AI generates a complete branching narrative
            — characters, choices, consequences — displayed on a visual canvas
            you can edit, extend, and publish.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-amber-story text-white px-8 py-3 rounded-standard text-base font-medium hover:bg-amber-dark transition-colors shadow-subtle min-h-[44px] flex items-center"
            >
              Start Creating — Free
            </Link>
            <Link
              href="#features"
              className="text-warm-400 px-8 py-3 rounded-standard text-base font-medium border border-warm-400/20 hover:border-warm-400/40 hover:text-warm-500 transition-colors min-h-[44px] flex items-center"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Canvas Bloom Demo */}
      <section className="py-20 px-6 bg-slate-canvas">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-parchment/40 text-xs font-mono uppercase tracking-widest mb-4">
            Live demo — generating now
          </p>
          <p className="text-parchment/80 text-lg max-w-2xl mx-auto leading-relaxed font-display mb-10 italic">
            &ldquo;A detective in 1940s Hong Kong discovers her client is already dead...&rdquo;
          </p>
          <CanvasBloom />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-display-md text-warm-600 text-center mb-16">
            Everything you need to tell branching stories
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="AI Story Generator"
              description="Describe your premise. AI generates a complete branching narrative with episodes, choices, characters, and world lore."
            />
            <FeatureCard
              icon={<Map className="w-6 h-6" />}
              title="Visual Story Canvas"
              description="ReactFlow-powered graph editor. Drag nodes, connect choices, see your entire story structure at a glance."
            />
            <FeatureCard
              icon={<BookOpen className="w-6 h-6" />}
              title="Cinematic Reader"
              description="Full-screen, immersive. Typewriter text reveal, animated choice cards, three visual themes. Mobile-first."
            />
            <FeatureCard
              icon={<Wand2 className="w-6 h-6" />}
              title="World Bible"
              description="Characters, locations, items, lore — all tracked. AI maintains consistency across every branch."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="State & Consequences"
              description="Define variables, gate choices by conditions, and let reader decisions ripple through the narrative."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Reader Analytics"
              description="Choice heatmaps, drop-off analysis, branch popularity. Understand how readers experience your story."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-parchment">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-display-md text-warm-600 text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-warm-300 text-center mb-16 text-lg">
            Start free. Upgrade when you need more.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Free"
              price="$0"
              period="forever"
              features={[
                "3 stories",
                "50 episodes per story",
                "10 AI generations / month",
                "Basic reader",
                "Community support",
              ]}
              cta="Start Free"
              ctaHref="/sign-up"
            />
            <PricingCard
              name="Pro"
              price="$19"
              period="/month"
              features={[
                "Unlimited stories",
                "Unlimited episodes",
                "200 AI generations / month",
                "Full reader experience",
                "Analytics dashboard",
                "Custom branding",
                "Export to Twine/JSON",
              ]}
              cta="Start Pro Trial"
              ctaHref="/sign-up"
              highlighted
            />
            <PricingCard
              name="Enterprise"
              price="$49"
              period="/month"
              features={[
                "Everything in Pro",
                "Unlimited AI generations",
                "Multi-author collaboration",
                "White-label embed",
                "API access",
                "SSO & team management",
              ]}
              cta="Contact Us"
              ctaHref="/sign-up"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-warm-400/10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
          <span className="font-display text-sm text-warm-400">
            AdventureBuildr AI
          </span>
          <span className="text-xs text-warm-300 text-center sm:text-right">
            The future of interactive storytelling.
          </span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-standard border border-warm-400/10 hover:shadow-elevated transition-shadow duration-200 flex flex-col">
      <div className="w-10 h-10 rounded-standard bg-amber-story/10 flex items-center justify-center text-amber-story mb-4 flex-shrink-0">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-warm-500 mb-2">
        {title}
      </h3>
      <p className="text-warm-300 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaHref,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-standard bg-white border ${
        highlighted
          ? "border-amber-story shadow-elevated"
          : "border-warm-400/15"
      } flex flex-col`}
    >
      <h3 className="font-display text-xl font-semibold text-warm-500 mb-2">
        {name}
      </h3>
      <div className="mb-6">
        <span className="font-display text-display-sm text-warm-600">
          {price}
        </span>
        <span className="text-warm-300 text-sm ml-1">{period}</span>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="text-sm text-warm-400 flex items-start gap-2">
            <span className="text-amber-story mt-0.5 flex-shrink-0">&#10003;</span>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className={`block text-center py-3 px-4 rounded-standard text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center ${
          highlighted
            ? "bg-amber-story text-white hover:bg-amber-dark"
            : "border border-warm-400/20 text-warm-400 hover:border-warm-400/40 hover:text-warm-500"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
