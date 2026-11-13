// Placeholder figures — wire up to a real /api/stats endpoint once available.
const stats = [
  { value: "12,400+", label: "Jobs posted" },
  { value: "3,200+", label: "Companies hiring" },
  { value: "9 days", label: "Median time to first interview" },
  { value: "6", label: "Clear stages, every application" },
];

export default function StatsBand() {
  return (
    <section className="bg-primary">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-14 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="font-display text-3xl font-semibold text-white md:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-white/70">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
