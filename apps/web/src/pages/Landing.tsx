import { Link } from 'react-router-dom';
import { MarketingLayout } from '../components/marketing/MarketingLayout';

export function Landing() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-8 animate-fade-in-down opacity-0">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="mono-heading text-xs">AI-Powered App Builder</span>
            </div>

            {/* Headline */}
            <h1 className="mono-heading text-4xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up opacity-0 delay-100">
              <span className="text-foreground">DESCRIBE YOUR APP.</span>
              <br />
              <span className="gradient-text">WATCH IT BUILD.</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-up opacity-0 delay-200">
              Meet MAE – your Master AI Engineer. Build production-ready web apps, native iOS, and Android applications just by describing what you want.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up opacity-0 delay-300">
              <Link
                to="/builder"
                className="btn-primary px-8 py-4 rounded text-sm w-full sm:w-auto text-center"
              >
                Get Started Free <span className="ml-2">&rarr;</span>
              </Link>
              <button className="btn-secondary px-8 py-4 rounded text-sm w-full sm:w-auto flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="mono-heading text-3xl lg:text-4xl font-bold text-foreground mb-1">10K+</div>
              <div className="text-xs text-muted-foreground">Apps Built</div>
            </div>
            <div>
              <div className="mono-heading text-3xl lg:text-4xl font-bold text-foreground mb-1">50K+</div>
              <div className="text-xs text-muted-foreground">Developers</div>
            </div>
            <div>
              <div className="mono-heading text-3xl lg:text-4xl font-bold text-foreground mb-1">99.9%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Badge */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-6">
              <span className="mono-heading text-xs">Powerful Features</span>
            </div>
            <h2 className="mono-heading text-2xl lg:text-4xl font-bold tracking-tight mb-4">
              EVERYTHING YOU NEED TO
              <br />
              <span className="gradient-text">BUILD & SHIP APPS</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              From idea to production in minutes. MAE handles the complexity so you can focus on what matters.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="glow-card bg-card border border-border/50 rounded-lg p-6 hover:border-accent/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="mono-heading text-sm font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet MAE Section */}
      <section className="py-16 lg:py-24 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: MAE Image */}
            <div className="relative flex justify-center">
              <div className="relative w-72 h-72 lg:w-96 lg:h-96 animate-float">
                {/* Glow effect behind */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-3xl animate-pulse-glow" />
                {/* MAE mascot image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/mae-mascot.png"
                    alt="MAE - Master AI Engineer"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
                {/* AI Powered badge */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 badge-glow px-4 py-2 rounded-full flex items-center gap-2">
                  <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="mono-heading text-xs">AI Powered</span>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <h2 className="mono-heading text-2xl lg:text-4xl font-bold tracking-tight mb-2 text-foreground">MEET MAE</h2>
              <p className="mono-heading text-sm text-accent mb-6">YOUR AI ENGINEERING PARTNER</p>

              <p className="text-base text-muted-foreground mb-6 leading-relaxed">
                MAE (Master AI Engineer) is your dedicated AI that understands what you want to build and makes it happen. No more wrestling with code, configurations, or deployments. Just describe your vision and watch it come to life.
              </p>

              <ul className="space-y-3 mb-8">
                {maeFeatures.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <Link to="/about" className="mono-heading text-xs text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-1">
                Learn more about MAE <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Team Workspaces Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            {/* Social proof avatars */}
            <div className="flex justify-center -space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-primary border-2 border-background" />
              ))}
            </div>

            <h2 className="mono-heading text-2xl lg:text-4xl font-bold tracking-tight mb-4">
              TEAM WORKSPACES
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Collaborate seamlessly with your team. Share projects, manage permissions, and build together in real-time with MAE.
            </p>
          </div>

          {/* Workspace Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {workspaceFeatures.map((feature, idx) => (
              <div key={idx} className="text-center p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="mono-heading text-sm font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-6">
              <span className="mono-heading text-xs">Simple Pricing</span>
            </div>
            <h2 className="mono-heading text-2xl lg:text-4xl font-bold tracking-tight mb-4">
              SIMPLE, TRANSPARENT
              <br />
              <span className="gradient-text">PRICING</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Start free, scale as you grow. No hidden fees. No surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-card border rounded-lg p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.featured ? 'border-accent scale-105 shadow-lg shadow-accent/10' : 'border-border/50 hover:border-accent/50'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-glow px-3 py-1 rounded-full">
                    <span className="mono-heading text-xs">Most Popular</span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="mono-heading text-lg font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="mono-heading text-4xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm">/{plan.period}</span>}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/builder"
                  className={`block text-center py-3 rounded text-sm ${
                    plan.featured ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-lg p-8 lg:p-12">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
              READY TO BUILD SOMETHING AMAZING?
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Join thousands of developers building with MAE. Start free today.
            </p>
            <Link
              to="/builder"
              className="btn-primary inline-block px-8 py-4 rounded text-sm"
            >
              Start Building for Free <span className="ml-2">&rarr;</span>
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
    description: 'MAE writes clean, production-ready code from your descriptions. No boilerplate, no setup – just results.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Native Mobile Apps',
    description: 'Build real native iOS and Android apps, not web wrappers. One codebase, two platforms.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Live Preview',
    description: 'See your app update in real-time as MAE builds. Every change is visible instantly.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'One-Click Deploy',
    description: 'Deploy to production with a single click. MAE handles servers, and scaling – we handle it all.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    title: 'Built-in Backend',
    description: 'Database, authentication, APIs – everything you need is ready to go. No configuration required.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    title: 'Iterate Fast',
    description: 'Make changes by just asking. MAE understands context and updates your app accordingly.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
];

const maeFeatures = [
  'Understands natural language descriptions',
  'Generates production-ready code instantly',
  'Iterates based on your feedback',
  'Deploys to web, iOS, and Android',
];

const workspaceFeatures = [
  {
    title: 'Shared Workspaces',
    description: 'Create workspaces for your team or clients. Everyone sees the same projects, same progress, same results.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Role Permissions',
    description: 'Control who can view, edit, or deploy. Keep your projects secure with granular permissions.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Pooled Credits',
    description: 'Team credits are shared across all members. No more individual billing – one pool, unlimited collaboration.',
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out MAE',
    price: 'Free',
    period: null,
    features: [
      '3 projects',
      'Basic AI generations',
      'Community support',
      'Web deployment',
    ],
    cta: 'Start Free →',
    featured: false,
  },
  {
    name: 'Pro',
    description: 'For serious builders',
    price: '$49',
    period: 'month',
    features: [
      'Unlimited projects',
      'Priority AI models',
      'Priority support',
      'iOS + Android + Web deployment',
      'Custom domains',
      'API access',
    ],
    cta: 'Get Started →',
    featured: true,
  },
  {
    name: 'Team',
    description: 'For teams shipping together',
    price: '$149',
    period: 'month',
    features: [
      'Everything in Pro',
      '5 team members',
      'Shared workspaces',
      'Role permissions',
      'SSO & security',
      'Dedicated support',
    ],
    cta: 'Contact Sales →',
    featured: false,
  },
];
