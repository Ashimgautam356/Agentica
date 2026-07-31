export const adminQueryKeys = {
  categories: ["categories"] as const,
  products: ["products"] as const,
  reviews: ["reviews"] as const,
  users: ["users"] as const,
  categoriesPage: (page: number) => ["categories", page] as const,
  productsPage: (page: number) => ["products", page] as const,
  reviewsPage: (page: number) => ["reviews", page] as const,
  usersPage: (page: number) => ["users", page] as const,
};
