"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

// Hero slides data
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

const HeroSection = () => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="relative h-[100svh] w-full">
      <div ref={emblaRef} className="size-full overflow-hidden">
        <div className="flex h-full">
          {carouselSlides.map((slide, index) => (
            <div key={index} className="relative size-full flex-[0_0_100%]">
              <div className="relative flex size-full items-center justify-center overflow-hidden bg-black text-white">
                <Image
                  src={slide?.image}
                  alt={slide?.title}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="absolute inset-0 size-full object-cover object-center opacity-60"
                />
                <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
                  <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
                    {slide?.title}
                  </h1>
                  <p className="mb-8 text-lg md:text-xl lg:text-2xl">
                    {slide?.description}
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="border-2 border-white bg-transparent px-8 text-white hover:bg-white hover:text-primary"
                  >
                    <Link href={slide?.href ?? "/"}>Shop Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-8 left-0 right-0 z-50">
          <div className="flex justify-center gap-2">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "size-2 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "bg-white"
                    : "border border-white bg-transparent"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
