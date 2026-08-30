import Image from "next/image";
import type { SVGProps } from "react";
import { BrainCircuit, Eye, Leaf, ShieldCheck, Sparkles, Truck } from "lucide-react";

const principles = [
  {
    title: "Human-first AI",
    text: "We use agents to remove friction, not warmth, from everyday shopping.",
    Icon: BrainCircuit,
  },
  {
    title: "Trusted essentials",
    text: "Every flow is designed around clear choices, secure checkout, and reliable service.",
    Icon: ShieldCheck,
  },
  {
    title: "Local speed",
    text: "We connect customers, stores, and delivery partners so good products move faster.",
    Icon: Truck,
  },
];

const cards = [
  {
    title: "Our Mission",
    text: "To make grocery shopping effortless with AI-powered discovery, smarter recommendations, and dependable delivery that gives people their time back.",
    Icon: Sparkles,
    accent: "bg-main-green text-text-dark",
    border: "border-[#cbf4d6]",
  },
  {
    title: "Our Vision",
    text: "To become the most trusted AI-native shopping companion for households, local stores, and growing communities.",
    Icon: Eye,
    accent: "bg-logo-orange text-white",
    border: "border-[#f3d5a4]",
  },
];

const teamMembers = [
  {
    name: "Mary Jane",
    role: "Founder",
    text: "Guiding Agentica from idea to everyday shopping companion.",
    image: "/review-girl.jpg",
    bg: "bg-[#d8eef0]",
  },
  {
    name: "Sarah Chen",
    role: "Product Lead",
    text: "Designing clear flows for search, discovery, and checkout.",
    image: "/smiling-girl-landing-page.png",
    bg: "bg-[#14395b]",
  },
  {
    name: "John Paul",
    role: "AI Engineer",
    text: "Building the agents that make product discovery feel natural.",
    image: "/male-courier.png",
    bg: "bg-[#ffd884]",
  },
  {
    name: "David Kim",
    role: "Operations",
    text: "Connecting stores, delivery, and customers with reliable systems.",
    image: "/male-courier.png",
    bg: "bg-[#f8f8ef]",
  },
];

type SocialIconName = "instagram" | "linkedin" | "github";

const socialLinks: { label: string; icon: SocialIconName }[] = [
  { label: "Instagram", icon: "instagram" },
  { label: "LinkedIn", icon: "linkedin" },
  { label: "GitHub", icon: "github" },
];

