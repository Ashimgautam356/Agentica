import { RiAddLine, RiDeleteBin6Line, RiEdit2Line, RiSearchLine } from "@remixicon/react";
import { useMemo, useState } from "react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useProducts,
  useUpdateCategory,
  type CategoryRecord,
} from "../api/admin";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { useToast } from "../components/Toast";
import { cloudinaryImageUrl } from "../lib/cloudinary";
import { getErrorMessage } from "../lib/utils";
import { CategoryModal } from "./CategoryModal";

type CategoryRow = {
  id: string;
  name: string;
  image: string;
  products: number;
  status: string;
  actions: string;
};

export function CategoryPage({ syncedAt }: { syncedAt: string }) {
  const [page, setPage] = useState(1);
  const categories = useCategories(page);
  const products = useProducts();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categoryList = categories.data?.items ?? [];

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const productCounts = new Map<string, number>();

    for (const product of products.data?.items ?? []) {
      productCounts.set(product.categoryId, (productCounts.get(product.categoryId) ?? 0) + 1);
    }

    return categoryList
      .filter((category) => {
        if (!query) {
          return true;
        }

        return [category.name, category.imageId ?? ""].join(" ").toLowerCase().includes(query);
      })
      .map((category) => ({
        id: category.id,
        name: category.name,
        image: category.imageId ?? "-",
        products: category._count?.products ?? productCounts.get(category.id) ?? 0,
        status: "Active",
        actions: "",
      }));
  }, [categoryList, products.data?.items, search]);

  const error =
    categories.error ??
    products.error ??
    createCategory.error ??
    updateCategory.error ??
    deleteCategory.error;

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
  }

  return (
    <>
      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Catalog</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#241F14]">Category list</h2>
            <p className="mt-2 text-sm font-semibold text-[#8A8172]">Last synced at {syncedAt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 max-sm:w-full">
            <label className="flex min-h-11 min-w-72 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:flex-1">
              <RiSearchLine size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172]"
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search categories"
                type="search"
                value={search}
              />
            </label>
            <button
              className="flex min-h-11 items-center gap-2 rounded-lg bg-[#34A85B] px-4 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#2C8F4E] active:scale-95"
              onClick={() => {
                setEditing(null);
                setIsModalOpen(true);
              }}
              type="button"
            >
              <RiAddLine size={20} />
              Add category
            </button>
          </div>
        </div>

        {error ? <InlineError error={error} /> : null}

        <article className="min-w-0 rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#34A85B]">Manage</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#241F14]">Categories</h3>
            </div>
            <span className="rounded-lg bg-[#EAF5EC] px-3 py-2 text-xs font-extrabold text-[#34A85B]">
              {rows.length} items
            </span>
          </div>

          {categories.isLoading ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">Loading categories...</p>
          ) : null}
          {!categories.isLoading && rows.length === 0 ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">No categories found.</p>
          ) : (
            <>
              <DataTable<CategoryRow>
                rows={rows}
                columns={[
                  { key: "name", label: "Category" },
                  {
                    key: "image",
                    label: "Image",
                    render: (row) => <CategoryImageCell imageId={row.image} name={row.name} />,
                  },
                  { key: "products", label: "Products" },
                  { key: "status", label: "Status" },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (row) => (
                      <CategoryRowActions
                        disabled={deleteCategory.isPending}
                        onDelete={() =>
                          deleteCategory.mutate(row.id, {
                            onSuccess: () => toast.success("Category deleted successfully."),
                            onError: (error) =>
                              toast.error(getErrorMessage(error, "Could not delete category.")),
                          })
                        }
                        onEdit={() => {
                          const category = categoryList.find((item) => item.id === row.id);
                          if (category) {
                            setEditing(category);
                            setIsModalOpen(true);
                          }
                        }}
                      />
                    ),
                  },
                ]}
              />
              {categories.data ? (
                <Pagination
                  page={categories.data.page}
                  pageSize={categories.data.pageSize}
                  total={categories.data.total}
                  totalPages={categories.data.totalPages}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </article>
      </section>

      {isModalOpen ? (
        <CategoryModal
          initialCategory={editing}
          isSaving={createCategory.isPending || updateCategory.isPending}
          onClose={closeModal}
          onSubmit={(input) => {
            if (editing) {
              updateCategory.mutate(
                { id: editing.id, input },
                {
                  onSuccess: () => {
                    closeModal();
                    toast.success("Category updated successfully.");
                  },
                  onError: (error) =>
                    toast.error(getErrorMessage(error, "Could not update category.")),
                },
              );
              return;
            }

            createCategory.mutate(input, {
              onSuccess: () => {
                closeModal();
                toast.success("Category created successfully.");
              },
              onError: (error) => toast.error(getErrorMessage(error, "Could not create category.")),
            });
          }}
        />
      ) : null}
    </>
  );
}

function CategoryImageCell({ imageId, name }: { imageId: string; name: string }) {
  const imageUrl = cloudinaryImageUrl(imageId);

  return (
    <div className="flex min-w-32 items-center gap-3">
      <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[#EFE7D8] bg-[#FBF8F2] text-xs font-extrabold text-[#8A8172]">
        {imageUrl ? <img alt={name} className="size-full object-cover" src={imageUrl} /> : "No img"}
      </span>
    </div>
  );
}

function CategoryRowActions({
  disabled,
  onDelete,
  onEdit,
}: {
  disabled?: boolean;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        aria-label="Edit category"
        className="grid size-10 place-items-center rounded-lg border border-[#DDEFE1] bg-[#EAF5EC] text-[#34A85B] transition-[background-color,transform] duration-150 hover:bg-[#DDEFE1] active:scale-95"
        onClick={onEdit}
        type="button"
      >
        <RiEdit2Line size={18} />
      </button>
      <button
        aria-label="Delete category"
        className="grid size-10 place-items-center rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95 disabled:opacity-60"
        disabled={disabled}
        onClick={onDelete}
        type="button"
      >
        <RiDeleteBin6Line size={18} />
      </button>
    </div>
  );
}

function InlineError({ error }: { error: Error }) {
  return (
    <div className="rounded-lg border border-[#F3C8C2] bg-[#FFF0EE] px-4 py-3 text-sm font-semibold text-[#D9584A]">
      {error.message}
    </div>
  );
}
