import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/components/products/types";

// ─── Helpers ──────────────────────────────────────────────────────────

function mockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "prod-1",
    name: "Organic Basmati Rice 5kg",
    imageId: "products/rice",
    description: "Premium organic rice",
    price: 850,
    tags: ["organic", "rice"],
    categoryId: "cat-1",
    averageRating: 4.3,
    reviewCount: 126,
    ...overrides,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. lib/api.ts — Axios instance & getApiError helper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("lib/api", () => {
  describe("getApiError", () => {
    it("extracts a nested Axios error message", async () => {
      const { getApiError } = await import("@/lib/api");
      const fakeAxiosError = {
        isAxiosError: true,
        response: { data: { error: { message: "Email already exists." } } },
        message: "Request failed with status code 409",
      };

      // Patch axios.isAxiosError so it recognises our fake object
      const axios = await import("axios");
      vi.spyOn(axios.default, "isAxiosError").mockReturnValue(true);

      expect(getApiError(fakeAxiosError)).toBe("Email already exists.");
    });

    it("falls back to the generic message for non-Axios errors", async () => {
      const { getApiError } = await import("@/lib/api");
      const axios = await import("axios");
      vi.spyOn(axios.default, "isAxiosError").mockReturnValue(false);

      expect(getApiError(new Error("Network failure"))).toBe("Network failure");
    });

    it("uses the fallback string for unknown error shapes", async () => {
      const { getApiError } = await import("@/lib/api");
      const axios = await import("axios");
      vi.spyOn(axios.default, "isAxiosError").mockReturnValue(false);

      expect(getApiError("something weird", "Oops")).toBe("Oops");
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. lib/cloudinary.ts — Image URL builder
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("cloudinaryImageUrl", () => {
  let cloudinaryImageUrl: (typeof import("@/lib/cloudinary"))["cloudinaryImageUrl"];

  beforeEach(async () => {
    vi.resetModules();
  });

  it("returns empty string for null / undefined publicId", async () => {
    ({ cloudinaryImageUrl } = await import("@/lib/cloudinary"));
    expect(cloudinaryImageUrl(null)).toBe("");
    expect(cloudinaryImageUrl(undefined)).toBe("");
  });

  it("passes through absolute URLs unchanged", async () => {
    ({ cloudinaryImageUrl } = await import("@/lib/cloudinary"));
    expect(cloudinaryImageUrl("https://example.com/img.jpg")).toBe("https://example.com/img.jpg");
    expect(cloudinaryImageUrl("/local/img.jpg")).toBe("/local/img.jpg");
  });

  it("returns empty string when cloud name env var is missing", async () => {
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_CLOUD_NAME;
    ({ cloudinaryImageUrl } = await import("@/lib/cloudinary"));
    expect(cloudinaryImageUrl("products/rice")).toBe("");
  });

  it("builds a Cloudinary URL with default transformation", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    ({ cloudinaryImageUrl } = await import("@/lib/cloudinary"));
    const url = cloudinaryImageUrl("products/rice");
    expect(url).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_96,h_96/products/rice",
    );
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  });

  it("applies a custom transformation", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    ({ cloudinaryImageUrl } = await import("@/lib/cloudinary"));
    const url = cloudinaryImageUrl("products/rice", "w_400,h_300");
    expect(url).toContain("w_400,h_300/products/rice");
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. stores/cart-store.ts — Cart state management
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("cart-store", () => {
  let useCartStore: (typeof import("@/stores/cart-store"))["useCartStore"];
  let cartItemCount: (typeof import("@/stores/cart-store"))["cartItemCount"];
  let cartTotal: (typeof import("@/stores/cart-store"))["cartTotal"];

  beforeEach(async () => {
    vi.resetModules();
    window.localStorage.clear();
    ({ useCartStore, cartItemCount, cartTotal } = await import("@/stores/cart-store"));
  });

  describe("cartItemCount()", () => {
    it("sums quantities across all items", () => {
      const items = [
        { productId: "1", name: "A", imageId: "a", price: 100, quantity: 2 },
        { productId: "2", name: "B", imageId: "b", price: 200, quantity: 3 },
      ];
      expect(cartItemCount(items)).toBe(5);
    });

    it("returns 0 for an empty array", () => {
      expect(cartItemCount([])).toBe(0);
    });
  });

  describe("cartTotal()", () => {
    it("calculates price × quantity totals", () => {
      const items = [
        { productId: "1", name: "A", imageId: "a", price: 100, quantity: 2 },
        { productId: "2", name: "B", imageId: "b", price: 50, quantity: 4 },
      ];
      expect(cartTotal(items)).toBe(400);
    });
  });

  describe("addItem()", () => {
    it("adds a new product to the cart", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].productId).toBe("prod-1");
      expect(items[0].quantity).toBe(1);
    });

    it("increments quantity when the same product is added again", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product);
      useCartStore.getState().addItem(product);

      const items = useCartStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].quantity).toBe(2);
    });

    it("adds with a custom quantity", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product, 5);

      expect(useCartStore.getState().items[0].quantity).toBe(5);
    });

    it("clamps negative quantity to 1", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product, -3);

      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe("removeItem()", () => {
    it("removes a product by id", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product);
      useCartStore.getState().removeItem("prod-1");

      expect(useCartStore.getState().items).toHaveLength(0);
    });

    it("does nothing when id is not found", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product);
      useCartStore.getState().removeItem("prod-999");

      expect(useCartStore.getState().items).toHaveLength(1);
    });
  });

  describe("updateQuantity()", () => {
    it("updates quantity for an existing item", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product);
      useCartStore.getState().updateQuantity("prod-1", 10);

      expect(useCartStore.getState().items[0].quantity).toBe(10);
    });

    it("clamps quantity to minimum of 1", () => {
      const product = mockProduct();
      useCartStore.getState().addItem(product, 5);
      useCartStore.getState().updateQuantity("prod-1", 0);

      expect(useCartStore.getState().items[0].quantity).toBe(1);
    });
  });

  describe("clearCart()", () => {
    it("removes all items", () => {
      useCartStore.getState().addItem(mockProduct());
      useCartStore.getState().addItem(mockProduct({ id: "prod-2", name: "B" }));
      useCartStore.getState().clearCart();

      expect(useCartStore.getState().items).toHaveLength(0);
    });
  });

  describe("hydrate()", () => {
    it("loads items from localStorage and sets hasHydrated", () => {
      const stored = [{ productId: "prod-1", name: "A", imageId: "a", price: 100, quantity: 2 }];
      window.localStorage.setItem("agentica_cart", JSON.stringify(stored));

      useCartStore.getState().hydrate();

      const state = useCartStore.getState();
      expect(state.hasHydrated).toBe(true);
      expect(state.items).toEqual(stored);
    });

    it("returns empty array when localStorage is empty", () => {
      useCartStore.getState().hydrate();
      expect(useCartStore.getState().items).toEqual([]);
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. components/products/ProductStars.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductStars", () => {
  it("renders the correct number of filled and empty stars", async () => {
    const { ProductStars } = await import("@/components/products/ProductStars");
    render(<ProductStars rating={3.7} />);

    const starContainer = screen.getByLabelText("3.7 stars");
    // 3.7 rounds to 4 → "★★★★" filled, "★" empty
    expect(starContainer.textContent).toContain("★★★★");
  });

  it("displays the review count when provided", async () => {
    const { ProductStars } = await import("@/components/products/ProductStars");
    render(<ProductStars rating={4} reviewCount={42} />);

    expect(screen.getByText("(42)")).toBeInTheDocument();
  });

  it("displays the rating when review count is omitted", async () => {
    const { ProductStars } = await import("@/components/products/ProductStars");
    render(<ProductStars rating={4.5} />);

    expect(screen.getByText("(4.5)")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. components/products/ProductCard.tsx — formatPrice helper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("formatPrice", () => {
  it("formats numeric prices with locale grouping", async () => {
    const { formatPrice } = await import("@/components/products/ProductCard");
    expect(formatPrice(1499)).toBe("1,499");
  });

  it("handles string prices", async () => {
    const { formatPrice } = await import("@/components/products/ProductCard");
    expect(formatPrice("2100")).toBe("2,100");
  });

  it("handles zero", async () => {
    const { formatPrice } = await import("@/components/products/ProductCard");
    expect(formatPrice(0)).toBe("0");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. components/products/ProductGrid.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductGrid", () => {
  it("shows loading skeletons when isLoading is true", async () => {
    const { ProductGrid } = await import("@/components/products/ProductGrid");
    const { container } = render(<ProductGrid products={[]} isLoading={true} />);

    // 8 skeleton cards
    const skeletons = container.querySelectorAll("[class*='bg-\\[\\#eef4f1\\]']");
    expect(skeletons.length).toBeGreaterThanOrEqual(8);
  });

  it("shows an empty state when products is empty and not loading", async () => {
    const { ProductGrid } = await import("@/components/products/ProductGrid");
    render(<ProductGrid products={[]} isLoading={false} />);

    expect(
      screen.getByText("No products match the current search and filters."),
    ).toBeInTheDocument();
  });

  it("renders a ProductCard for each product", async () => {
    const { ProductGrid } = await import("@/components/products/ProductGrid");
    const products = [
      mockProduct({ id: "1", name: "Rice" }),
      mockProduct({ id: "2", name: "Flour" }),
    ];

    render(<ProductGrid products={products} isLoading={false} />);

    expect(screen.getByText("Rice")).toBeInTheDocument();
    expect(screen.getByText("Flour")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 7. components/products/ProductBreadcrumb.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductBreadcrumb", () => {
  it("renders Home → current when no parent link is provided", async () => {
    const { ProductBreadcrumb } = await import("@/components/products/ProductBreadcrumb");
    render(<ProductBreadcrumb current="Organic Rice" />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText(/Organic Rice/)).toBeInTheDocument();
  });

  it("renders Home → parent → current when parentHref is provided", async () => {
    const { ProductBreadcrumb } = await import("@/components/products/ProductBreadcrumb");
    render(
      <ProductBreadcrumb
        current="Organic Rice"
        parentLabel="Groceries"
        parentHref="/products?category=groceries"
      />,
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText(/Organic Rice/)).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 8. components/products/ProductImage.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductImage", () => {
  it("renders a placeholder when imageId is missing", async () => {
    const { ProductImage } = await import("@/components/products/ProductImage");
    render(<ProductImage name="Rice" />);

    expect(screen.getByLabelText("Rice")).toBeInTheDocument();
  });

  it("renders an image background when imageId + cloud name are available", async () => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
    vi.resetModules();
    const { ProductImage } = await import("@/components/products/ProductImage");
    const { container } = render(<ProductImage imageId="products/rice" name="Rice" />);

    const div = container.querySelector("[role='img']");
    expect(div).toBeInTheDocument();
    expect(div?.getAttribute("aria-label")).toBe("Rice");
    delete process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 9. components/products/ProductPagination.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductPagination", () => {
  it("renders nothing when totalPages ≤ 1", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    const { container } = render(
      <ProductPagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders page buttons equal to totalPages", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    render(<ProductPagination page={1} totalPages={5} onPageChange={vi.fn()} />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i))).toBeInTheDocument();
    }
  });

  it("disables Previous button on the first page", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    render(<ProductPagination page={1} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables Next button on the last page", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    render(<ProductPagination page={3} totalPages={3} onPageChange={vi.fn()} />);

    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("calls onPageChange when a page button is clicked", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<ProductPagination page={1} totalPages={5} onPageChange={onPageChange} />);

    await user.click(screen.getByText("3"));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("marks the current page with aria-current", async () => {
    const { ProductPagination } = await import("@/components/products/ProductPagination");
    render(<ProductPagination page={2} totalPages={4} onPageChange={vi.fn()} />);

    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("1")).not.toHaveAttribute("aria-current");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 10. components/ProductSearchBar.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ProductSearchBar", () => {
  it("renders a category select with 'All Categories' default", async () => {
    const { ProductSearchBar } = await import("@/components/ProductSearchBar");
    render(<ProductSearchBar categories={[]} />);

    const select = screen.getByLabelText("Category") as HTMLSelectElement;
    expect(select.value).toBe("");
    expect(screen.getByText("All Categories")).toBeInTheDocument();
  });

  it("renders category options", async () => {
    const { ProductSearchBar } = await import("@/components/ProductSearchBar");
    const categories = [
      { id: "cat-1", name: "Groceries", imageId: null },
      { id: "cat-2", name: "Electronics", imageId: null },
    ];
    render(<ProductSearchBar categories={categories} />);

    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });

  it("fires onCategoryChange when selection changes", async () => {
    const { ProductSearchBar } = await import("@/components/ProductSearchBar");
    const user = userEvent.setup();
    const onCategoryChange = vi.fn();
    const categories = [{ id: "cat-1", name: "Groceries", imageId: null }];

    render(<ProductSearchBar categories={categories} onCategoryChange={onCategoryChange} />);

    await user.selectOptions(screen.getByLabelText("Category"), "cat-1");
    expect(onCategoryChange).toHaveBeenCalledWith("cat-1");
  });

  it("fires onSearchChange on form submit", async () => {
    const { ProductSearchBar } = await import("@/components/ProductSearchBar");
    const user = userEvent.setup();
    const onSearchChange = vi.fn();

    render(<ProductSearchBar categories={[]} onSearchChange={onSearchChange} />);

    const input = screen.getByLabelText("Search products");
    await user.type(input, "organic rice");
    await user.click(screen.getByLabelText("Search"));

    expect(onSearchChange).toHaveBeenCalledWith("organic rice");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 11. components/ToastMessage.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ToastMessage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays the message text", async () => {
    const { ToastMessage } = await import("@/components/ToastMessage");
    render(<ToastMessage message="Item added!" onClose={vi.fn()} />);

    expect(screen.getByText("Item added!")).toBeInTheDocument();
  });

  it("auto-closes after 2500 ms", async () => {
    const { ToastMessage } = await import("@/components/ToastMessage");
    const onClose = vi.fn();
    render(<ToastMessage message="Done" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2500);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when the X button is clicked", async () => {
    const { ToastMessage } = await import("@/components/ToastMessage");
    const onClose = vi.fn();

    render(<ToastMessage message="Bye" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("applies success styles for tone='success'", async () => {
    const { ToastMessage } = await import("@/components/ToastMessage");
    const { container } = render(<ToastMessage message="Saved" onClose={vi.fn()} tone="success" />);

    expect(container.firstElementChild?.className).toContain("border-main-green");
  });

  it("applies error styles by default", async () => {
    const { ToastMessage } = await import("@/components/ToastMessage");
    const { container } = render(<ToastMessage message="Error" onClose={vi.fn()} />);

    expect(container.firstElementChild?.className).toContain("bg-red-50");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 12. components/WhyAgentica.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("WhyAgentica", () => {
  it("renders the section heading", async () => {
    const { WhyAgentica } = await import("@/components/WhyAgentica");
    render(<WhyAgentica />);

    expect(screen.getByText("Why Agentica feels different")).toBeInTheDocument();
  });

  it("renders all three reason cards", async () => {
    const { WhyAgentica } = await import("@/components/WhyAgentica");
    render(<WhyAgentica />);

    expect(screen.getByText("Talk, don't filter")).toBeInTheDocument();
    expect(screen.getByText("Cross-store comparison")).toBeInTheDocument();
    expect(screen.getByText("Confirms before it buys")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 13. components/BestReviewedProducts.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("BestReviewedProducts", () => {
  it("renders all product names", async () => {
    const { BestReviewedProducts } = await import("@/components/BestReviewedProducts");
    render(<BestReviewedProducts />);

    expect(screen.getByText("Organic Basmati Rice 5kg")).toBeInTheDocument();
    expect(screen.getByText("Elegant Perfume 50ml")).toBeInTheDocument();
    expect(screen.getByText("Ceramic Dinner Set 12pc")).toBeInTheDocument();
    expect(screen.getByText("Breathable Face Mask")).toBeInTheDocument();
  });

  it("renders badge labels", async () => {
    const { BestReviewedProducts } = await import("@/components/BestReviewedProducts");
    render(<BestReviewedProducts />);

    expect(screen.getAllByText("TOP RATED")).toHaveLength(2);
    expect(screen.getByText("BESTSELLER")).toBeInTheDocument();
    expect(screen.getByText("MOST LOVED")).toBeInTheDocument();
  });

  it("renders 'Add to Cart' buttons for each product", async () => {
    const { BestReviewedProducts } = await import("@/components/BestReviewedProducts");
    render(<BestReviewedProducts />);

    const buttons = screen.getAllByText("Add to Cart");
    expect(buttons).toHaveLength(4);
  });

  it("renders the 'View All Reviews' link", async () => {
    const { BestReviewedProducts } = await import("@/components/BestReviewedProducts");
    render(<BestReviewedProducts />);

    expect(screen.getByText("View All Reviews")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 14. components/ExclusiveOffers.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ExclusiveOffers", () => {
  it("renders the CTA heading", async () => {
    const { ExclusiveOffers } = await import("@/components/ExclusiveOffers");
    render(<ExclusiveOffers />);

    expect(screen.getByText("SignUp For Exclusive Offers And Discounts")).toBeInTheDocument();
  });

  it("renders the Sign Up button", async () => {
    const { ExclusiveOffers } = await import("@/components/ExclusiveOffers");
    render(<ExclusiveOffers />);

    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("shows the courier image with correct alt text", async () => {
    const { ExclusiveOffers } = await import("@/components/ExclusiveOffers");
    render(<ExclusiveOffers />);

    expect(screen.getByAltText("Courier holding drinks and a clipboard")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 15. components/CustomerStoriesSlider.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("CustomerStoriesSlider", () => {
  it("renders the testimonial heading", async () => {
    const { CustomerStoriesSlider } = await import("@/components/CustomerStoriesSlider");
    render(<CustomerStoriesSlider />);

    expect(screen.getByText("Testimonial")).toBeInTheDocument();
    expect(screen.getByText("Words of praise from others about our presence")).toBeInTheDocument();
  });

  it("renders story cards (including duplicated marquee items)", async () => {
    const { CustomerStoriesSlider } = await import("@/components/CustomerStoriesSlider");
    render(<CustomerStoriesSlider />);

    // Each story appears in two rows, each duplicated → ≥ 2 occurrences
    const skylarItems = screen.getAllByText("Skylar Lipshutz");
    expect(skylarItems.length).toBeGreaterThanOrEqual(2);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 16. components/Footer.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("Footer", () => {
  it("renders the newsletter section", async () => {
    const { Footer } = await import("@/components/Footer");
    render(<Footer />);

    expect(screen.getByText(/Join our newsletter to stay up to date/)).toBeInTheDocument();
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
  });

  it("renders footer link columns", async () => {
    const { Footer } = await import("@/components/Footer");
    render(<Footer />);

    expect(screen.getByText("Sitemap")).toBeInTheDocument();
    expect(screen.getByText("Partners")).toBeInTheDocument();
    expect(screen.getByText("Services")).toBeInTheDocument();
  });

  it("renders social media links", async () => {
    const { Footer } = await import("@/components/Footer");
    render(<Footer />);

    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
    expect(screen.getByLabelText("Facebook")).toBeInTheDocument();
    expect(screen.getByLabelText("TikTok")).toBeInTheDocument();
    expect(screen.getByLabelText("WhatsApp")).toBeInTheDocument();
  });

  it("renders the Agentica logo", async () => {
    const { Footer } = await import("@/components/Footer");
    render(<Footer />);

    // Our mock renders <img> so we can query by alt text
    const logos = screen.getAllByAltText("Agentica");
    expect(logos.length).toBeGreaterThanOrEqual(1);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 17. components/LandingPage.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("LandingPage", () => {
  it("renders the hero heading", async () => {
    const { LandingPage } = await import("@/components/LandingPage");
    render(<LandingPage />);

    expect(screen.getByText(/Shop smarter/)).toBeInTheDocument();
    expect(screen.getByText("Get it ordered.")).toBeInTheDocument();
  });

  it("renders the ShopNow CTA", async () => {
    const { LandingPage } = await import("@/components/LandingPage");
    render(<LandingPage />);

    expect(screen.getByText("ShopNow")).toBeInTheDocument();
  });

  it("renders the discount banner", async () => {
    const { LandingPage } = await import("@/components/LandingPage");
    render(<LandingPage />);

    expect(screen.getByText("30% Off on groceries")).toBeInTheDocument();
  });

  it("renders all four feature cards", async () => {
    const { LandingPage } = await import("@/components/LandingPage");
    render(<LandingPage />);

    expect(screen.getByText("AI-Powered Search")).toBeInTheDocument();
    expect(screen.getByText("Smart Recommendations")).toBeInTheDocument();
    expect(screen.getByText("Secure Checkout")).toBeInTheDocument();
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument();
  });

  it("renders the hero image with alt text", async () => {
    const { LandingPage } = await import("@/components/LandingPage");
    render(<LandingPage />);

    expect(screen.getByAltText("Smiling woman holding shopping bags")).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 18. components/AuthPage.tsx — Login mode
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("AuthPage", () => {
  it("renders login mode with correct heading and CTA", async () => {
    const { AuthPage } = await import("@/components/AuthPage");
    render(<AuthPage mode="login" />);

    expect(screen.getByText("Sign in with email")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByText("Create account")).toBeInTheDocument();
  });

  it("renders signup mode with name and confirm password fields", async () => {
    const { AuthPage } = await import("@/components/AuthPage");
    render(<AuthPage mode="signup" />);

    expect(screen.getByText("Create your account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Full name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders forgot-password mode without password field", async () => {
    const { AuthPage } = await import("@/components/AuthPage");
    render(<AuthPage mode="forgot-password" />);

    expect(screen.getByText("Reset password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Password")).not.toBeInTheDocument();
    expect(screen.getByText("Send Reset Link")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const { AuthPage } = await import("@/components/AuthPage");
    const user = userEvent.setup();
    render(<AuthPage mode="login" />);

    const passwordInput = screen.getByPlaceholderText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Show password"));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByLabelText("Hide password"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("shows the Agentica logo linking home", async () => {
    const { AuthPage } = await import("@/components/AuthPage");
    render(<AuthPage mode="login" />);

    const homeLink = screen.getByLabelText("Agentica home");
    expect(homeLink).toHaveAttribute("href", "/");
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 19. components/ChatBox.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe("ChatBox", () => {
  it("renders the welcome message", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    render(<ChatBox />);

    expect(screen.getByRole("heading", { name: "Welcome to Agentica" })).toBeInTheDocument();
    expect(screen.getByText(/Tell me what you are shopping for/)).toBeInTheDocument();
  });

  it("has a disabled Send button when input is empty", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    render(<ChatBox />);

    expect(screen.getByText("Send")).toBeDisabled();
  });

  it("enables Send button when there is input", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    const user = userEvent.setup();
    render(<ChatBox />);

    await user.type(screen.getByLabelText("Chat message"), "Hello");
    expect(screen.getByText("Send")).toBeEnabled();
  });

  it("adds a user message on submit and shows 'Thinking...'", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    const user = userEvent.setup();

    // Mock fetch to hang (never resolves)
    const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal("fetch", fetchMock);

    render(<ChatBox />);

    await user.type(screen.getByLabelText("Chat message"), "show me shoes");
    await user.click(screen.getByText("Send"));

    expect(screen.getByText("show me shoes")).toBeInTheDocument();
    expect(screen.getByText("Thinking...")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("displays the API response", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    const user = userEvent.setup();

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ reply: "Here are some shoes!", tool: "search" }),
      }),
    );

    render(<ChatBox />);

    await user.type(screen.getByLabelText("Chat message"), "shoes");
    await user.click(screen.getByText("Send"));

    // Wait for the response to appear
    expect(await screen.findByText("Here are some shoes!")).toBeInTheDocument();
    expect(screen.getByText("search")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });

  it("shows an error message when fetch fails", async () => {
    const { ChatBox } = await import("@/components/ChatBox");
    const user = userEvent.setup();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    render(<ChatBox />);

    await user.type(screen.getByLabelText("Chat message"), "hello");
    await user.click(screen.getByText("Send"));

    expect(await screen.findByText("Could not reach the local chat API.")).toBeInTheDocument();

    vi.unstubAllGlobals();
  });
});
