export type ProductCategory = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  imageId: string;
  imageId1?: string | null;
  imageId2?: string | null;
  description: string[];
  price: string | number;
  tags: string[];
  categoryId: string;
  category?: ProductCategory;
  averageRating?: number;
  reviewCount?: number;
};

export type ProductSort = "rating-desc" | "rating-asc";
