"use client";

import Image from "next/image";
import Link from "next/link";
import type { SVGProps } from "react";
import { ArrowUpRight, BrainCircuit, HeartHandshake, Leaf, ShieldCheck, Truck } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { MotionReveal } from "./MotionReveal";

const values = [
  {
    title: "Human first",
    text: "AI should make shopping feel simpler, never less personal.",
    Icon: HeartHandshake,
    color: "bg-rose-50 text-rose-500",
  },
  {
    title: "Quietly smart",
    text: "Useful intelligence works in the background and keeps every choice clear.",
    Icon: BrainCircuit,
    color: "bg-violet-50 text-violet-500",
  },
  {
    title: "Ready when you are",
    text: "From search to delivery, every step is designed to keep life moving.",
    Icon: Truck,
    color: "bg-sky-50 text-sky-500",
  },
];

const team = [
  {
    name: "Mary Jane",
    role: "Founder",
    image: "/review-girl.jpg",
    position: "object-[center_22%]",
    color: "bg-[#eaf8ef]",
  },
  {
    name: "Sarah Chen",
    role: "Product Lead",
    image: "/smiling-girl-landing-page.png",
    position: "object-top",
    color: "bg-[#fff4df]",
  },
  {
    name: "John Paul",
    role: "AI Engineer",
    image: "/male-courier.png",
    position: "object-top",
    color: "bg-[#eaf5ff]",
  },
  {
    name: "David Kim",
    role: "Operations",
    image: "/male-courier.png",
    position: "object-top",
    color: "bg-[#f4efff]",
  },
];

const socials = [
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: "linkedin" },
  { label: "GitHub", href: "https://github.com", icon: "github" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
] as const;