export function AboutPage() {
  return (
    <main className="bg-white text-text-dark">
      <section className="mx-auto grid max-w-282.5 gap-10 px-6 pt-14 pb-12 min-[921px]:grid-cols-[0.95fr_1.05fr] min-[921px]:items-center min-[921px]:px-7 min-[921px]:pt-20 min-[921px]:pb-18">
        <div>
          <p className="inline-flex rounded-full bg-[#eaffef] px-4 py-2 text-xs font-extrabold uppercase text-nav-green">
            About Agentica
          </p>
          <h1 className="mt-5 max-w-165 text-4xl leading-tight font-extrabold tracking-normal min-[921px]:text-6xl">
            Building the smarter way to shop for everyday essentials.
          </h1>
          <p className="mt-6 max-w-150 text-base leading-7 font-medium text-[#526273] min-[921px]:text-lg">
            Agentica brings AI search, product intelligence, and fast fulfillment into one calm
            shopping experience. We help customers find what they need quickly while giving local
            commerce better digital tools.
          </p>
        </div>

        <div className="relative min-h-80 overflow-hidden rounded-lg bg-[#f3f7f4]">
          <Image
            className="absolute right-0 bottom-0 h-auto w-[88%] max-w-125"
            src="/smiling-girl-landing-page.png"
            alt="Happy Agentica shopper"
            width={657}
            height={494}
            priority
          />
          <div className="absolute top-6 left-6 max-w-58 rounded-lg bg-white/90 p-5 shadow-[0_18px_40px_rgba(9,39,68,0.10)]">
            <Leaf className="h-7 w-7 text-nav-green" aria-hidden="true" />
            <p className="mt-4 text-sm leading-5 font-bold text-[#234758]">
              Fresh products, faster decisions, and fewer errands in the day.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f7faf8]">
        <div className="mx-auto grid max-w-282.5 gap-5 px-6 py-12 min-[780px]:grid-cols-3 min-[921px]:px-7 min-[921px]:py-16">
          {principles.map(({ title, text, Icon }) => (
            <article className="rounded-lg border border-[#e0ebe4] bg-white p-6" key={title}>
              <Icon className="h-8 w-8 text-nav-green" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-extrabold">{title}</h2>
              <p className="mt-3 text-sm leading-6 font-medium text-[#526273]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-282.5 px-6 py-14 min-[921px]:px-7 min-[921px]:py-20">
        <div className="max-w-150">
          <p className="text-sm font-extrabold uppercase text-logo-orange">Mission and vision</p>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold min-[921px]:text-5xl">
            The promise behind the product.
          </h2>
        </div>

        <div className="mt-8 grid gap-5 min-[780px]:grid-cols-2">
          {cards.map(({ title, text, Icon, accent, border }) => (
            <article
              className={`rounded-lg border ${border} bg-white p-7 shadow-[0_18px_45px_rgba(9,39,68,0.06)]`}
              key={title}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-lg ${accent}`}>
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="mt-6 text-2xl font-extrabold">{title}</h3>
              <p className="mt-4 text-base leading-7 font-medium text-[#526273]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-282.5 px-6 py-14 min-[921px]:px-7 min-[921px]:py-20">
        <div className="text-center">
          <p className="text-sm font-extrabold uppercase text-nav-green">Our team</p>
          <h2 className="mt-3 text-3xl font-extrabold text-text-dark min-[921px]:text-5xl">
            Meet the minds behind Agentica
          </h2>
          <p className="mx-auto mt-4 max-w-140 text-sm leading-6 font-medium text-[#526273] min-[921px]:text-base">
            A focused team building faster, smarter, and more reliable shopping experiences.
          </p>
        </div>

        <div className="team-strip mx-auto mt-10 flex h-88 max-w-230 gap-5 max-[700px]:h-auto max-[700px]:flex-col">
          {teamMembers.map(({ name, role, text, image, bg }, index) => (
            <article
              className={`team-card group relative min-w-0 overflow-hidden rounded-full ${bg} max-[700px]:h-100 max-[700px]:rounded-[34px]`}
              key={name}
            >
              <Image
                className={`h-full w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 ${
                  index === 1 ? "object-[55%_top]" : ""
                }`}
                src={image}
                alt={name}
                width={420}
                height={520}
              />
              <div className="team-card-social absolute top-7 left-5 flex flex-col gap-3 opacity-0 transition duration-500 ease-out">
                {socialLinks.map(({ label, icon }) => (
                  <a
                    className="grid h-10 w-11 place-items-center rounded-lg bg-white/92 text-text-dark shadow-[0_12px_24px_rgba(9,39,68,0.16)] transition hover:-translate-y-0.5 hover:bg-main-green"
                    href="#"
                    aria-label={`${name} on ${label}`}
                    key={label}
                  >
                    <SocialIcon className="h-5 w-5" name={icon} aria-hidden="true" />
                  </a>
                ))}
              </div>
              <div className="team-card-copy absolute inset-x-0 bottom-7 px-6 text-center text-white opacity-0 transition-opacity duration-500 ease-out">
                <h3 className="text-2xl leading-tight font-extrabold">{name}</h3>
                <p className="mt-1 text-sm font-semibold">{role}</p>
                <p className="mx-auto mt-3 max-w-70 text-sm leading-5 font-medium text-white/90">
                  {text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function SocialIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: SocialIconName }) {
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
