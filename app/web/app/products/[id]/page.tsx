import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductDetailPage } from "@/components/products/ProductDetailPage";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Product({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <ProductDetailPage productId={id} />
      <Footer />
    </>
  );
}
