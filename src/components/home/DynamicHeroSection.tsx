"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroHeader } from "@/components/shared/HeroHeader";
import type { HeroItemData } from "@/services/heroItems/heroItemService";

// Fallback hero slides data
const FALLBACK_HERO_SLIDES = [
  {
    id: "fallback-1",
    title: "Discover the New Collection",
    description: "Premium women's shoes for every occasion.",
    imageUrl: "/images/hero_01.jpg",
    linkUrl: "/products/new-arrivals",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "fallback-2",
    title: "Elegance in Every Step",
    description: "Find the perfect pair of heels for your next event.",
    imageUrl: "/images/hero_02.jpg",
    linkUrl: "/products/heels",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "fallback-3",
    title: "Summer-Ready Sandals",
    description: "Step into summer with our latest collection of sandals.",
    imageUrl: "/images/hero_03.jpg",
    linkUrl: "/products/sandals",
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "fallback-4",
    title: "Comfort Meets Style",
    description: "Explore our range of comfortable and stylish sneakers.",
    imageUrl: "/images/hero_04.jpg",
    linkUrl: "/products/sneakers",
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "fallback-5",
    title: "Bold & Beautiful Boots",
    description: "Make a statement with our collection of boots.",
    imageUrl: "/images/hero_05.jpg",
    linkUrl: "/products/boots",
    isActive: true,
    sortOrder: 5,
  },
];

interface DynamicHeroSectionProps {
  heroItems?: HeroItemData[];
  settings?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    telephone?: string;
    email?: string;
    facebook?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    youtube?: string | null;
  } | null;
}

const DynamicHeroSection = ({ heroItems, settings }: DynamicHeroSectionProps) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  // Use provided hero items or fallback to default slides
  const slides = React.useMemo(() => {
    if (heroItems && heroItems.length > 0) {
      return heroItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        imageUrl: item.imageUrl,
        linkUrl: item.linkUrl,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      }));
    }
    return FALLBACK_HERO_SLIDES;
  }, [heroItems]);

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
    <section className="relative h-svh w-full">
      {/* Hero Header */}
      <HeroHeader settings={settings} />

      <div ref={emblaRef} className="size-full overflow-hidden">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative size-full flex-[0_0_100%]">
              <div className="relative flex size-full items-end justify-center overflow-hidden bg-black text-white">
                {/* Mobile: Simple single image with object-cover */}
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="absolute inset-0 size-full object-cover object-center opacity-70 lg:hidden"
                />

                {/* Desktop: Blurred background image (hidden on mobile) */}
                <Image
                  src={slide.imageUrl}
                  alt=""
                  fill
                  priority={index === 0}
                  quality={60}
                  className="absolute inset-0 hidden size-full object-cover blur-sm brightness-50 lg:block"
                />

                {/* Desktop: Sharp foreground image (hidden on mobile) */}
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  quality={100}
                  className="absolute inset-0 hidden size-full object-contain opacity-90 lg:block"
                />

                {/* Gradient Overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Text content positioned at bottom */}
                <div className="relative z-10 mb-20 w-full px-4 text-center">
                  <div className="mx-auto max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000 fill-mode-forwards">
                    <h2 className="mb-6 text-3xl font-medium tracking-wide md:text-3xl lg:text-4xl drop-shadow-lg">
                      {slide.title}
                    </h2>
                    {slide.description && (
                      <p className="mb-8 text-base opacity-90 md:text-md lg:text-lg drop-shadow-md max-w-2xl mx-auto">
                        {slide.description}
                      </p>
                    )}
                    <Button
                      asChild
                      size="lg"
                      variant='outline'
                      className="bg-transparent text-white border-white hover:bg-white hover:text-black hover:border-black"
                    >
                      <Link href={slide.linkUrl}>SHOP NOW</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel indicators */}
        <div className="absolute inset-x-0 bottom-8 z-50">
          <div className="flex justify-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-1 w-8 rounded-full transition-all duration-300",
                  selectedIndex === index
                    ? "bg-white w-12"
                    : "bg-white/40 hover:bg-white/60"
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

export default DynamicHeroSection;