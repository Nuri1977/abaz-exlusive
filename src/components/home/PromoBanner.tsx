import Link from "next/link";

import { Button } from "../ui/button";
import type { PromoBannerData } from "@/services/promoBanner/promoBannerService";

interface PromoBannerProps {
  promoBanner?: PromoBannerData | null;
}

const PromoBanner = ({ promoBanner }: PromoBannerProps) => {
  // Determine if we have an active promo banner with collection
  const hasActivePromoBanner = promoBanner?.isActive && promoBanner?.collection;
  const collection = promoBanner?.collection;

  // Dynamic content based on collection or fallback
  const content = hasActivePromoBanner && collection ? {
    title: collection.name,
    image: collection.image &&
      typeof collection.image === 'object' &&
      collection.image !== null &&
      'url' in collection.image
      ? collection.image.url as string
      : "/images/blue.jpg",
    ctaLink: `/collections/${collection.slug}`,
    ctaText: "Shop Collection",
  } : {
    // Fallback to current static content
    title: "Free Express Shipping",
    image: "/images/blue.jpg",
    ctaLink: "/products",
    ctaText: "Shop Now",
  };

  return (
    <section className="relative h-[500px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: `url('${content.image}')`,
          backgroundAttachment: "fixed",
          backgroundPosition: "top center",
          backgroundSize: "cover",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-end px-4 pb-12 text-center text-white">
        {/* Collection Name */}
        <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          {content.title}
        </h2>

        {/* Single CTA Button */}
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="bg-white text-primary shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Link href={content.ctaLink}>{content.ctaText}</Link>
        </Button>
      </div>
    </section>
  );
};

export default PromoBanner;
