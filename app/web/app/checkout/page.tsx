import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";

export default function Checkout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<main className="min-h-[60vh] bg-[#f7faf8]" />}>
        <CheckoutPage />
      </Suspense>
      <Footer />
    </>
  );
}
import { Suspense } from "react";
