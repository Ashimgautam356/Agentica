import {
  RiAddLine,
  RiDeleteBin6Line,
  RiEdit2Line,
  RiFilter3Line,
  RiSearchLine,
} from "@remixicon/react";
import { useMemo, useState } from "react";
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
  type ProductRecord,
} from "../api/admin";
import { DataTable } from "../components/DataTable";
import { ProductModal } from "./ProductModal";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: string;
  image: string;
  actions: string;
};

const dummyCategories = [
  { id: "11111111-1111-4111-8111-111111111111", name: "Electronics" },
  { id: "22222222-2222-4222-8222-222222222222", name: "Fashion" },
  { id: "33333333-3333-4333-8333-333333333333", name: "Home Goods" },
];

const dummyProducts: ProductRecord[] = [
  {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    skuId: "PRD-1001",
    name: "Wireless Headphones",
    imageId: "products/wireless-headphones",
    description: ["Noise cancelling over-ear headphones", "Up to 30 hours battery life"],
    price: 2450,
    tags: ["featured", "audio"],
    categoryId: dummyCategories[0].id,
    category: dummyCategories[0],
  },
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    skuId: "PRD-1002",
    name: "Running Shoes",
    imageId: "products/running-shoes",
    description: ["Lightweight daily running shoes", "Breathable knit upper"],
    price: 3200,
    tags: ["new", "sports"],
    categoryId: dummyCategories[1].id,
    category: dummyCategories[1],
  },
  {
    id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    skuId: "PRD-1003",
    name: "Ceramic Planter",
    imageId: "products/ceramic-planter",
    description: ["Matte glazed indoor planter", "Drainage tray included"],
    price: 850,
    tags: ["home", "decor"],
    categoryId: dummyCategories[2].id,
    category: dummyCategories[2],
  },
];

export function ProductPage({ syncedAt }: { syncedAt: string }) {
  const products = useProducts();
  const categories = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editing, setEditing] = useState<ProductRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categoryOptions = categories.data?.length ? categories.data : dummyCategories;
  const productList = products.data?.length ? products.data : dummyProducts;

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return productList
      .filter((product) => {
        if (categoryFilter && product.categoryId !== categoryFilter) {
          return false;
        }

        if (!query) {
          return true;
        }

        return [product.name, product.skuId, product.category?.name ?? product.categoryId]
          .join(" ")
          .toLowerCase()
          .includes(query);
      })
      .map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.skuId,
        category: product.category?.name ?? product.categoryId,
        price: `Rs ${product.price}`,
        image: product.imageId,
        actions: "",
      }));
  }, [categoryFilter, productList, search]);

  const error =
    products.error ??
    categories.error ??
    createProduct.error ??
    updateProduct.error ??
    deleteProduct.error;

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
  }

  function isRealProduct(id: string) {
    return Boolean(products.data?.some((product) => product.id === id));
  }

  return (
    <>
      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Catalog</p>
            <h2 className="mt-1 text-2xl font-extrabold text-[#241F14]">Product list</h2>
            <p className="mt-2 text-sm font-semibold text-[#8A8172]">Last synced at {syncedAt}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 max-sm:w-full">
            <label className="flex min-h-11 min-w-72 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:flex-1">
              <RiSearchLine size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none placeholder:text-[#8A8172]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products"
                type="search"
                value={search}
              />
            </label>
            <label className="flex min-h-11 min-w-56 items-center gap-2 rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#6A717F] max-sm:min-w-0 max-sm:flex-1">
              <RiFilter3Line size={18} />
              <select
                className="min-w-0 flex-1 bg-transparent text-[#241F14] outline-none"
                onChange={(event) => setCategoryFilter(event.target.value)}
                value={categoryFilter}
              >
                <option value="">All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
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
              Add product
            </button>
          </div>
        </div>

        {error ? <InlineError error={error} /> : null}

        <article className="min-w-0 rounded-lg border border-[#EFE7D8] bg-white p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase text-[#34A85B]">Manage</p>
              <h3 className="mt-1 text-lg font-extrabold text-[#241F14]">Products</h3>
            </div>
            <span className="rounded-lg bg-[#EAF5EC] px-3 py-2 text-xs font-extrabold text-[#34A85B]">
              {rows.length} items
            </span>
          </div>

          {products.isLoading ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">Loading products...</p>
          ) : null}
          {!products.isLoading && rows.length === 0 ? (
            <p className="m-0 text-sm font-semibold text-[#8A8172]">No products found.</p>
          ) : (
            <DataTable<ProductRow>
              rows={rows}
              columns={[
                { key: "name", label: "Product Name" },
                { key: "sku", label: "SKU" },
                { key: "category", label: "Category" },
                { key: "price", label: "Price" },
                { key: "image", label: "Cloudinary Image ID" },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <ProductRowActions
                      disabled={deleteProduct.isPending}
                      onDelete={() => {
                        if (isRealProduct(row.id)) {
                          deleteProduct.mutate(row.id);
                        }
                      }}
                      onEdit={() => {
                        const product = productList.find((item) => item.id === row.id);
                        if (product) {
                          setEditing(product);
                          setIsModalOpen(true);
                        }
                      }}
                    />
                  ),
                },
              ]}
            />
          )}
        </article>
      </section>

      {isModalOpen ? (
        <ProductModal
          categories={categoryOptions}
          initialProduct={editing}
          isSaving={createProduct.isPending || updateProduct.isPending}
          onClose={closeModal}
          onSubmit={(input) => {
            if (editing) {
              if (isRealProduct(editing.id)) {
                updateProduct.mutate({ id: editing.id, input }, { onSuccess: closeModal });
                return;
              }

              closeModal();
              return;
            }

            createProduct.mutate(input, { onSuccess: closeModal });
          }}
        />
      ) : null}
    </>
  );
}

function ProductRowActions({
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
        aria-label="Edit product"
        className="grid size-10 place-items-center rounded-lg border border-[#DDEFE1] bg-[#EAF5EC] text-[#34A85B] transition-[background-color,transform] duration-150 hover:bg-[#DDEFE1] active:scale-95"
        onClick={onEdit}
        type="button"
      >
        <RiEdit2Line size={18} />
      </button>
      <button
        aria-label="Delete product"
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
