import { RiDeleteBin6Line, RiSearchLine, RiStarFill, RiStarLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { useDeleteReview, useReviews, type ReviewRecord } from "../api/admin";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";

type ReviewRow = {
  id: string;
  reviewer: string;
  email: string;
  image: string;
  product: string;
  rating: number;
  description: string;
  created: string;
  actions: string;
};

export function ReviewPage({ syncedAt }: { syncedAt: string }) {
  const [page, setPage] = useState(1);
  const reviews = useReviews(page);
  const deleteReview = useDeleteReview();
  const [search, setSearch] = useState("");
  const reviewList = reviews.data?.items ?? [];

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reviewList
      .filter((review) => {
        if (!query) {
          return true;
        }

        return [
          getReviewerName(review),
          review.user.email ?? "",
          review.user.imageId ?? "",
          review.product.name,
          review.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map((review) => ({
        id: review.id,
        reviewer: getReviewerName(review),
        email: review.user.email ?? "-",
        image: review.user.imageId ?? "-",
        product: review.product.name,
        rating: review.rating,
        description: review.description,
        created: review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-",
        actions: "",
      }));
  }, [reviewList, search]);

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase text-[#34A85B]">Sales</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#241F14]">Review list</h2>
          <p className="mt-2 text-sm font-semibold text-[#8A8172]">Last synced at {syncedAt}</p>
        </div>
        <label className="flex min-h-11 min-w-80 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:w-full">
          <RiSearchLine size={18} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172]"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search reviews"
            type="search"
            value={search}
          />
        </label>
      </div>

      {reviews.error || deleteReview.error ? (
        <InlineError error={(reviews.error ?? deleteReview.error) as Error} />
      ) : null}

      <article className="min-w-0 rounded-lg border border-[#EFE7D8] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Moderation</p>
            <h3 className="mt-1 text-lg font-extrabold text-[#241F14]">Customer reviews</h3>
          </div>
          <span className="rounded-lg bg-[#EAF5EC] px-3 py-2 text-xs font-extrabold text-[#34A85B]">
            {rows.length} items
          </span>
        </div>

        {reviews.isLoading ? (
          <p className="m-0 text-sm font-semibold text-[#8A8172]">Loading reviews...</p>
        ) : null}
        {!reviews.isLoading && rows.length === 0 ? (
          <p className="m-0 text-sm font-semibold text-[#8A8172]">No reviews found.</p>
        ) : (
          <>
            <DataTable<ReviewRow>
              rows={rows}
              columns={[
                {
                  key: "reviewer",
                  label: "Reviewer",
                  render: (row) => (
                    <ReviewerCell email={row.email} image={row.image} name={row.reviewer} />
                  ),
                },
                { key: "product", label: "Product" },
                {
                  key: "rating",
                  label: "Rating",
                  render: (row) => <RatingStars rating={row.rating} />,
                },
                {
                  key: "description",
                  label: "Description",
                  render: (row) => (
                    <p className="m-0 max-w-md whitespace-normal leading-6 text-[#6A717F]">
                      {row.description}
                    </p>
                  ),
                },
                { key: "created", label: "Created" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <button
                      aria-label="Delete review"
                      className="grid size-10 place-items-center rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95 disabled:opacity-60"
                      disabled={deleteReview.isPending}
                      onClick={() => deleteReview.mutate(row.id)}
                      type="button"
                    >
                      <RiDeleteBin6Line size={18} />
                    </button>
                  ),
                },
              ]}
            />
            {reviews.data ? (
              <Pagination
                page={reviews.data.page}
                pageSize={reviews.data.pageSize}
                total={reviews.data.total}
                totalPages={reviews.data.totalPages}
                onPageChange={setPage}
              />
            ) : null}
          </>
        )}
      </article>
    </section>
  );
}

function ReviewerCell({ email, image, name }: { email: string; image: string; name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-w-56 items-center gap-3">
      <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#EAF5EC] text-sm font-extrabold text-[#34A85B]">
        {image.startsWith("http") ? (
          <img alt={name} className="size-full object-cover" src={image} />
        ) : (
          initials
        )}
      </span>
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-extrabold text-[#241F14]">{name}</p>
        <p className="m-0 truncate text-xs font-semibold text-[#8A8172]">{email}</p>
        <p className="m-0 truncate text-xs font-semibold text-[#8A8172]">{image}</p>
      </div>
    </div>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex min-w-32 items-center gap-1 text-[#E8A33D]"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, index) =>
        index < rating ? (
          <RiStarFill key={index} size={18} />
        ) : (
          <RiStarLine key={index} size={18} />
        ),
      )}
      <span className="ml-1 text-xs font-extrabold text-[#6A717F]">{rating}/5</span>
    </div>
  );
}

function getReviewerName(review: ReviewRecord) {
  return [review.user.firstName, review.user.lastName].filter(Boolean).join(" ") || "Customer";
}

function InlineError({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] px-4 py-3 text-sm font-semibold text-[#D9584A]">
      {error.message}
    </div>
  );
}
