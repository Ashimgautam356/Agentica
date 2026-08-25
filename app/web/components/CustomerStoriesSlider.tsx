const stories = [
  {
    quote:
      "Outstanding product-well-crafted, user-friendly, and exactly what I expected. The team went above and beyond to help.",
    name: "Skylar Lipshutz",
    role: "Product manager at Orbit",
    avatar: "AS",
  },
  {
    quote:
      "Excellent product-durable, intuitive, and exactly what I needed. Customer service was outstanding and very helpful.",
    name: "Paityn Lipshutz",
    role: "CEO & Co Founder at Lemonsqueezy",
    avatar: "SS",
  },
  {
    quote:
      "Top-notch quality-easy to set up and performs as promised. The support team was incredibly responsive and attentive.",
    name: "Angel Lubin",
    role: "CEO & Co Founder at Zipline",
    avatar: "HB",
  },
  {
    quote:
      "Great product-reliable, easy to set up, and just as described. Service was excellent and ensured a smooth experience.",
    name: "Chance Baptista",
    role: "CEO & Co Founder at ABC Company",
    avatar: "MC",
  },
  {
    quote:
      "Wonderful product-high quality, easy to operate, and exactly what I wanted. Support was quick and very helpful.",
    name: "Corey Franci",
    role: "sbaker@hotmail.com",
    avatar: "NP",
  },
  {
    quote:
      "Amazing build quality, simple to use, and delivered exactly as promised. Customer care was friendly and very responsive.",
    name: "Skylar Rosser",
    role: "Product manager at Orbit",
    avatar: "AD",
  },
];

const rows = [stories, [...stories].reverse()];

export function CustomerStoriesSlider() {
  return (
    <section className="mx-auto max-w-282.5 overflow-hidden bg-main-green py-14 min-[921px]:py-20">
      <div className="mx-auto max-w-282.5 px-4 text-center min-[921px]:px-7">
        <p className="mb-4 text-xs font-extrabold tracking-normal text-text-dark uppercase">
          Testimonial
        </p>
        <h2 className="mx-auto max-w-170 text-[30px] leading-[1.12] font-extrabold text-text-dark min-[921px]:text-[44px]">
          Words of praise from others about our presence
        </h2>
      </div>

      <div className="story-marquee-fade relative mt-14 space-y-6 min-[921px]:mt-24">
        {rows.map((row, rowIndex) => (
          <div className="story-marquee-row overflow-hidden" key={rowIndex}>
            <div
              className={`story-marquee-track flex w-max gap-6 ${
                rowIndex === 1 ? "story-marquee-reverse" : ""
              }`}
            >
              {[...row, ...row].map((story, index) => (
                <article
                  className="flex min-h-58 w-[min(82vw,390px)] shrink-0 flex-col justify-between rounded-[8px] bg-white px-6 py-6 shadow-[0_18px_35px_rgba(9,39,68,0.08)] min-[921px]:w-96 min-[921px]:px-8 min-[921px]:py-7"
                  key={`${story.name}-${index}`}
                >
                  <div>
                    <span className="block text-5xl leading-none font-extrabold text-[#171717]">
                      &ldquo;
                    </span>
                    <p className="mt-3 text-left text-[15px] leading-6 font-semibold text-[#7d7d7d]">
                      {story.quote}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f1f1] text-xs font-extrabold text-text-dark ring-1 ring-[#e8e8e8]">
                      {story.avatar}
                    </div>
                    <div className="text-left">
                      <strong className="block text-[15px] font-extrabold text-[#202020]">
                        {story.name}
                      </strong>
                      <span className="mt-1 block text-sm font-medium text-[#818181]">
                        {story.role}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
