import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Code,
  LayoutDashboard,
  Lock,
  Paintbrush,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { placeholderShoeImages } from "@/utils/constants";

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
      <section className="relative w-full h-screen flex items-center justify-center bg-black text-white mb-16">
        <img
          src="https://images.unsplash.com/photo-1524553879936-2ff074ae5816?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Hero Shoe"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            Discover the New Collection
          </h1>
          <p className="text-lg md:text-2xl mb-8">
            Premium women's shoes for every occasion
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="#new-arrivals">Shop New Arrivals</Link>
          </Button>
        </div>
      </section>

      {/* New Arrivals */}
      <section id="new-arrivals" className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-10">New Arrivals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {placeholderShoes.slice(0, 3).map((shoe, idx) => (
            <div
              key={idx}
              className="bg-white rounded shadow p-4 flex flex-col items-center"
            >
              <img
                src={shoe.image}
                alt={shoe.title}
                className="w-full h-64 object-cover mb-4 rounded"
              />
              <h3 className="text-lg font-semibold mb-2 text-black">
                {shoe.title}
              </h3>
              <p className="text-primary text-xl font-bold mb-2">
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
        <h2 className="text-3xl font-bold text-center mb-10">Best Sellers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {placeholderShoes.slice(3).map((shoe, idx) => (
            <div
              key={idx}
              className="bg-white rounded shadow p-4 flex flex-col items-center"
            >
              <img
                src={shoe.image}
                alt={shoe.title}
                className="w-full h-64 object-cover mb-4 rounded"
              />
              <h3 className="text-lg font-semibold mb-2 text-black">
                {shoe.title}
              </h3>
              <p className="text-primary text-xl font-bold mb-2">
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
        <h2 className="text-3xl font-bold text-center mb-10">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {categories.map((cat, idx) => (
            <Link
              href="/"
              key={cat.name}
              className="flex flex-col items-center group"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-3 border-4 border-tertiary group-hover:scale-105 transition-transform">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold text-black group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mb-20">
        <div className="bg-primary text-primary-foreground py-12 px-4 rounded-lg max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Free Express Shipping
          </h2>
          <p className="mb-6">
            Enjoy free express shipping on all orders. Shop the latest in
            women's footwear and get your favorites delivered fast!
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-black font-semibold"
          >
            <Link href="/">Shop Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
