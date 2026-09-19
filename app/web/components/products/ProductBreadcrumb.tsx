import Link from "next/link";

type ProductBreadcrumbProps = {
  current: string;
  parentLabel?: string;
  parentHref?: string;
};

export function ProductBreadcrumb({
  current,
  parentLabel = "All Products",
  parentHref,
}: ProductBreadcrumbProps) {
  return (
    <div className="mb-1 text-xs font-semibold text-[#8b97a7]">
      <Link className="hover:text-main-green" href="/">
        Home
      </Link>{" "}
      /{" "}
      {parentHref ? (
        <>
          <Link className="hover:text-main-green" href={parentHref}>
            {parentLabel}
          </Link>{" "}
          / {current}
        </>
      ) : (
        current
      )}
    </div>
  );
}
