import Link from "next/link";

import { Button } from "../ui/button";

const PromoBanner = () => {
  return (
    <section className="relative h-[500px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1605732440685-d0654d81aa30?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`, // To make it changeable by Admin in Admin Dashboard
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        {/* Optional shimmer or overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Free Express Shipping
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90 md:text-xl">
          Enjoy free express shipping on all orders. Shop the latest in women's
          footwear and get your favorites delivered fast!
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="transform bg-white text-primary shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Link href="/products">Shop Now</Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="secondary"
            className="transform bg-white text-primary shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <Link href="/about">Learn More</Link>
          </Button>
        </div>

        {/* Info icons */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
          {["Fast Delivery", "Free Returns", "Premium Quality"].map(
            (text, i) => (
              <div className="flex items-center gap-2" key={i}>
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{text}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
