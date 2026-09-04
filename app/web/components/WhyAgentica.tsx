"use client";

import { MessageSquare, Network, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

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
  const reduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-282.5 px-4 py-12 min-[921px]:px-7 min-[921px]:py-16">
      <div className="mx-auto max-w-150 text-center">
        <motion.div
          className="relative isolate mx-auto inline-flex cursor-default rounded-full"
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -4, 0],
                  boxShadow: [
                    "0 8px 24px rgba(53,220,99,0.14)",
                    "0 14px 38px rgba(124,58,237,0.24)",
                    "0 8px 24px rgba(53,220,99,0.14)",
                  ],
                }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          whileHover={reduceMotion ? undefined : { scale: 1.08, rotate: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          <motion.span
            className="absolute -inset-1.5 -z-10 rounded-full blur-md"
            style={{
              background: "linear-gradient(90deg, #35dc63, #80f5a0, #8b5cf6, #ffb347, #35dc63)",
              backgroundSize: "225% 100%",
            }}
            animate={
              reduceMotion
                ? undefined
                : {
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    opacity: [0.6, 0.9, 0.6],
                    scale: [1, 1.025, 1],
                  }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />

          <span className="relative z-10 inline-flex items-center gap-2.5 overflow-visible rounded-full border border-white/80 bg-white/90 px-3.5 py-1.5 text-[11px] font-semibold shadow-inner backdrop-blur min-[921px]:text-sm">
            <motion.span
              className="relative grid h-8 w-8 place-items-center rounded-full bg-emerald-50"
              animate={
                reduceMotion
                  ? undefined
                  : {
                      rotate: [-14, 16, -14],
                      scale: [1, 1.28, 1],
                      x: [0, 2, 0],
                    }
              }
              transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-5.5 w-5.5 text-main-green drop-shadow-[0_0_8px_rgba(53,220,99,0.95)] min-[921px]:h-6 min-[921px]:w-6" />
              <motion.span
                className="absolute -top-2 -right-1 text-[9px] text-violet-500"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0, 1, 0], scale: [0, 1.5, 0], y: [3, -5, -8] }
                }
                transition={{ duration: 1.1, repeat: Infinity, delay: 0.15 }}
                aria-hidden="true"
              >
                ✦
              </motion.span>
              <motion.span
                className="absolute -bottom-2 -left-1 text-[8px] text-amber-400"
                animate={
                  reduceMotion
                    ? undefined
                    : { opacity: [0, 1, 0], scale: [0, 1.3, 0], x: [3, -4, -7] }
                }
                transition={{ duration: 1.25, repeat: Infinity, delay: 0.65 }}
                aria-hidden="true"
              >
                ✦
              </motion.span>
            </motion.span>

            <motion.span
              className="bg-[linear-gradient(90deg,#66717f_0%,#08b836_30%,#7c3aed_52%,#e8a33d_70%,#66717f_100%)] bg-[length:250%_100%] bg-clip-text text-transparent"
              animate={reduceMotion ? undefined : { backgroundPosition: ["200% 0%", "-50% 0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              AI-driven MCP shopping assistant
            </motion.span>
          </span>
        </motion.div>

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
