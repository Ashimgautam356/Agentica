import { cloudinaryImageUrl } from "@/lib/cloudinary";

type ProductImageProps = {
  imageId?: string | null;
  name: string;
  className?: string;
};

export function ProductImage({ imageId, name, className = "" }: ProductImageProps) {
  const imageUrl = cloudinaryImageUrl(imageId, "f_auto,q_auto,c_fill,w_520,h_390");

  if (imageUrl) {
    return (
      <div
        className={`bg-cover bg-center ${className}`}
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={name}
      />
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#eff4f1] ${className}`} aria-label={name}>
      <div className="absolute top-[34%] left-1/2 h-16 w-28 -translate-x-1/2 bg-[#c8d4ce] [clip-path:polygon(0_100%,35%_42%,52%_66%,70%_32%,100%_100%)]" />
      <div className="absolute top-[25%] left-[59%] h-7 w-7 rounded-full bg-[#c8d4ce]" />
    </div>
  );
}
