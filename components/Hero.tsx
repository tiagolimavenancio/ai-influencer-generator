export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary)_0%,_transparent_50%)] opacity-15" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-primary)_0%,_transparent_50%)] opacity-10" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Now in Beta — Try it free
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          Create & Schedule AI-Powered{' '}
          <span className="text-primary">Social Media Content</span>{' '}
          in Minutes
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Generate authentic influencer content, auto-schedule posts across platforms,
          and grow your audience — all powered by AI.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#"
            className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Creating Free
          </a>
          <a
            href="#features"
            className="rounded-full border border-border px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-muted"
          >
            See How It Works
          </a>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {[
            ['10K+', 'Content Pieces'],
            ['5K+', 'Active Users'],
            ['50+', 'Platforms'],
            ['98%', 'Satisfaction'],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-primary">{stat}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
