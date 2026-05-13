const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '5 AI-generated posts/month',
      '1 social account',
      'Basic scheduling',
      '7-day content history',
    ],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$29',
    description: 'For growing creators & businesses',
    features: [
      'Unlimited AI-generated posts',
      'Up to 10 social accounts',
      'Smart scheduling & auto-post',
      'Advanced analytics',
      'Content calendar',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    description: 'For agencies & teams',
    features: [
      'Everything in Pro',
      'Unlimited social accounts',
      'Team collaboration',
      'AI influencer matching',
      'Custom branding',
      'Dedicated account manager',
      'API access',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent{' '}
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.featured
                  ? 'border-primary bg-primary/5 shadow-xl'
                  : 'border-border bg-card'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-card-foreground">
                  {plan.name}
                </h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-card-foreground">
                    {plan.price}
                  </span>
                  {plan.price !== '$0' && (
                    <span className="text-sm text-muted-foreground">/month</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <svg
                      className={`h-4 w-4 flex-shrink-0 ${plan.featured ? 'text-primary' : 'text-primary'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`rounded-full px-6 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
                  plan.featured
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-background text-foreground hover:bg-muted'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
