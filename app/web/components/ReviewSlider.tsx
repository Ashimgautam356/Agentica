"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const reviews = [
  {
    name: "Ashley Daniels",
    quote: "Saved me tons of time - never going back to grocery shopping!",
  },
  {
    name: "Maya Collins",
    quote: "The recommendations feel personal and checkout is unbelievably fast.",
  },
  {
    name: "Nina Patel",
    quote: "I found everything from one search and had it ordered in minutes.",
  },
];

export function ReviewSlider() {
  const [activeReview, setActiveReview] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveReview((current) => (current + 1) % reviews.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="absolute right-7 bottom-0 z-90 w-60 max-w-[calc(100vw-76px)] min-[921px]:right-29.5 min-[921px]:bottom-17.75 min-[921px]:w-94.5 min-[921px]:max-w-[78%]">
      <div className="overflow-hidden rounded-2.5 border border-[#e8e8e8] bg-white shadow-[0_14px_25px_rgba(9,39,68,0.08)] min-[921px]:border-0 min-[921px]:shadow-[0_20px_35px_rgba(9,39,68,0.14)]">
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeReview * 100}%)` }}
        >
          {reviews.map((review) => (
            <article
              className="grid min-h-12.75 w-full shrink-0 grid-cols-[48px_1fr] items-center gap-3 px-3.25 py-1.75 min-[921px]:min-h-22.75 min-[921px]:grid-cols-[58px_1fr] min-[921px]:gap-4.5 min-[921px]:px-6.5 min-[921px]:py-2.75"
              key={review.name}
            >
              <Image
                className="h-9.5 w-9.5 rounded-full object-cover object-[50%_9%] min-[921px]:h-14.5 min-[921px]:w-14.5"
                src="/review-girl.jpg"
                alt={review.name}
                width={58}
                height={58}
              />
              <div>
                <strong className="mb-1 block text-[10px] font-bold text-[#151515] min-[921px]:mb-1.5 min-[921px]:text-[13px]">
                  {review.name}
                </strong>
                <p className="line-clamp-2 m-0 overflow-hidden text-[9px] leading-[1.25] font-normal text-[#8490a0] min-[921px]:line-clamp-none min-[921px]:text-[13px] min-[921px]:leading-[1.3] min-[921px]:text-[#666666]">
                  &quot;{review.quote}&quot;
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-1.5 flex justify-center gap-2.5" aria-hidden="true">
        {reviews.map((review, index) => (
          <span
            className={`h-1.5 w-1.5 rounded-full transition ${
              index === activeReview ? "bg-[#35dc63]" : "bg-[#8af0a6] opacity-60"
            }`}
            key={review.name}
          />
        ))}
      </div>
    </div>
  );
}
