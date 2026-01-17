import { Link } from 'react-router-dom';
import { MarketingLayout } from '../components/marketing/MarketingLayout';

export function Pricing() {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 radial-gradient" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 badge-glow px-4 py-2 rounded-full mb-8">
              <span className="mono-heading text-xs">Pricing</span>
            </div>

            <h1 className="mono-heading text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-6">
              <span className="text-foreground">SIMPLE, TRANSPARENT</span>
              <br />
              <span className="gradient-text">PRICING</span>
            </h1>

            <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Start free, scale as you grow. No hidden fees. No surprises. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-card border rounded-xl p-8 ${
                  plan.featured ? 'border-accent scale-105 shadow-2xl shadow-accent/10' : 'border-border/50'
                }`}
              >
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 badge-glow px-4 py-1.5 rounded-full">
                    <span className="mono-heading text-xs">Most Popular</span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="mono-heading text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="mb-8">
                  <span className="mono-heading text-5xl font-bold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground text-sm ml-1">/{plan.period}</span>}
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/builder"
                  className={`block text-center py-4 rounded-lg text-sm font-medium transition-all ${
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

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 border-t border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                FREQUENTLY ASKED QUESTIONS
              </h2>
              <p className="text-muted-foreground">
                Everything you need to know about MAE pricing.
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-card border border-border/50 rounded-lg p-6">
                  <h3 className="mono-heading text-sm font-semibold text-foreground mb-2">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-accent/10 to-primary/5 border border-accent/20 rounded-xl p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 badge-glow px-3 py-1 rounded-full mb-4">
                  <span className="mono-heading text-xs">Enterprise</span>
                </div>
                <h2 className="mono-heading text-2xl lg:text-3xl font-bold tracking-tight mb-4 text-foreground">
                  NEED MORE?
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  For larger teams with custom requirements, we offer tailored solutions with dedicated support, SLAs, and advanced security features.
                </p>
                <ul className="space-y-3 mb-6">
                  {['Custom integrations', 'Dedicated support', 'SLA guarantees', 'On-premise options', 'Volume discounts'].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center lg:text-right">
                <a
                  href="mailto:enterprise@teammae.ai"
                  className="btn-primary inline-block px-8 py-4 rounded text-sm"
                >
                  Contact Sales <span className="ml-2">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out MAE and personal projects.',
    price: 'Free',
    period: null,
    features: [
      '3 projects',
      'Basic AI generations (100/month)',
      'Community support',
      'Web deployment only',
      'MAE branding on apps',
    ],
    cta: 'Start Free',
    featured: false,
  },
  {
    name: 'Pro',
    description: 'For serious builders and indie hackers.',
    price: '$49',
    period: 'month',
    features: [
      'Unlimited projects',
      'Unlimited AI generations',
      'Priority support',
      'iOS + Android + Web deployment',
      'Custom domains',
      'Remove MAE branding',
      'API access',
      'Priority queue',
    ],
    cta: 'Get Started',
    featured: true,
  },
  {
    name: 'Team',
    description: 'For teams shipping products together.',
    price: '$149',
    period: 'month',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared workspaces',
      'Role-based permissions',
      'SSO authentication',
      'Audit logs',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Start Team Trial',
    featured: false,
  },
];

const faqs = [
  {
    question: 'Can I try MAE before paying?',
    answer: 'Absolutely! The Starter plan is completely free and gives you access to core features. No credit card required to get started.',
  },
  {
    question: 'What counts as an "AI generation"?',
    answer: 'Each time MAE generates code, creates a component, or makes changes to your app based on your instructions counts as one generation. On paid plans, generations are unlimited.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period, and you can export all your projects.',
  },
  {
    question: 'Do I own the code MAE generates?',
    answer: 'Yes! All code generated by MAE belongs to you. You can export it, modify it, and use it however you want - even after canceling your subscription.',
  },
  {
    question: 'What happens to my apps if I downgrade?',
    answer: 'Your deployed apps continue to work. However, you may lose access to premium features like custom domains and native mobile deployments on the free plan.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 14-day money-back guarantee. If you\'re not satisfied with MAE Pro or Team, contact us within 14 days for a full refund.',
  },
];
