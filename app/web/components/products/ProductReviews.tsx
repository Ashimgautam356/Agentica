"use client";

import { Star, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ToastMessage } from "@/components/ToastMessage";
import { api, getApiError, type ApiResponse, type Paginated } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

type ReviewSort = "rating-desc" | "rating-asc" | "newest" | "oldest";

type Review = {
  id: string;
  rating: number;
  description: string;
  createdAt: string;
  user: { id: string; firstName: string | null; lastName: string | null };
};

type ProductReviewsProps = {
  productId: string;
  onReviewCreated: () => void;
  onReviewDeleted: () => void;
};

export function ProductReviews({
  productId,
  onReviewCreated,
  onReviewDeleted,
}: ProductReviewsProps) {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState<ReviewSort>("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  useEffect(() => {
    let ignore = false;

    async function loadReviews() {
      setIsLoading(true);
      setError("");

      try {
        const response = await api.get<ApiResponse<Paginated<Review>>>(
          `/products/${productId}/reviews`,
          { params: { sort, pageSize: 100 } },
        );

        if (!ignore) {
          setReviews(response.data.data.items);
        }
      } catch (error) {
        if (!ignore) {
          setError(getApiError(error, "Could not load reviews."));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadReviews();
    return () => {
      ignore = true;
    };
  }, [productId, sort]);

  function openReviewForm() {
    if (!hasHydrated) return;

    if (!customer) {
      router.push("/login");
      return;
    }

    setError("");
    setIsModalOpen(true);
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const description = String(new FormData(form).get("description") ?? "").trim();

    if (!description) {
      setError("Enter your review.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post<ApiResponse<Review>>(`/products/${productId}/reviews`, {
        rating,
        description,
      });
      setReviews((current) => [response.data.data, ...current]);
      setSort("newest");
      onReviewCreated();
      form.reset();
      setRating(5);
      setIsModalOpen(false);
      setToastTone("success");
      setToast("Thank you. Your review has been published.");
    } catch (error) {
      setError(getApiError(error, "Could not publish your review."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteReview(review: Review) {
    if (!window.confirm("Delete your review? This cannot be undone.")) return;

    setDeletingReviewId(review.id);

    try {
      await api.delete(`/products/${productId}/reviews/${review.id}`);
      setReviews((current) => current.filter((item) => item.id !== review.id));
      onReviewDeleted();
      setToastTone("success");
      setToast("Your review has been deleted.");
    } catch (error) {
      setToastTone("error");
      setToast(getApiError(error, "Could not delete your review."));
    } finally {
      setDeletingReviewId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <select
          aria-label="Sort reviews"
          className="h-10 rounded-md border border-[#dfe6e3] bg-white px-3 text-sm font-bold text-text-dark outline-none focus:border-main-green"
          onChange={(event) => setSort(event.target.value as ReviewSort)}
          value={sort}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="rating-desc">Highest rated</option>
          <option value="rating-asc">Lowest rated</option>
        </select>
        <button
          className="h-10 rounded-md bg-main-green px-5 text-sm font-extrabold text-white transition hover:bg-main-green-hover disabled:opacity-60"
          disabled={!hasHydrated}
          onClick={openReviewForm}
          type="button"
        >
          Give a review
        </button>
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3">
          <div className="h-24 animate-pulse rounded-lg bg-[#eef4f1]" />
          <div className="h-24 animate-pulse rounded-lg bg-[#eef4f1]" />
        </div>
      ) : error && !isModalOpen ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : reviews.length === 0 ? (
        <p className="mt-5 text-sm font-semibold text-[#708096]">
          No reviews yet. Be the first to review this product.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {reviews.map((review) => {
            const name = [review.user.firstName, review.user.lastName].filter(Boolean).join(" ");

            return (
              <article className="rounded-lg border border-[#dfe6e3] bg-white p-4" key={review.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-extrabold text-text-dark">{name || "Agentica customer"}</p>
                    <p className="mt-1 text-xs font-medium text-[#8792a1]">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      aria-label={`${review.rating} out of 5 stars`}
                      className="text-base tracking-wide text-[#f9b115]"
                    >
                      {"★★★★★".slice(0, review.rating)}
                      <span className="text-[#d8dee3]">{"★★★★★".slice(review.rating)}</span>
                    </span>
                    {review.user.id === customer?.id ? (
                      <button
                        aria-label="Delete your review"
                        className="grid size-9 place-items-center rounded-full text-[#8792a1] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        disabled={deletingReviewId === review.id}
                        onClick={() => void deleteReview(review)}
                        title="Delete review"
                        type="button"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#526273]">
                  {review.description}
                </p>
              </article>
            );
          })}
        </div>
      )}

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-[150] grid place-items-center overflow-y-auto bg-text-dark/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsModalOpen(false);
          }}
        >
          <form
            aria-modal="true"
            aria-labelledby="review-form-title"
            className="relative w-full max-w-lg rounded-2xl border border-white/70 bg-white p-6 shadow-[0_28px_80px_rgba(9,39,68,0.28)]"
            onSubmit={submitReview}
            role="dialog"
          >
            <button
              aria-label="Close review form"
              className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-[#f2f6f4] text-[#687487] hover:text-text-dark"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              <X className="size-4.5" />
            </button>
            <p className="text-xs font-extrabold uppercase tracking-wide text-nav-green">
              Product review
            </p>
            <h3
              className="mt-2 pr-10 text-2xl font-extrabold text-text-dark"
              id="review-form-title"
            >
              Share your experience
            </h3>

            <fieldset className="mt-6">
              <legend className="text-sm font-extrabold text-text-dark">Your rating</legend>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    aria-label={`Rate ${value} out of 5 stars`}
                    className="p-1"
                    key={value}
                    onClick={() => setRating(value)}
                    type="button"
                  >
                    <Star
                      className={`size-8 ${
                        value <= rating ? "fill-[#f9b115] text-[#f9b115]" : "text-[#d8dee3]"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="mt-5 block">
              <span className="text-sm font-extrabold text-text-dark">Your review</span>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded-xl border border-[#dfe6e3] bg-[#fbfdfc] px-4 py-3 text-sm leading-6 text-text-dark outline-none focus:border-main-green focus:ring-4 focus:ring-main-green/15"
                maxLength={1000}
                name="description"
                placeholder="What did you like or dislike about this product?"
                required
              />
            </label>

            {error ? <p className="mt-3 text-sm font-bold text-red-600">{error}</p> : null}

            <button
              className="mt-5 h-12 w-full rounded-xl bg-main-green px-5 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(53,220,99,0.22)] hover:bg-main-green-hover disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Publishing..." : "Publish review"}
            </button>
          </form>
        </div>
      ) : null}

      {toast ? (
        <ToastMessage message={toast} onClose={() => setToast("")} tone={toastTone} />
      ) : null}
    </div>
  );
}
