const columns = [
  {
    title: "Candidates",
    links: ["Browse jobs", "Saved jobs", "Application tracker", "Resume tips"],
  },
  {
    title: "Recruiters",
    links: ["Post a job", "Search candidates", "Pricing", "Company profile"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Blog", "Contact"],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-white">
                H
              </span>
              <span className="font-display text-lg font-semibold text-ink">HireFlow</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              A clearer way to search, apply, and hire — one visible pipeline
              for every application.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-ink">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ink-soft hover:text-primary">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-ink-soft sm:flex-row">
          <span>© {new Date().getFullYear()} HireFlow. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
