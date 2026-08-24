import Image from "next/image";
import { ReviewSlider } from "./ReviewSlider";

const features = [
  {
    title: "AI-Powered Search",
    text: "Natural language shopping",
    color: "stroke-[#3867ff]",
    icon: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
  },
  {
    title: "Smart Recommendations",
    text: "Personalized for you",
    color: "stroke-[#9747ff]",
    icon: (
      <>
        <path d="M12 3.5 14.3 9l5.7.8-4.1 4 1 5.7-4.9-2.7-4.9 2.7 1-5.7-4.1-4L9.7 9 12 3.5Z" />
        <path d="m18.5 3.5 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
      </>
    ),
  },
  {
    title: "Secure Checkout",
    text: "Safe & protected",
    color: "stroke-[#3867ff]",
    icon: (
      <>
        <path d="M12 21s7-3.5 7-10V5.5L12 3 5 5.5V11c0 6.5 7 10 7 10Z" />
        <path d="m9.5 12 1.8 1.8 3.7-4" />
      </>
    ),
  },
  {
    title: "Fast Delivery",
    text: "Quick & reliable",
    color: "stroke-[#3867ff]",
    icon: (
      <>
        <path d="M3 7h11v9H3z" />
        <path d="M14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="18" cy="18" r="1.6" />
      </>
    ),
  },
];

export function LandingPage() {
  return (
    <main className="relative z-20 overflow-visible bg-white max-[920px]:overflow-x-hidden">
      <section
        className="mx-auto flex max-w-282.5 flex-col-reverse gap-0 px-4 pt-0 pb-3 min-[921px]:grid min-[921px]:min-h-118 min-[921px]:grid-cols-[minmax(390px,0.82fr)_minmax(500px,1fr)] min-[921px]:items-center min-[921px]:gap-10 min-[921px]:px-7 min-[921px]:pt-12 min-[921px]:pb-0"
        aria-labelledby="hero-title"
      >
        <div className="relative z-5 mx-auto -mt-0.75 w-full max-w-105 min-[921px]:mx-0 min-[921px]:mt-0 min-[921px]:max-w-none">
          <p className="absolute -top-72 left-0 z-8 w-33 rounded-full bg-[#eaffef] px-3 py-1.25 text-[10px] font-extrabold text-[#08b836] min-[921px]:static min-[921px]:mb-4.25 min-[921px]:w-86.75 min-[921px]:max-w-full min-[921px]:bg-gradient-to-r min-[921px]:from-[#f0fff3] min-[921px]:to-[rgba(240,255,243,0.3)] min-[921px]:px-4.25 min-[921px]:py-1.75 min-[921px]:text-sm min-[921px]:font-medium min-[921px]:text-[#092744]">
            30% Off on groceries
          </p>
          <h1
            className="m-0 text-[19px] leading-[1.08] font-extrabold tracking-normal text-[#092744] min-[921px]:text-[clamp(54px,5.4vw,66px)] min-[921px]:leading-[1.2] min-[921px]:font-semibold"
            id="hero-title"
          >
            Shop smarter,
            <br />
            not harder.
            <span className="mt-px block text-[31px] leading-[1.05] text-[#ff654a] min-[921px]:mt-0 min-[921px]:text-[clamp(54px,5.4vw,66px)] min-[921px]:leading-[1.2] min-[921px]:text-[#ff334c]">
              Get it ordered.
            </span>
          </h1>
          <p className="mt-1.75 mb-2.5 w-45 text-[11px] leading-[1.18] font-normal text-[#89909d] min-[921px]:mt-3.75 min-[921px]:mb-9.25 min-[921px]:max-w-112 min-[921px]:text-lg min-[921px]:leading-[1.35] min-[921px]:text-[#121212]">
            Save time, skip the lines. We&apos;ve got you covered.
          </p>
          <a
            className="inline-flex min-h-6.25 min-w-22 items-center justify-center rounded-md bg-[#35dc63] px-4 py-2 text-[11px] font-bold text-white shadow-[0_12px_22px_rgba(53,220,99,0.22)] transition hover:-translate-y-0.5 hover:bg-[#2ed65b] hover:shadow-[0_16px_28px_rgba(53,220,99,0.28)] min-[921px]:min-h-9.5 min-[921px]:min-w-33 min-[921px]:rounded-1.75 min-[921px]:px-6 min-[921px]:py-3 min-[921px]:text-[15px]"
            href="#"
          >
            ShopNow
          </a>
        </div>

        <div
          className="relative mx-auto mt-0.75 min-h-83.25 w-full max-w-95 min-[921px]:mt-0 min-[921px]:min-h-116 min-[921px]:max-w-none"
          aria-label="Happy shopper"
        >
          <Image
            className="absolute right-3.25 bottom-1.25 h-auto w-76.5 max-w-[92vw] min-[921px]:right-2.5 min-[921px]:bottom-14 min-[921px]:w-full min-[921px]:max-w-146.5"
            src="/Green-Ellipse.png"
            alt=""
            width={586}
            height={413}
            priority
          />
          <Image
            className="absolute top-0.75 right-3.5 z-80 h-auto w-73.5 max-w-[84vw] scale-125 min-[921px]:-top-40 min-[921px]:right-21.5 min-[921px]:w-[86%] min-[921px]:max-w-120"
            src="/smiling-girl-landing-page.png"
            alt="Smiling woman holding shopping bags"
            width={657}
            height={494}
            priority
          />

          <ReviewSlider />
        </div>
      </section>

      <section
        className="mx-auto mt-8 grid max-w-105 grid-cols-4 gap-2.25 border-b-0 px-1.5 pt-2.75 pb-0 min-[921px]:mt-10 min-[921px]:max-w-269.25 min-[921px]:gap-10.5 min-[921px]:border-b min-[921px]:border-[#e6e6e6] min-[921px]:px-0 min-[921px]:pt-2.25 min-[921px]:pb-6.25"
        aria-label="Agentica benefits"
      >
        {features.map((feature) => (
          <article
            className="group grid grid-cols-1 gap-0.75 min-[921px]:grid-cols-[41px_1fr] min-[921px]:items-start min-[921px]:gap-3.75"
            key={feature.title}
          >
            <div className="inline-flex h-3.75 w-3.75 items-center justify-center rounded bg-[#edf6f9] transition duration-300 group-hover:-translate-y-1 group-hover:bg-[#dfffea] group-hover:shadow-[0_10px_20px_rgba(53,220,99,0.2)] min-[921px]:h-10.25 min-[921px]:w-10.25 min-[921px]:rounded-2.25">
              <svg
                className={`h-2.5 w-2.5 fill-none stroke-2 min-[921px]:h-5.5 min-[921px]:w-5.5 ${feature.color} [stroke-linecap:round] [stroke-linejoin:round]`}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                {feature.icon}
              </svg>
            </div>
            <div>
              <h2 className="m-0 text-[6px] leading-[1.18] font-extrabold text-[#092744] min-[921px]:mt-0.75 min-[921px]:mb-1.5 min-[921px]:text-[15px] min-[921px]:leading-[1.25]">
                {feature.title}
              </h2>
              <p className="m-0 text-[5px] leading-[1.25] font-normal text-[#708191] min-[921px]:text-[13px] min-[921px]:leading-[1.35]">
                {feature.text}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
