import Link from "next/link";

import { placeholderShoeImages } from "@/constants/images";
import { Button } from "@/components/ui/button";
import BestSellers from "@/components/home/BestSellers";
import HeroSection from "@/components/home/HeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";

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
    <>
      {/* Hero Banner */}
      <HeroSection />

      {/* Main content */}
      <div className="space-y-20 py-20">
        {/* New Arrivals */}
        <NewArrivals />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Best Sellers */}
        <BestSellers />

        {/* Shop by Category */}
        <section className="container px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Shop by Category
          </h2>
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-5">
            {categories.map((cat) => (
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
                <span className="text-center font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
