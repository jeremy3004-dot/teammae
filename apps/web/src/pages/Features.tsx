import { Link } from 'react-router-dom';
import { MarketingLayout } from '../components/marketing/MarketingLayout';

export function Features() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-8">
              <span className="mono-heading text-xs">Features</span>
            </div>

            <h1 className="mono-heading text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">EVERYTHING YOU NEED TO</span>
              <br />
              <span className="gradient-text">BUILD APPS FAST</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              MAE combines AI-powered code generation with a complete development platform. From idea to production in minutes, not months.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div>
              <div className="inline-flex items-center gap-2 badge-glow px-3 py-1 rounded-full mb-4">
                <span className="mono-heading text-xs">AI Generation</span>
              </div>
              <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                DESCRIBE IT. BUILD IT.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Just tell MAE what you want to build in plain English. Our AI understands context, requirements, and best practices to generate production-ready code instantly.
              </p>
              <ul className="space-y-3">
                {['Natural language understanding', 'Context-aware generation', 'Clean, maintainable code', 'Follows best practices'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="glow-card bg-card border border-border/50 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-sm text-muted-foreground overflow-x-auto">
                  <code>{`> Build a todo app with
  authentication and
  real-time sync

MAE: Creating your app...
✓ Authentication system
✓ Database schema
✓ Real-time sync
✓ Modern UI components

Your app is ready!`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
            <div className="order-2 lg:order-1 relative">
              <div className="glow-card bg-card border border-border/50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <span className="mono-heading text-xs text-foreground">Web</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="mono-heading text-xs text-foreground">iOS</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-4 text-center">
                    <svg className="w-8 h-8 text-accent mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="mono-heading text-xs text-foreground">Android</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 badge-glow px-3 py-1 rounded-full mb-4">
                <span className="mono-heading text-xs">Multi-Platform</span>
              </div>
              <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                ONE CODEBASE. ALL PLATFORMS.
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Build real native apps for web, iOS, and Android from a single codebase. No wrappers, no compromises - just true native performance everywhere.
              </p>
              <ul className="space-y-3">
                {['Native iOS apps', 'Native Android apps', 'Progressive web apps', 'Shared business logic'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 badge-glow px-3 py-1 rounded-full mb-4">
                <span className="mono-heading text-xs">Live Preview</span>
              </div>
              <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                SEE CHANGES INSTANTLY
              </h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Watch your app come to life in real-time. Every change MAE makes is instantly visible in the live preview, so you can iterate quickly and confidently.
              </p>
              <ul className="space-y-3">
                {['Real-time hot reload', 'Instant feedback loop', 'Mobile device preview', 'Debug tools built-in'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="glow-card bg-card border border-border/50 rounded-lg overflow-hidden">
                <div className="bg-secondary px-4 py-2 flex items-center justify-between border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="mono-heading text-xs text-muted-foreground">Live Preview</span>
                </div>
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Your app updates here in real-time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Features Grid */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
              AND MUCH MORE
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to build, deploy, and scale your applications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moreFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="glow-card bg-card border border-border/50 rounded-lg p-6 hover:border-accent/50 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="mono-heading text-sm font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-lg p-8 lg:p-12">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
              READY TO START BUILDING?
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Try MAE free today and see how fast you can ship.
            </p>
            <Link
              to="/builder"
              className="btn-primary inline-block px-8 py-4 rounded text-sm"
            >
              Get Started Free <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

const moreFeatures = [
  {
    title: 'One-Click Deploy',
    description: 'Deploy to production with a single click. We handle servers, CDN, SSL, and scaling automatically.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    title: 'Built-in Database',
    description: 'Postgres database included with every project. No configuration needed, just start building.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
    ),
  },
  {
    title: 'Authentication',
    description: 'User auth out of the box. Email, social logins, magic links - all configured and ready.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'API Generation',
    description: 'RESTful APIs generated automatically from your data models. Type-safe and well-documented.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Version Control',
    description: 'Full Git integration. Branch, merge, and roll back changes with ease.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    title: 'Team Collaboration',
    description: 'Invite your team, share projects, and build together in real-time.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];
