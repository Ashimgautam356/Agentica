"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function SiteMotion({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
