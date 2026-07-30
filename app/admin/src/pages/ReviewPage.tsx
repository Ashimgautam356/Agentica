import { RiDeleteBin6Line, RiSearchLine, RiStarFill, RiStarLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import { useDeleteReview, useReviews, type ReviewRecord } from "../api/admin";
import { DataTable } from "../components/DataTable";

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

const dummyReviews: ReviewRecord[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    rating: 5,
    description: "The sound quality is excellent and the battery lasted all week.",
    userId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    productId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    createdAt: new Date().toISOString(),
    user: {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      firstName: "Maya",
      lastName: "Gurung",
      email: "maya@example.com",
      imageId: "users/maya-gurung",
    },
    product: {
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      skuId: "PRD-1001",
      name: "Wireless Headphones",
      imageId: "products/wireless-headphones",
      description: [],
      price: 2450,
      tags: [],
      categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    },
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    rating: 4,
    description: "Comfortable fit and good value, though delivery took longer than expected.",
    userId: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    productId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    user: {
      id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
      firstName: "Aarav",
      lastName: "Sharma",
      email: "aarav@example.com",
      imageId: "users/aarav-sharma",
    },
    product: {
      id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
      skuId: "PRD-1002",
      name: "Running Shoes",
      imageId: "products/running-shoes",
      description: [],
      price: 3200,
      tags: [],
      categoryId: "ffffffff-ffff-4fff-8fff-ffffffffffff",
    },
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    rating: 3,
    description: "The planter looks nice, but the color is slightly darker than the photo.",
    userId: "99999999-9999-4999-8999-999999999999",
    productId: "88888888-8888-4888-8888-888888888888",
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    user: {
      id: "99999999-9999-4999-8999-999999999999",
      firstName: "Nisha",
      lastName: "Rai",
      email: "nisha@example.com",
      imageId: "users/nisha-rai",
    },
    product: {
      id: "88888888-8888-4888-8888-888888888888",
      skuId: "PRD-1003",
      name: "Ceramic Planter",
      imageId: "products/ceramic-planter",
      description: [],
      price: 850,
      tags: [],
      categoryId: "77777777-7777-4777-8777-777777777777",
    },
  },
];

export function ReviewPage({ syncedAt }: { syncedAt: string }) {
  const reviews = useReviews();
  const deleteReview = useDeleteReview();
  const [search, setSearch] = useState("");
  const reviewList = reviews.data?.length ? reviews.data : dummyReviews;

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

  function isRealReview(id: string) {
    return Boolean(reviews.data?.some((review) => review.id === id));
  }

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
            onChange={(event) => setSearch(event.target.value)}
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
                    onClick={() => {
                      if (isRealReview(row.id)) {
                        deleteReview.mutate(row.id);
                      }
                    }}
                    type="button"
                  >
                    <RiDeleteBin6Line size={18} />
                  </button>
                ),
              },
            ]}
          />
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
