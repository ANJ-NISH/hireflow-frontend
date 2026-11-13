export default function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-line bg-surface px-8 py-16 text-center">
        <h2 className="max-w-xl font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
          Your next role is one application away.
        </h2>
        <p className="max-w-md text-sm text-ink-soft md:text-base">
          Create a free account and start tracking applications the way they
          should have worked all along.
        </p>
        <a
          href="/signup"
          className="rounded-full bg-primary px-7 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-primary-deep"
        >
          Create free account
        </a>
      </div>
    </section>
  );
}
