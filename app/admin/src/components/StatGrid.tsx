import type { Stat } from "../api/admin";

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <section
      className="mb-4 grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1"
      aria-label="Dashboard statistics"
    >
      {stats.map((stat) => (
        <article
          className="grid min-h-32 gap-2.5 rounded-lg border border-slate-200 bg-white p-4"
          key={stat.label}
        >
          <span className="text-sm font-bold text-slate-500">{stat.label}</span>
          <strong className="text-3xl font-bold">{stat.value}</strong>
          <small className="text-xs text-slate-500">{stat.note}</small>
        </article>
      ))}
    </section>
  );
}
