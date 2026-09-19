import Image from "next/image";

export function ExclusiveOffers() {
  return (
    <section className="mx-auto my-10 max-w-282.5 overflow-hidden bg-[#baf6c9]">
      <div className="relative grid min-h-72 items-center overflow-hidden bg-[radial-gradient(circle_at_54%_50%,#f7fbff_0%,#f7fbff_34%,rgba(247,251,255,0.72)_55%,rgba(247,251,255,0)_78%)] px-4 min-[760px]:grid-cols-[0.9fr_1.1fr] min-[921px]:min-h-90 min-[921px]:px-20">
        <div className="relative order-2 mx-auto h-72 w-full max-w-72 self-end min-[760px]:order-1 min-[921px]:h-72 min-[921px]:max-w-80">
          <Image
            className="absolute bottom-0 left-1/2 h-auto w-70 -translate-x-1/2 min-[921px]:w-76"
            src="/male-courier.png"
            alt="Courier holding drinks and a clipboard"
            width={344}
            height={440}
          />
        </div>

        <div className="order-1 py-10 text-center min-[760px]:order-2 min-[760px]:py-0 min-[760px]:text-left">
          <h2 className="max-w-116 text-[28px] leading-[1.3] font-extrabold text-text-dark min-[760px]:text-[34px]">
            SignUp For Exclusive Offers And Discounts
          </h2>
          <a
            className="mt-8 inline-flex h-11 min-w-44 items-center justify-center rounded-md bg-main-green px-8 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(53,220,99,0.22)] transition hover:-translate-y-0.5 hover:bg-main-green-hover"
            href="#"
          >
            Sign Up
          </a>
        </div>
      </div>
    </section>
  );
}
