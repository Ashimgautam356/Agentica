import { Star } from "lucide-react";

type ProductStarsProps = {
  rating: number;
  reviewCount?: number;
};

export function ProductStars({ rating, reviewCount }: ProductStarsProps) {
  const safeRating = Math.min(5, Math.max(0, rating));

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className="flex gap-0.5"
        aria-label={`${safeRating.toFixed(1)} out of 5 stars`}
        role="img"
      >
        {Array.from({ length: 5 }, (_, index) => {
          const fill = Math.min(100, Math.max(0, (safeRating - index) * 100));

          return (
            <span className="relative block size-5" key={index}>
              <Star
                aria-hidden="true"
                className="absolute inset-0 size-5 fill-[#d8dee3] text-[#d8dee3]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fill}%` }}
              >
                <Star className="size-5 max-w-none fill-[#f9b115] text-[#f9b115]" />
              </span>
            </span>
          );
        })}
      </span>
      <span className="text-[#8792a1]">({reviewCount ?? rating.toFixed(1)})</span>
    </div>
  );
}
