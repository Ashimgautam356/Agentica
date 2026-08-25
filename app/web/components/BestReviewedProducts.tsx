const products = [
  {
    badge: "TOP RATED",
    name: "Organic Basmati Rice 5kg",
    reviews: "326",
    price: "Rs 850",
  },
  {
    badge: "BESTSELLER",
    name: "Elegant Perfume 50ml",
    reviews: "214",
    price: "Rs 1,499",
  },
  {
    badge: "TOP RATED",
    name: "Ceramic Dinner Set 12pc",
    reviews: "178",
    price: "Rs 2,100",
  },
  {
    badge: "MOST LOVED",
    name: "Breathable Face Mask",
    reviews: "512",
    price: "Rs 250",
  },
];

function ProductImagePlaceholder() {
  return (
    <div className="relative h-48 overflow-hidden rounded-3 bg-[#f0f4f1] min-[921px]:h-36">
      <div className="absolute top-10 left-1/2 h-10 w-18 -translate-x-1/2 bg-[#c7d2cc] [clip-path:polygon(0_100%,35%_45%,52%_68%,70%_35%,100%_100%)]" />
      <div className="absolute top-7 left-[60%] h-5 w-5 rounded-full bg-[#c7d2cc]" />
    </div>
  );
}

export function BestReviewedProducts() {
  return (
    <section className="mx-auto max-w-282.5 px-4 py-12 min-[921px]:px-7 min-[921px]:py-16">
      <div className="text-center">
        <h2 className="m-0 text-[26px] leading-[1.1] font-extrabold text-[#1f2937] min-[921px]:text-[34px]">
          Best Reviewed Products
        </h2>
        <p className="mt-2 mb-0 text-xs text-[#7a8493] min-[921px]:text-sm">
          Rated highest by real customers - curated and cross-checked by our AI.
        </p>
      </div>

      <div className="mt-8 grid gap-4 min-[640px]:grid-cols-2 min-[921px]:grid-cols-4 min-[921px]:gap-6">
        {products.map((product) => (
          <article
            className="rounded-md border border-[#dfe5e2] bg-white p-3 shadow-[0_8px_20px_rgba(9,39,68,0.04)]"
            key={product.name}
          >
            <div className="relative">
              <ProductImagePlaceholder />
              <span className="absolute top-2 left-2 rounded-full bg-[#ff654a] px-2 py-1 text-[8px] font-extrabold text-white">
                {product.badge}
              </span>
            </div>

            <h3 className="mt-4 mb-0 text-sm leading-tight font-extrabold text-[#111827]">
              {product.name}
            </h3>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-[#ffb020]">★★★★★</span>
              <span className="text-[#7b8794]">({product.reviews})</span>
            </div>
            <p className="mt-2 mb-0 text-base font-extrabold text-[#16a34a]">{product.price}</p>

            <button
              className="mt-5 flex h-8 w-full cursor-pointer items-center justify-center rounded-md border-0 bg-[#e8f8ed] text-xs font-extrabold text-[#16a34a] transition hover:bg-main-green hover:text-white"
              type="button"
            >
              Add to Cart
            </button>
          </article>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <a
          className="inline-flex h-10 min-w-39 items-center justify-center rounded-md border border-main-green px-6 text-sm font-extrabold text-[#16a34a] transition hover:bg-main-green hover:text-white"
          href="#"
        >
          View All Reviews
        </a>
      </div>
    </section>
  );
}
