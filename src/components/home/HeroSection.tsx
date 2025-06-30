"use client";

import React from "react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";

const carouselSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1524553879936-2ff074ae5816?q=80&w=2952&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Discover the New Collection",
    description: "Premium women's shoes for every occasion.",
    href: "/products/new-arrivals",
  },
  {
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Elegance in Every Step",
    description: "Find the perfect pair of heels for your next event.",
    href: "/products/heels",
  },
  {
    image:
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Summer-Ready Sandals",
    description: "Step into summer with our latest collection of sandals.",
    href: "/products/sandals",
  },
  {
    image:
      "https://images.unsplash.com/photo-1590779233251-9162a153587a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Comfort Meets Style",
    description: "Explore our range of comfortable and stylish sneakers.",
    href: "/products/sneakers",
  },
  {
    image:
      "https://images.unsplash.com/photo-1604004555489-723a93d6ce74?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    title: "Bold & Beautiful Boots",
    description: "Make a statement with our collection of boots.",
    href: "/products/boots",
  },
];

const CarouselDots = () => {
  const { api } = useCarousel();
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const scrollTo = (index: number) => {
    api?.scrollTo(index);
  };

  return (
    <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transform">
      <div className="flex items-center justify-center space-x-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "bg-white"
                : "border border-white bg-transparent"
            )}
          />
        ))}
      </div>
    </div>
  );
};

const HeroSection = () => {
  const plugin = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
      stopOnFocusIn: true,
    })
  );

  return (
    <section className="relative h-[calc(100vh-80px)] w-full">
      <Carousel
        plugins={[plugin.current]}
        className="h-full w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        opts={{
          loop: true,
          align: "start",
          skipSnaps: false,
        }}
      >
        <CarouselContent className="-ml-0 h-full">
          {carouselSlides.map((slide, index) => (
            <CarouselItem
              key={index}
              className="relative h-screen w-full p-0 pl-0"
            >
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black text-white">
                <img
                  src={slide?.image}
                  alt={slide?.title}
                  className="absolute inset-0 h-screen w-full object-cover object-center opacity-60"
                />
                <div className="relative z-10 text-center">
                  <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
                    {slide?.title}
                  </h1>
                  <p className="mb-8 text-lg md:text-2xl">
                    {slide?.description}
                  </p>
                  <Button asChild size="lg" variant="secondary">
                    <Link href={slide?.href ?? "/"}>Shop Now</Link>
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselDots />
      </Carousel>
    </section>
  );
};

export default HeroSection;
