"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/shared/HeroHeader";

// Hero slides data
const carouselSlides = [
  {
    image: "/images/hero_01.jpg",
    title: "Discover the New Collection",
    description: "Premium women's shoes for every occasion.",
    href: "/products/new-arrivals",
  },
  {
    image: "/images/hero_02.jpg",
    title: "Elegance in Every Step",
    description: "Find the perfect pair of heels for your next event.",
    href: "/products/heels",
  },
  {
    image: "/images/hero_03.jpg",
    title: "Summer-Ready Sandals",
    description: "Step into summer with our latest collection of sandals.",
    href: "/products/sandals",
  },
  {
    image: "/images/hero_04.jpg",
    title: "Comfort Meets Style",
    description: "Explore our range of comfortable and stylish sneakers.",
    href: "/products/sneakers",
  },
  {
    image: "/images/hero_05.jpg",
    title: "Bold & Beautiful Boots",
    description: "Make a statement with our collection of boots.",
    href: "/products/boots",
  },
];

interface HeroSectionProps {
  settings?: any;
}

const HeroSection = ({ settings }: HeroSectionProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
    },
    [
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
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
      {/* Hero Header */}
      <HeroHeader settings={settings} />

      <div ref={emblaRef} className="size-full overflow-hidden">
        <div className="flex h-full">
          {carouselSlides.map((slide, index) => (
            <div key={index} className="relative size-full flex-[0_0_100%]">
              <div className="relative flex size-full items-end justify-center overflow-hidden bg-black text-white">
                {/* Mobile: Simple single image with object-cover */}
                <Image
                  src={slide?.image}
                  alt={slide?.title}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="absolute inset-0 size-full object-cover object-center opacity-70 lg:hidden"
                />

                {/* Desktop: Blurred background image (hidden on mobile) */}
                <Image
                  src={slide?.image}
                  alt=""
                  fill
                  priority={index === 0}
                  quality={60}
                  className="absolute inset-0 hidden size-full object-cover blur-sm brightness-50 lg:block"
                />

                {/* Desktop: Sharp foreground image (hidden on mobile) */}
                <Image
                  src={slide?.image}
                  alt={slide?.title}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="absolute inset-0 hidden size-full object-contain opacity-90 lg:block"
                />
                {/* Text content positioned at bottom */}
                <div className="relative z-10 mb-20 w-full px-4 text-center">
                  <div className="mx-auto max-w-2xl">
                    <h2 className="mb-4 text-2xl font-light tracking-wide md:text-3xl lg:text-4xl">
                      {slide?.title}
                    </h2>
                    <p className="mb-6 text-sm opacity-90 md:text-base lg:text-lg">
                      {slide?.description}
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="border border-white bg-transparent px-6 py-2 text-sm text-white hover:bg-white hover:text-black"
                    >
                      <Link href={slide?.href ?? "/"}>SHOP NOW</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicators */}
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
