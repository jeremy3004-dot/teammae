import { Link } from 'react-router-dom';
import { MarketingLayout } from '../components/marketing/MarketingLayout';

export function About() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-8">
              <span className="mono-heading text-xs">About MAE</span>
            </div>

            <h1 className="mono-heading text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">MEET YOUR</span>
              <br />
              <span className="gradient-text">MASTER AI ENGINEER</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              MAE is more than just an AI code generator. It's your engineering partner that understands what you want to build and makes it happen.
            </p>
          </div>
        </div>
      </section>

      {/* MAE Character Section */}
      <section className="py-16 lg:py-24 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* MAE Image */}
            <div className="relative flex justify-center">
              <div className="relative w-72 h-72 lg:w-96 lg:h-96">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-3xl" />
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  <img
                    src="/images/mae-mascot.png"
                    alt="MAE - Master AI Engineer"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="mono-heading text-2xl lg:text-4xl font-bold tracking-tight mb-2 text-foreground">
                WHO IS MAE?
              </h2>
              <p className="mono-heading text-sm text-accent mb-6">MASTER AI ENGINEER</p>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  MAE (Master AI Engineer) represents a new kind of development experience. Born from the frustration of slow development cycles, complex configurations, and the gap between ideas and implementation.
                </p>
                <p>
                  Instead of spending weeks setting up infrastructure, configuring build tools, and writing boilerplate, you simply describe what you want to build. MAE handles the rest.
                </p>
                <p>
                  MAE understands modern app development. It knows best practices, design patterns, and how to structure code that scales. It's like having a senior engineer on your team, available 24/7.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How MAE Works */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
              HOW MAE WORKS
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From idea to deployed app in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="mono-heading text-2xl font-bold text-accent">{idx + 1}</span>
                </div>
                <h3 className="mono-heading text-sm font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                POWERED BY CUTTING-EDGE AI
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                MAE is built on the latest advances in large language models and code generation technology.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {techFeatures.map((feature, idx) => (
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
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-6 text-foreground">
              OUR VISION
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We believe everyone should be able to build software. Not just developers with years of experience, but anyone with an idea. MAE is our step toward that future - where the barrier between imagination and creation disappears.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              The best ideas often come from people who understand problems deeply but lack the technical skills to solve them. MAE bridges that gap, turning domain experts into builders and dreamers into makers.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-lg p-8 lg:p-12">
            <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
              READY TO MEET MAE?
            </h2>
            <p className="text-base text-muted-foreground mb-8">
              Start building your first app today. No credit card required.
            </p>
            <Link
              to="/builder"
              className="btn-primary inline-block px-8 py-4 rounded text-sm"
            >
              Start Building Free <span className="ml-2">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

const steps = [
  {
    title: 'DESCRIBE YOUR APP',
    description: 'Tell MAE what you want to build in plain English. Describe features, functionality, and design preferences.',
  },
  {
    title: 'WATCH IT BUILD',
    description: 'MAE generates production-ready code in real-time. See your app take shape with live preview.',
  },
  {
    title: 'DEPLOY & ITERATE',
    description: 'Deploy with one click. Keep improving by describing changes - MAE understands context and updates accordingly.',
  },
];

const techFeatures = [
  {
    title: 'Advanced Language Understanding',
    description: 'MAE understands nuanced requirements, technical constraints, and design preferences from natural language descriptions.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Context-Aware Code Generation',
    description: 'Each generation considers your entire project structure, existing code, and stated goals to produce coherent, consistent code.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Continuous Learning',
    description: 'MAE learns from the latest frameworks, libraries, and best practices to generate modern, maintainable code.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    title: 'Multi-Modal Understanding',
    description: 'Share screenshots, wireframes, or design files. MAE can interpret visual inputs and translate them into working code.',
    icon: (
      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];
