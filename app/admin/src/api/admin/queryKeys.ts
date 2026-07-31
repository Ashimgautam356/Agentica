export const adminQueryKeys = {
  currentAdmin: ["currentAdmin"] as const,
  categories: ["categories"] as const,
  products: ["products"] as const,
  reviews: ["reviews"] as const,
  customers: ["customers"] as const,
  admins: ["admins"] as const,
  categoriesPage: (page: number) => ["categories", page] as const,
  productsPage: (page: number) => ["products", page] as const,
  reviewsPage: (page: number) => ["reviews", page] as const,
  customersPage: (page: number) => ["customers", page] as const,
  adminsPage: (page: number) => ["admins", page] as const,
};
