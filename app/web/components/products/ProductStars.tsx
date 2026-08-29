type ProductStarsProps = {
  rating: number;
  reviewCount?: number;
};

export function ProductStars({ rating, reviewCount }: ProductStarsProps) {
  const rounded = Math.round(rating);

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="tracking-normal text-[#f9b115]" aria-label={`${rating.toFixed(1)} stars`}>
        {"★★★★★".slice(0, rounded)}
        <span className="text-[#d8dee3]">{"★★★★★".slice(rounded)}</span>
      </span>
      <span className="text-[#8792a1]">({reviewCount ?? rating.toFixed(1)})</span>
    </div>
  );
}
