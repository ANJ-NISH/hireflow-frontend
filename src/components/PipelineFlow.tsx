const stages = [
  { label: "Applied" },
  { label: "Screening" },
  { label: "Shortlisted" },
  { label: "Interview" },
  { label: "Offered" },
  { label: "Hired", isFinal: true },
];

export default function PipelineFlow() {
  return (
    <section id="pipeline" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-xl">
          <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">
            One pipeline, always visible
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            Every application moves through the same six stages.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft md:text-base">
            No more guessing what "under review" means. You see the exact
            stage your application is in, every time it changes.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto">
          <div className="flex min-w-[720px] items-center">
            {stages.map((stage, i) => (
              <div key={stage.label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold ${
                      stage.isFinal
                        ? "border-success bg-success text-white"
                        : "border-primary bg-white text-primary"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      stage.isFinal ? "text-success" : "text-ink"
                    }`}
                  >
                    {stage.label}
                  </span>
                </div>

                {i < stages.length - 1 && (
                  <div className="mx-2 h-0.5 flex-1 bg-gradient-to-r from-primary/40 to-primary/10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
