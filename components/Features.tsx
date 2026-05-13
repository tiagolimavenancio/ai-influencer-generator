const features = [
  {
    title: 'AI Content Generation',
    description:
      'Generate high-quality, on-brand social media content with advanced AI that understands your voice and style.',
    icon: '✨',
  },
  {
    title: 'Auto Post Scheduling',
    description:
      'Schedule and auto-publish content across multiple platforms at optimal times for maximum engagement.',
    icon: '📅',
  },
  {
    title: 'Multi-Platform Support',
    description:
      'Seamlessly post to Instagram, TikTok, Twitter/X, LinkedIn, Facebook, and YouTube from one dashboard.',
    icon: '🌐',
  },
  {
    title: 'Smart Analytics',
    description:
      'Track performance metrics, engagement rates, and audience growth with AI-powered insights and recommendations.',
    icon: '📊',
  },
  {
    title: 'Content Calendar',
    description:
      'Plan your content strategy visually with a drag-and-drop calendar. Never miss a posting day again.',
    icon: '🗓️',
  },
  {
    title: 'AI Influencer Matching',
    description:
      'Find and collaborate with relevant influencers using AI matching based on niche, audience, and engagement.',
    icon: '🤝',
  },
]

export default function Features() {
  return (
    <section id="features" className="border-t border-border px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need to{' '}
            <span className="text-primary">Dominate Social Media</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed to streamline your content creation and publishing workflow.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-card-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
