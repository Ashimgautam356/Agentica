import Image from "next/image";
import Link from "next/link";
import { Facebook } from "./Icons/Facebook";
import { Instagram } from "./Icons/Instagram";
import { TikTok } from "./Icons/TikTok";
import { WhatsApp } from "./Icons/Whatsapp";

const sitemap = ["About Us", "Products", "Chat", "Contact"];
const partners = ["Local Stores", "Delivery Partners", "Real Estate", "Suppliers"];
const services = ["AI Product Search", "Smart Recommendations", "Secure Checkout", "Fast Delivery"];

const socialLinks = [
  {
    label: "Instagram",
    Icon: Instagram,
  },
  {
    label: "Facebook",
    Icon: Facebook,
  },
  {
    label: "TikTok",
    Icon: TikTok,
  },
  {
    label: "WhatsApp",
    Icon: WhatsApp,
  },
];

export function Footer() {
  return (
    <footer className="bg-[#f2f0f0] text-text-dark">
      <div className="mx-auto max-w-282.5 px-6 pt-12 pb-10 min-[921px]:px-7 min-[921px]:pt-20">
        <div className="grid gap-12 min-[921px]:grid-cols-[1.25fr_1fr] min-[921px]:gap-20">
          <div>
            <p className="text-sm leading-5 font-extrabold">
              Join our newsletter to stay up to date on the latest news and updates.
            </p>

            <form className="mt-6 flex max-w-131 flex-col gap-3 rounded-[34px] bg-white p-2 shadow-[0_22px_45px_rgba(9,39,68,0.06)] min-[560px]:h-16 min-[560px]:flex-row min-[560px]:items-center">
              <label className="sr-only" htmlFor="footer-email">
                Enter your email
              </label>
              <input
                className="min-h-12 flex-1 rounded-full border-0 bg-transparent px-5 text-base font-semibold text-text-dark outline-none placeholder:text-text-dark-400"
                id="footer-email"
                type="email"
                placeholder="Enter your email"
              />
              <button
                className="min-h-12 rounded-full bg-logo-orange px-8 text-sm font-semibold text-white transition hover:bg-[#d8902f]"
                type="submit"
              >
                Subscribe
              </button>
            </form>

            <p className="mt-5 max-w-140 text-xs leading-5 font-medium text-[#a8a2a2]">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from
              us.
            </p>

            <div className="mt-12 flex items-center gap-6">
              {socialLinks.map((social) => (
                <a
                  className="flex h-6 w-6 items-center justify-center rounded-full transition hover:scale-110"
                  href="#"
                  key={social.label}
                  aria-label={social.label}
                >
                  <social.Icon className="h-6 w-6" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 min-[560px]:grid-cols-3">
            <FooterLinks title="Sitemap" links={sitemap} />
            <FooterLinks title="Partners" links={partners} active="Real Estate" />
            <FooterLinks title="Services" links={services} />
          </div>
        </div>

        <Link className="mt-14 block" href="/" aria-label="Agentica home">
          <Image
            className="h-auto w-full"
            src="/agentica.svg"
            width={1132}
            height={268}
            alt="Agentica"
          />
        </Link>
      </div>
    </footer>
  );
}

function FooterLinks({
  title,
  links,
  active,
}: {
  title: string;
  links: string[];
  active?: string;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-extrabold">{title}</h2>
      <ul className="mt-7 space-y-5">
        {links.map((link) => (
          <li key={link}>
            <a
              className={`text-sm leading-5 font-semibold transition hover:text-main-green ${
                link === active ? "text-[#e75933]" : "text-[#234758]"
              }`}
              href="#"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
