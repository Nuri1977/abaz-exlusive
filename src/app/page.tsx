import Link from "next/link";

import { placeholderShoeImages } from "@/constants/images";
import { Button } from "@/components/ui/button";
import BestSellers from "@/components/home/BestSellers";
import HeroSection from "@/components/home/HeroSection";
import NewArrivals from "@/components/home/NewArrivals";

const placeholderShoes = [
  {
    title: "Elegant Red Heels",
    price: "€199,95",
    image: placeholderShoeImages[0],
  },
  {
    title: "Classic Black Heels",
    price: "€209,95",
    image: placeholderShoeImages[1],
  },
  {
    title: "Stylish Brown Boots",
    price: "€259,95",
    image: placeholderShoeImages[2],
  },
  {
    title: "Modern Black Boots",
    price: "€279,95",
    image: placeholderShoeImages[3],
  },
  {
    title: "Chic Summer Sandals",
    price: "€149,95",
    image: placeholderShoeImages[4],
  },
  {
    title: "Comfy Beige Flats",
    price: "€139,95",
    image: placeholderShoeImages[5],
  },
];

const categories = [
  {
    name: "Heels",
    image: placeholderShoeImages[0],
  },
  {
    name: "Flats",
    image: placeholderShoeImages[1],
  },
  {
    name: "Boots",
    image: placeholderShoeImages[2],
  },
  {
    name: "Sandals",
    image: placeholderShoeImages[3],
  },
  {
    name: "Bags",
    image: placeholderShoeImages[4],
  },
];

export default function HomePage() {
  return (
    <div className="font-sans">
      {/* Hero Banner */}
      <HeroSection />

      {/* New Arrivals */}
      <NewArrivals />

      {/* Promo Banner */}
      <section className="py-0">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-[var(--radius)] bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12">
            {/* Shimmer effect */}
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="relative z-10 text-center">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                Free Express Shipping
              </h2>

              {/* Subtitle */}
              <p className="mx-auto mb-8 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
                Enjoy free express shipping on all orders. Shop the latest in
                women's footwear and get your favorites delivered fast!
              </p>

              {/* CTA Button */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="transform bg-secondary text-secondary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/90 hover:shadow-xl"
                >
                  <Link href="/products">Shop Now</Link>
                </Button>

                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="transform bg-secondary text-secondary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-secondary/90 hover:shadow-xl"
                >
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>

              {/* Additional info */}
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-primary-foreground/80">
                <div className="flex items-center gap-2">
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
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2">
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
                  <span>Free Returns</span>
                </div>
                <div className="flex items-center gap-2">
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
                  <span>Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <BestSellers />

      {/* Shop by Category */}
      <section className="mb-20">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Shop by Category
        </h2>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-5">
          {categories.map((cat, idx) => (
            <Link
              href="/"
              key={cat.name}
              className="group flex flex-col items-center"
            >
              <div className="mb-3 size-32 overflow-hidden rounded-full border-4 border-tertiary transition-transform group-hover:scale-105 md:h-40 md:w-40">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="size-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold text-black transition-colors group-hover:text-primary">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
