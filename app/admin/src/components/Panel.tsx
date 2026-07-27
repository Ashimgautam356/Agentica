import type { ReactNode } from "react";

export function Panel({
  title,
  eyebrow,
  action,
  wide,
  children,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <article
      className={`min-w-0 rounded-lg border border-slate-200 bg-white p-5 ${
        wide ? "row-span-2 max-lg:col-span-full" : ""
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="mb-2 text-xs font-extrabold uppercase tracking-normal text-blue-600">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-lg font-bold leading-tight">{title}</h2>
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </article>
  );
}
