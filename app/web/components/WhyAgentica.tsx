import { MessageSquare, Network, ShieldCheck, Sparkles } from "lucide-react";

const reasons = [
  {
    title: "Talk, don't filter",
    text: "Describe what you need in your own words - no dropdown filters required.",
    icon: MessageSquare,
  },
  {
    title: "Cross-store comparison",
    text: "MCP connects Agentica to real store catalogs, so comparisons stay current.",
    icon: Network,
  },
  {
    title: "Confirms before it buys",
    text: "The assistant proposes an order and always waits for your go-ahead.",
    icon: ShieldCheck,
  },
];

export function WhyAgentica() {
  return (
    <section className="mx-auto max-w-282.5 px-4 py-12 min-[921px]:px-7 min-[921px]:py-16">
      <div className="mx-auto max-w-150 text-center">
        <div className="glowing-pill mx-auto inline-flex items-center gap-2 rounded-full border border-[#e2e8ef] bg-white px-3.5 py-1.5 text-[11px] font-medium text-[#66717f] shadow-[0_8px_20px_rgba(9,39,68,0.04)] min-[921px]:text-sm">
          <Sparkles className="h-3.5 w-3.5 text-main-green min-[921px]:h-4 min-[921px]:w-4" />
          AI-driven MCP shopping assistant
        </div>

        <h2 className="mt-4 mb-0 text-[26px] leading-[1.12] font-extrabold text-text-dark min-[921px]:text-[40px]">
          Why Agentica feels different
        </h2>
        <p className="mx-auto mt-3 mb-0 max-w-118 text-sm leading-6 text-[#737b87] min-[921px]:text-base">
          Talk to an AI to search products, compare across real store catalogs, and let it place
          orders - only after your go-ahead.
        </p>
      </div>

      <div className="mt-8 grid gap-4 min-[721px]:grid-cols-3 min-[921px]:mt-10 min-[921px]:gap-7">
        {reasons.map((reason) => {
          const Icon = reason.icon;

          return (
            <article
              className="rounded-xl border border-[#dfe5eb] bg-white px-6 py-7 shadow-[0_8px_20px_rgba(9,39,68,0.05)] min-[921px]:px-8 min-[921px]:py-9"
              key={reason.title}
            >
              <div className="flex h-13 w-13 items-center justify-center rounded-full bg-[linear-gradient(135deg,#b8f7c8,#35dc63)] text-white shadow-[0_12px_22px_rgba(53,220,99,0.24)]">
                <Icon className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h3 className="mt-6 mb-0 text-lg font-extrabold text-text-dark min-[921px]:text-xl">
                {reason.title}
              </h3>
              <p className="mt-4 mb-0 text-sm leading-6 text-[#737b87]">{reason.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
