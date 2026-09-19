"use client";

import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { api, getApiError } from "@/lib/api";

const contactItems = [
  { label: "Email", value: "support@agentica.com", Icon: Mail },
  { label: "Phone", value: "+977 980-0000000", Icon: Phone },
  { label: "Location", value: "Kathmandu, Nepal", Icon: MapPin },
];

const contactSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(80, "Name is too long."),
  email: z.email("Enter a valid email address.").toLowerCase(),
  subject: z.string().trim().min(1, "Enter a subject.").max(120, "Subject is too long."),
  message: z.string().trim().min(1, "Enter a message.").max(2_000, "Message is too long."),
});

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = new FormData(event.currentTarget);

    const result = contactSchema.safeParse({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    });

    if (!result.success) {
      setStatus("error");
      setMessage(result.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    try {
      await api.post("/contact", result.data);
      event.currentTarget.reset();
      setStatus("sent");
      setMessage("Thanks, your message has been sent.");
    } catch (error) {
      setStatus("error");
      setMessage(getApiError(error, "Could not send your message."));
    }
  }

  return (
    <>
      <Navbar />
      <main className="bg-white text-text-dark">
        <section className="bg-[#f7faf8]">
          <div className="mx-auto grid max-w-282.5 gap-8 px-6 py-14 min-[921px]:grid-cols-[0.85fr_1.15fr] min-[921px]:px-7 min-[921px]:py-20">
            <div>
              <p className="text-sm font-extrabold uppercase text-nav-green">Contact us</p>
              <h1 className="mt-3 max-w-120 text-3xl leading-tight font-extrabold text-text-dark min-[921px]:text-5xl">
                Have a question? We would love to help.
              </h1>
              <p className="mt-5 max-w-120 text-base leading-7 font-medium text-[#526273]">
                Tell us what you need and the Agentica team will get back to you soon.
              </p>

              <div className="mt-8 grid gap-4">
                {contactItems.map(({ label, value, Icon }) => (
                  <div className="flex items-center gap-4" key={label}>
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-white text-nav-green shadow-[0_12px_28px_rgba(9,39,68,0.06)]">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold uppercase text-[#8A8172]">{label}</p>
                      <p className="mt-1 text-sm font-bold text-[#234758]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form
              className="rounded-lg border border-[#e0ebe4] bg-white p-5 shadow-[0_18px_45px_rgba(9,39,68,0.06)] min-[700px]:p-7"
              onSubmit={handleSubmit}
            >
              <div className="grid gap-4 min-[700px]:grid-cols-2">
                <Field label="Full name" name="name" placeholder="Your name" />
                <Field
                  label="Email address"
                  name="email"
                  placeholder="you@example.com"
                  type="email"
                />
              </div>

              <div className="mt-4">
                <Field label="Subject" name="subject" placeholder="How can we help?" />
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-extrabold text-text-dark">Message</span>
                <textarea
                  className="mt-2 min-h-36 w-full resize-y rounded-lg border border-[#dfe8e3] bg-[#fbfdfc] px-4 py-3 text-sm font-medium text-text-dark outline-none transition focus:border-main-green focus:bg-white focus:ring-4 focus:ring-[#35dc63]/15"
                  name="message"
                  placeholder="Write your message..."
                  required
                />
              </label>

              <button
                className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-main-green px-7 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(53,220,99,0.22)] transition hover:-translate-y-0.5 hover:bg-main-green-hover disabled:cursor-not-allowed disabled:opacity-70"
                disabled={status === "sending"}
                type="submit"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                {status === "sending" ? "Sending..." : "Send Message"}
              </button>

              {message ? (
                <p
                  className={`mt-4 text-sm font-bold ${
                    status === "error" ? "text-[#d43d2a]" : "text-nav-green"
                  }`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold text-text-dark">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-[#dfe8e3] bg-[#fbfdfc] px-4 text-sm font-medium text-text-dark outline-none transition focus:border-main-green focus:bg-white focus:ring-4 focus:ring-[#35dc63]/15"
        name={name}
        placeholder={placeholder}
        required
        type={type}
      />
    </label>
  );
}