export function AboutPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="overflow-hidden bg-[#fcfdfb] text-text-dark">
      <section className="relative mx-auto grid min-h-[680px] max-w-300 items-center gap-14 px-6 py-16 min-[921px]:grid-cols-[1.02fr_0.98fr] min-[921px]:px-8 min-[921px]:py-24">
        <div className="pointer-events-none absolute top-8 -left-40 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-extrabold tracking-[0.16em] text-emerald-600 uppercase shadow-sm">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            This is Agentica
          </p>
          <h1 className="mt-7 max-w-170 text-[clamp(2.8rem,6.4vw,5.5rem)] leading-[0.98] font-extrabold tracking-[-0.045em]">
            We make everyday shopping feel <span className="text-[#20b951]">lighter.</span>
          </h1>
          <p className="mt-7 max-w-145 text-base leading-7 font-medium text-[#617080] min-[700px]:text-lg min-[700px]:leading-8">
            Agentica brings natural AI search, thoughtful recommendations, and reliable delivery
            together—so finding what you need feels less like a task.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex h-12 items-center gap-2 rounded-full bg-text-dark px-6 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
              href="/products"
            >
              Explore products
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <a
              className="inline-flex h-12 items-center rounded-full border border-[#dfe8e2] bg-white px-6 text-sm font-extrabold transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              href="#story"
            >
              Our story
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.12 }}
          className="relative mx-auto w-full max-w-135"
        >
          <div className="absolute inset-8 rotate-3 rounded-[46px] bg-[#35dc63]" />
          <div className="relative min-h-115 overflow-hidden rounded-[42px] bg-[#e8f7ec] shadow-[0_30px_80px_rgba(9,39,68,0.13)]">
            <div className="absolute inset-x-8 top-8 flex items-center justify-between text-xs font-extrabold tracking-[0.12em] text-emerald-700 uppercase">
              <span>Smarter choices</span>
              <span>Less effort</span>
            </div>
            <motion.div
              animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-x-0 bottom-0"
            >
              <Image
                className="mx-auto h-auto w-[108%] max-w-none translate-x-4"
                src="/smiling-girl-landing-page.png"
                alt="Smiling Agentica shopper carrying groceries"
                width={657}
                height={494}
                priority
              />
            </motion.div>
          </div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, -7, 0], rotate: [-2, 0, -2] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-24 -left-5 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(9,39,68,0.13)] backdrop-blur min-[600px]:-left-12"
          >
            <BrainCircuit className="h-6 w-6 text-violet-500" aria-hidden="true" />
            <p className="mt-2 text-sm font-extrabold">Ask naturally</p>
            <p className="mt-0.5 text-xs font-medium text-[#7a8794]">We understand the details.</p>
          </motion.div>

          <motion.div
            animate={reduceMotion ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-0 bottom-8 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(9,39,68,0.13)] backdrop-blur min-[600px]:-right-8"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-500">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold">Delivered simply</p>
              <p className="mt-0.5 text-xs font-medium text-[#7a8794]">From cart to doorstep.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <section
        id="story"
        className="mx-auto max-w-300 scroll-mt-24 px-6 py-18 min-[921px]:px-8 min-[921px]:py-26"
      >
        <MotionReveal>
          <div className="grid gap-8 min-[850px]:grid-cols-[0.72fr_1.28fr] min-[850px]:gap-20">
            <div>
              <p className="text-sm font-extrabold tracking-[0.14em] text-logo-orange uppercase">
                Why we exist
              </p>
              <h2 className="mt-4 text-4xl leading-tight font-extrabold tracking-[-0.03em] min-[700px]:text-5xl">
                Technology with a human point of view.
              </h2>
            </div>
            <div className="border-l-2 border-emerald-200 pl-7 min-[700px]:pl-10">
              <p className="text-xl leading-8 font-semibold text-[#35495b] min-[700px]:text-2xl min-[700px]:leading-10">
                We started Agentica with one simple belief: the best shopping technology should give
                you time back, not another interface to manage.
              </p>
              <p className="mt-6 text-base leading-7 font-medium text-[#71808e]">
                That is why our agents listen before they recommend, explain before they act, and
                keep people in control from first search to final delivery.
              </p>
            </div>
          </div>
        </MotionReveal>

        <div className="mt-14 grid gap-5 min-[760px]:grid-cols-3">
          {values.map(({ title, text, Icon, color }, index) => (
            <motion.article
              key={title}
              initial={reduceMotion ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : index * 0.08,
              }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="rounded-[28px] border border-[#e5ece7] bg-white p-7 shadow-[0_14px_40px_rgba(9,39,68,0.05)]"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${color}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-xl font-extrabold">{title}</h3>
              <p className="mt-3 text-sm leading-6 font-medium text-[#6d7b89]">{text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-[#092744] text-white">
        <div className="mx-auto grid max-w-300 gap-6 px-6 py-18 min-[780px]:grid-cols-2 min-[921px]:px-8 min-[921px]:py-24">
          <MotionReveal className="h-full">
            <article className="h-full rounded-[30px] bg-white/7 p-8 ring-1 ring-white/10 min-[700px]:p-10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-main-green text-text-dark">
                <Leaf className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-8 text-xs font-extrabold tracking-[0.18em] text-main-green uppercase">
                Our mission
              </p>
              <h2 className="mt-4 text-3xl leading-tight font-extrabold">
                Make good choices feel effortless.
              </h2>
              <p className="mt-4 max-w-120 leading-7 font-medium text-white/65">
                Help every household discover the right products faster through calm, useful AI.
              </p>
            </article>
          </MotionReveal>
          <MotionReveal className="h-full" delay={0.1}>
            <article className="h-full rounded-[30px] bg-[#fff5df] p-8 text-text-dark min-[700px]:p-10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-logo-orange">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-8 text-xs font-extrabold tracking-[0.18em] text-logo-orange uppercase">
                Our vision
              </p>
              <h2 className="mt-4 text-3xl leading-tight font-extrabold">
                Become the shopping companion people trust.
              </h2>
              <p className="mt-4 max-w-120 leading-7 font-medium text-[#64717c]">
                A more connected future for customers, local stores, and growing communities.
              </p>
            </article>
          </MotionReveal>
        </div>
      </section>

      <section className="mx-auto max-w-300 px-6 py-18 min-[921px]:px-8 min-[921px]:py-26">
        <MotionReveal>
          <div className="flex flex-col justify-between gap-5 min-[760px]:flex-row min-[760px]:items-end">
            <div>
              <p className="text-sm font-extrabold tracking-[0.14em] text-emerald-600 uppercase">
                The people
              </p>
              <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.03em] min-[700px]:text-5xl">
                Small team, shared purpose.
              </h2>
            </div>
            <p className="max-w-105 text-sm leading-6 font-medium text-[#71808e]">
              Product thinkers, AI builders, and operators working together to make commerce feel
              more considered.
            </p>
          </div>
        </MotionReveal>

        <div className="mt-10 grid gap-5 min-[620px]:grid-cols-2 min-[1050px]:grid-cols-4">
          {team.map(({ name, role, image, position, color }, index) => (
            <motion.article
              key={name}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: reduceMotion ? 0 : 0.55,
                delay: reduceMotion ? 0 : index * 0.08,
              }}
              className="group overflow-hidden rounded-[28px] border border-[#e3ebe6] bg-white"
            >
              <div className={`relative aspect-[4/4.2] overflow-hidden ${color}`}>
                <Image
                  className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${position}`}
                  src={image}
                  alt={name}
                  width={520}
                  height={550}
                />
              </div>
              <div className="p-5 min-[760px]:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold">{name}</h3>
                    <p className="mt-1 text-sm font-semibold text-[#7b8894]">{role}</p>
                  </div>
                  <span
                    className="mt-2 h-2.5 w-2.5 rounded-full bg-main-green"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-5 flex gap-2 border-t border-[#edf1ee] pt-4">
                  {socials.map(({ label, href, icon }) => (
                    <a
                      className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f7f5] text-[#71808e] transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-600"
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${name} on ${label}`}
                      key={label}
                    >
                      <SocialIcon className="h-4 w-4" name={icon} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="px-6 pb-18 min-[921px]:px-8 min-[921px]:pb-24">
        <MotionReveal>
          <div className="relative mx-auto max-w-300 overflow-hidden rounded-[34px] bg-main-green px-7 py-14 text-center min-[700px]:px-14 min-[700px]:py-18">
            <div className="absolute -top-24 -right-16 h-64 w-64 rounded-full border-[45px] border-white/20" />
            <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border-[45px] border-white/20" />
            <div className="relative">
              <p className="text-xs font-extrabold tracking-[0.18em] text-emerald-900 uppercase">
                Come shop with us
              </p>
              <h2 className="mx-auto mt-4 max-w-175 text-3xl leading-tight font-extrabold tracking-[-0.03em] min-[700px]:text-5xl">
                Less searching. More living.
              </h2>
              <Link
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-text-dark px-6 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#14395b]"
                href="/products"
              >
                Start exploring
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </MotionReveal>
      </section>
    </main>
  );
}

function SocialIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: (typeof socials)[number]["icon"] }) {
  if (name === "linkedin") {
    return (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.94 8.9H3.72V20h3.22V8.9ZM5.33 4A1.86 1.86 0 1 0 5.3 7.72 1.86 1.86 0 0 0 5.33 4ZM20.28 13.64c0-3.05-1.63-4.47-3.8-4.47a3.28 3.28 0 0 0-2.96 1.63h-.04V8.9h-3.09V20h3.22v-5.49c0-1.45.27-2.85 2.06-2.85 1.77 0 1.79 1.65 1.79 2.94V20h3.22v-6.36h-.4Z" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg {...props} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.2-3.37-1.2-.45-1.15-1.11-1.46-1.11-1.46-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6c.85 0 1.7.11 2.5.33 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86v2.76c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
      </svg>
    );
  }

  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="16" height="16" x="4" y="4" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}
