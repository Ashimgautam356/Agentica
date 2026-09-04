"use client";

import { ChevronLeft, ChevronRight, LockKeyhole, MessageSquareQuote, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ToastMessage } from "@/components/ToastMessage";
import { api, getApiError, type ApiResponse } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type Testimonial = {
  id: string;
  fullName: string;
  message: string;
  createdAt: string;
};

export function TestimonialForm() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [myTestimonial, setMyTestimonial] = useState<Testimonial | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!hasHydrated) return;

    let ignore = false;

    async function loadTestimonials() {
      setIsLoading(true);

      try {
        const response = await api.get<ApiResponse<Testimonial[]>>("/testimonials");
        let myTestimonial: Testimonial | null = null;

        if (customer) {
          try {
            const mine = await api.get<ApiResponse<Testimonial | null>>("/testimonials/me");
            myTestimonial = mine.data.data;
          } catch {
            // Public testimonials should still render if the saved session has expired.
          }
        }

        if (!ignore) {
          setTestimonials(response.data.data);
          setMyTestimonial(myTestimonial);
        }
      } catch (error) {
        if (!ignore) setError(getApiError(error, "Could not load testimonials."));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    void loadTestimonials();
    return () => {
      ignore = true;
    };
  }, [customer, hasHydrated]);

  useEffect(() => {
    if (testimonials.length < 2) return;

    const timer = window.setInterval(() => {
      setActiveTestimonial((current) => (current + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  function startTestimonial() {
    if (!customer) {
      router.push("/login");
    } else if (!customer.emailVerifiedAt) {
      router.push("/verify-email");
    }
  }

  async function submitTestimonial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = String(new FormData(form).get("message") ?? "").trim();

    if (!message) {
      setError("Enter your testimonial.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post<ApiResponse<Testimonial>>("/testimonials", { message });
      form.reset();
      setMyTestimonial(response.data.data);
      setTestimonials((current) => [response.data.data, ...current]);
      setActiveTestimonial(0);
      setToast("Thank you. Your testimonial has been submitted.");
    } catch (error) {
      setError(getApiError(error, "Could not submit your testimonial."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-282.5 px-6 py-14 min-[921px]:px-7 min-[921px]:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-main-green/12 text-nav-green">
            <MessageSquareQuote className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-5 text-xs font-extrabold uppercase tracking-wider text-nav-green">
            Testimonial
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-text-dark">
            Tell us about your Agentica experience
          </h2>
          <p className="mt-3 text-sm leading-6 font-medium text-[#687487]">
            Your feedback helps us make shopping simpler and more useful for everyone.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#dfe8e3] bg-[#f8fbf9] p-5 shadow-[0_18px_45px_rgba(9,39,68,0.06)] min-[700px]:p-7">
          {!hasHydrated || isLoading ? (
            <div className="h-40 animate-pulse rounded-xl bg-[#eaf1ed]" />
          ) : myTestimonial ? (
            <div className="flex min-h-32 flex-col items-center justify-center text-center">
              <span className="grid size-10 place-items-center rounded-full bg-main-green/15 text-nav-green">
                <MessageSquareQuote className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 font-extrabold text-text-dark">Your testimonial has been shared</p>
              <p className="mt-1 text-sm font-medium text-[#687487]">
                You can explore what other customers are saying below.
              </p>
            </div>
          ) : customer?.emailVerifiedAt ? (
            <form onSubmit={submitTestimonial}>
              <p className="text-sm font-bold text-[#526273]">
                Posting as {[customer.firstName, customer.lastName].filter(Boolean).join(" ")} ·{" "}
                {customer.email}
              </p>
              <label className="mt-4 block">
                <span className="text-sm font-extrabold text-text-dark">Your message</span>
                <textarea
                  className="mt-2 min-h-36 w-full resize-y rounded-xl border border-[#dfe8e3] bg-white px-4 py-3 text-sm leading-6 text-text-dark outline-none focus:border-main-green focus:ring-4 focus:ring-main-green/15"
                  maxLength={2000}
                  name="message"
                  placeholder="Share your experience with Agentica..."
                  required
                />
              </label>
              {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}
              <button
                className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-main-green px-6 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(53,220,99,0.2)] hover:bg-main-green-hover disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                <Send className="size-4" aria-hidden="true" />
                {isSubmitting ? "Submitting..." : "Submit testimonial"}
              </button>
            </form>
          ) : (
            <button
              className="group flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#b9c9c0] bg-white px-6 text-center transition hover:border-main-green hover:bg-main-green/5"
              onClick={startTestimonial}
              type="button"
            >
              <LockKeyhole
                className="size-7 text-[#7d8b83] group-hover:text-nav-green"
                aria-hidden="true"
              />
              <span className="mt-3 font-extrabold text-text-dark">Enter your testimonial</span>
              <span className="mt-1 text-sm font-medium text-[#687487]">
                {customer
                  ? "Verify your email to share your message."
                  : "Sign in to share your message."}
              </span>
            </button>
          )}
        </div>

        {testimonials.length > 0 ? (
          <div className="mx-auto mt-10 max-w-3xl">
            <div className="overflow-hidden rounded-2xl bg-text-dark shadow-[0_24px_60px_rgba(9,39,68,0.2)]">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <article
                    className="flex min-h-64 w-full shrink-0 flex-col items-center justify-center px-8 py-10 text-center text-white min-[700px]:px-16"
                    key={testimonial.id}
                  >
                    <MessageSquareQuote className="size-9 text-main-green" aria-hidden="true" />
                    <blockquote className="mt-5 max-w-xl text-lg leading-8 font-semibold">
                      &ldquo;{testimonial.message}&rdquo;
                    </blockquote>
                    <p className="mt-6 font-extrabold text-main-green">{testimonial.fullName}</p>
                    <time className="mt-1 text-xs font-medium text-white/55">
                      {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                  </article>
                ))}
              </div>
            </div>

            {testimonials.length > 1 ? (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  aria-label="Previous testimonial"
                  className="grid size-10 place-items-center rounded-full border border-[#dfe8e3] bg-white text-text-dark shadow-sm hover:border-main-green hover:text-nav-green"
                  onClick={() =>
                    setActiveTestimonial(
                      (current) => (current - 1 + testimonials.length) % testimonials.length,
                    )
                  }
                  type="button"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="flex gap-2" aria-label="Testimonial pagination">
                  {testimonials.map((testimonial, index) => (
                    <button
                      aria-label={`Show testimonial ${index + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        index === activeTestimonial ? "w-6 bg-main-green" : "w-2 bg-[#c9d5ce]"
                      }`}
                      key={testimonial.id}
                      onClick={() => setActiveTestimonial(index)}
                      type="button"
                    />
                  ))}
                </div>
                <button
                  aria-label="Next testimonial"
                  className="grid size-10 place-items-center rounded-full border border-[#dfe8e3] bg-white text-text-dark shadow-sm hover:border-main-green hover:text-nav-green"
                  onClick={() =>
                    setActiveTestimonial((current) => (current + 1) % testimonials.length)
                  }
                  type="button"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {toast ? <ToastMessage message={toast} onClose={() => setToast("")} tone="success" /> : null}
    </section>
  );
}
