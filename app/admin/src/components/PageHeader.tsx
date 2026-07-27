export function PageHeader({
  eyebrow,
  title,
  description,
  syncedAt,
}: {
  eyebrow: string;
  title: string;
  description: string;
  syncedAt?: string;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-6 max-sm:grid">
      <div>
        <p className="mb-2 text-xs font-extrabold uppercase tracking-normal text-blue-600">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-bold leading-tight max-sm:text-3xl">{title}</h1>
        <p className="mt-2.5 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {syncedAt ? (
        <div className="grid min-w-56 gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-3 max-sm:min-w-0">
          <span className="font-extrabold text-emerald-700">React Query cache</span>
          <strong className="text-xs text-slate-500">{syncedAt}</strong>
        </div>
      ) : null}
    </header>
  );
}
