import { Link } from 'react-router-dom';
import { MarketingLayout } from '../components/marketing/MarketingLayout';

export function Landing() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Gradient Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
              DESCRIBE YOUR APP.<br />
              WATCH IT BUILD.
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Meet MAE, your AI engineering partner. Build production-ready web and mobile apps with AI assistance. Beautiful by default, validated every step.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/builder"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity shadow-lg inline-block w-full sm:w-auto text-center"
              >
                GET STARTED FREE
              </Link>
              <button className="px-8 py-4 bg-secondary text-secondary-foreground rounded-sm font-medium hover:bg-secondary/80 transition-colors w-full sm:w-auto">
                WATCH DEMO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">100+</div>
              <div className="text-sm text-muted-foreground">Apps Built</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">50K+</div>
              <div className="text-sm text-muted-foreground">Components Generated</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">95.9%</div>
              <div className="text-sm text-muted-foreground">Quality Score Avg</div>
            </div>
          </div>
        </div>
      </section>

      {/* Everything You Need Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-4">
              EVERYTHING YOU NEED TO<br />BUILD & SHIP APPS
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
              From idea to production in minutes. MAE handles the complexity so you can focus on what matters.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-sm p-6 hover:shadow-lg hover:border-accent/30 transition-all duration-200 group"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-sm flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet MAE Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image/Illustration */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-accent/20 to-primary/10 rounded-sm border border-border flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <div className="text-2xl font-bold">MAE</div>
                  <div className="text-sm text-muted-foreground">Your AI Engineering Partner</div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-6">MEET MAE</h2>
              <p className="text-base lg:text-lg text-muted-foreground mb-6 leading-relaxed">
                MAE (Modern AI Engineer) is your intelligent coding partner. She plans, builds, and validates every application to ensure production-quality output.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Understands context, language descriptions</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Plans before building (Build Plan phase)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Validates quality with hard contracts</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Self-repairs (up to 2 retries, automatic)</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-muted-foreground">Delivers 80+ quality scores by default</span>
                </li>
              </ul>

              <p className="text-sm text-muted-foreground italic">
                "MAE isn't just a code generator. She's infrastructure."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-sm p-8 lg:p-12">
            <h2 className="text-2xl lg:text-4xl font-bold tracking-tight mb-4">
              READY TO SHIP FASTER?
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground mb-8">
              Start building production apps today. No credit card required.
            </p>
            <Link
              to="/builder"
              className="inline-block px-8 py-4 bg-primary text-primary-foreground rounded-sm font-medium hover:opacity-90 transition-opacity shadow-lg"
            >
              START BUILDING →
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

const features = [
  {
    title: 'AI Code Generation',
    description: 'Describe your app in plain language. MAE generates production-ready React code with TypeScript, Tailwind, and best practices.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Native Mobile Apps',
    description: 'Build iOS and Android apps with React Native + Expo. One codebase, native performance, EAS Build ready.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Live Preview',
    description: 'See your app running live as MAE builds. Instant feedback loop, no waiting for deploys.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'One-Click Deploy',
    description: 'Deploy to Vercel, Netlify, or export as code. No build configs, no deployment headaches.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    title: 'Built-In Stacks',
    description: 'Full-stack apps with React, Supabase, Postgres, and hosted backends. Database to deploy in one click.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    title: 'Iterate Fast',
    description: 'Modify your app with natural language. MAE updates code while preserving your changes and state.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];
