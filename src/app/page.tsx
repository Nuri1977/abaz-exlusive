import Link from "next/link";

import { placeholderShoeImages } from "@/constants/images";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/home/HeroSection";

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
      <section id="new-arrivals" className="mb-20">
        <h2 className="mb-10 text-center text-3xl font-bold">New Arrivals</h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {placeholderShoes.slice(0, 3).map((shoe, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-white p-4 shadow"
            >
              <img
                src={shoe.image}
                alt={shoe.title}
                className="mb-4 h-64 w-full rounded object-cover"
              />
              <h3 className="mb-2 text-lg font-semibold text-black">
                {shoe.title}
              </h3>
              <p className="mb-2 text-xl font-bold text-primary">
                {shoe.price}
              </p>
              <Button asChild className="w-full">
                <Link href="/">Add to Cart</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="mb-20">
        <h2 className="mb-10 text-center text-3xl font-bold">Best Sellers</h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {placeholderShoes.slice(3).map((shoe, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center bg-white p-4 shadow"
            >
              <img
                src={shoe.image}
                alt={shoe.title}
                className="mb-4 h-64 w-full rounded object-cover"
              />
              <h3 className="mb-2 text-lg font-semibold text-black">
                {shoe.title}
              </h3>
              <p className="mb-2 text-xl font-bold text-primary">
                {shoe.price}
              </p>
              <Button asChild className="w-full">
                <Link href="/">Add to Cart</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

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

      {/* Promo Banner */}
      <section className="mb-20">
        <div className="mx-auto max-w-4xl rounded-lg bg-primary px-4 py-12 text-center text-primary-foreground">
          <h2 className="mb-4 text-2xl font-bold md:text-3xl">
            Free Express Shipping
          </h2>
          <p className="mb-6">
            Enjoy free express shipping on all orders. Shop the latest in
            women's footwear and get your favorites delivered fast!
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white font-semibold text-black"
          >
            <Link href="/">Shop Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
