"use client";

import React from "react";
import Image from "next/image";
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
    image: "/images/brown.jpg",
    title: "Discover the New Collection",
    description: "Premium women's shoes for every occasion.",
    href: "/products/new-arrivals",
  },
  {
    image: "/images/gray.jpg",
    title: "Elegance in Every Step",
    description: "Find the perfect pair of heels for your next event.",
    href: "/products/heels",
  },
  {
    image: "/images/blue.jpg",
    title: "Summer-Ready Sandals",
    description: "Step into summer with our latest collection of sandals.",
    href: "/products/sandals",
  },
  {
    image: "/images/green.jpg",
    title: "Comfort Meets Style",
    description: "Explore our range of comfortable and stylish sneakers.",
    href: "/products/sneakers",
  },
  {
    image: "/images/red.jpg",
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
    <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
      <div className="flex items-center justify-center space-x-2">
        {carouselSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "size-2 rounded-full transition-all duration-300",
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
        className="size-full"
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
            <CarouselItem key={index} className="relative h-screen w-full p-0">
              <div className="relative flex size-full items-center justify-center overflow-hidden bg-black text-white">
                <Image
                  src={slide?.image}
                  alt={slide?.title}
                  fill
                  quality={100}
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
