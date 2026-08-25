"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

const stories = [
  {
    quote:
      "Never going back to waiting in lines! Shop smarter, get it delivered with QuickPik. It's that simple.",
    name: "Albus Stella",
    role: "Manager @ Howarts",
    avatar: "AS",
  },
  {
    quote:
      "Wide selection, even in my small town! Found everything I needed for my birthday party with just a few clicks. Thanks, QuickPik!",
    name: "Severus Snape",
    role: "Manager @ Slytherin",
    avatar: "SS",
  },
  {
    quote:
      "Lifesaver for busy families! Fresh groceries delivered in a flash - dinner's on the table, thanks QuickPik!",
    name: "Harry Brige",
    role: "Team Leader @ Gryffindor",
    avatar: "HB",
  },
  {
    quote:
      "The assistant compared prices while I made tea. By the time I came back, the best basket was ready for review.",
    name: "Maya Collins",
    role: "Founder @ PantryCo",
    avatar: "MC",
  },
  {
    quote:
      "I asked for healthy snacks under budget and it nailed the list. Checkout still waited for my approval.",
    name: "Nina Patel",
    role: "Buyer @ FreshMart",
    avatar: "NP",
  },
  {
    quote:
      "Cross-store comparison finally feels effortless. It caught better delivery slots I would have missed.",
    name: "Ashley Daniels",
    role: "Ops Lead @ DailyCart",
    avatar: "AD",
  },
];

export function CustomerStoriesSlider() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const move = (direction: number) => {
    const slider = sliderRef.current;
    const card = slider?.querySelector("article");

    if (!slider || !card) {
      return;
    }

    const gap = 20;
    const nextLeft = slider.scrollLeft + direction * (card.clientWidth + gap);
    const atEnd = nextLeft >= slider.scrollWidth - slider.clientWidth;
    const atStart = nextLeft <= 0;

    slider.scrollTo({
      left: direction > 0 && atEnd ? 0 : direction < 0 && atStart ? slider.scrollWidth : nextLeft,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-8">
      <p className="mb-5 text-center text-sm font-extrabold text-text-dark">
        Our Actions speaks louder than WORDS
      </p>

      <div className="story-pattern bg-[#c7ffd6]">
        <div className="mx-auto grid max-w-282.5 gap-8 px-4 py-12 min-[921px]:grid-cols-[1fr_1.6fr] min-[921px]:items-start min-[921px]:px-7 min-[921px]:py-20">
          <div>
            <h2 className="m-0 max-w-110 text-[30px] leading-[1.35] font-medium text-text-dark min-[921px]:text-[38px]">
              Unlock the secrets of satisfied customers.
            </h2>
          </div>

          <div className="min-w-0">
            <div className="mb-7 flex justify-center gap-4 min-[921px]:justify-end">
              <button
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-text-dark shadow-[0_10px_24px_rgba(9,39,68,0.08)] transition hover:-translate-y-0.5 hover:bg-text-dark hover:text-white"
                onClick={() => move(-1)}
                type="button"
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-5.5 w-5.5" />
              </button>
              <button
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-0 bg-white text-text-dark shadow-[0_10px_24px_rgba(9,39,68,0.08)] transition hover:-translate-y-0.5 hover:bg-text-dark hover:text-white"
                onClick={() => move(1)}
                type="button"
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-5.5 w-5.5" />
              </button>
            </div>

            <div ref={sliderRef} className="overflow-hidden scroll-smooth">
              <div className="flex">
                {stories.map((story) => (
                  <article
                    className="mr-5 flex min-h-56 w-full shrink-0 flex-col justify-between rounded-md bg-white px-8 py-8 shadow-[0_18px_35px_rgba(9,39,68,0.08)] min-[640px]:w-[calc((100%-20px)/2)] min-[921px]:w-[calc((100%-40px)/3)]"
                    key={story.name}
                  >
                    <p className="m-0 text-base leading-7 text-[#111827]">
                      &quot;{story.quote}&quot;
                    </p>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8b26a,#704225)] text-xs font-extrabold text-white">
                        {story.avatar}
                      </div>
                      <div>
                        <strong className="block text-xs font-extrabold text-text-dark">
                          {story.name}
                        </strong>
                        <span className="mt-1 block text-[10px] font-medium text-[#416078]">
                          {story.role}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
