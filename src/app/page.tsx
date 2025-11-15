import type { Metadata } from "next";
import BestSellers from "@/components/home/BestSellers";
import DynamicHeroSection from "@/components/home/DynamicHeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import ShopByCategory from "@/components/home/ShopByCategory";
import { getCachedHeroItems } from "@/lib/cache/heroItems";
import { getCachedPromoBanner } from "@/lib/cache/promoBanner";
import { getSettingsSA } from "@/services/settings/settingsService";
import { generateHomepageMetadata } from "@/lib/metadata";

// Generate dynamic homepage metadata
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch current data to enhance metadata
    const [heroItems, promoBanner] = await Promise.all([
      getCachedHeroItems(),
      getCachedPromoBanner(),
    ]);

    // Create dynamic description based on current content
    let dynamicDescription = "Discover Abaz Exclusive's collection of elegant women's dresses. From cocktail dresses to formal wear and casual styles. Premium quality, designer fashion.";

    // Enhance description with featured collection if available
    if (promoBanner?.collection?.name) {
      dynamicDescription = `Featuring our ${promoBanner.collection.name} collection. ${dynamicDescription}`;
    }

    // Add hero collection info if available
    const heroCollections = heroItems?.filter(item => item.collection?.name).map(item => item.collection?.name);
    if (heroCollections && heroCollections.length > 0) {
      const collectionsText = heroCollections.slice(0, 2).join(" and ");
      dynamicDescription += ` Explore ${collectionsText} and more premium collections.`;
    }

    // Generate enhanced metadata
    return {
      title: "Premium Women's Dresses & Fashion Apparel - Abaz Exclusive",
      description: dynamicDescription,
      keywords: [
        "women's dresses",
        "designer dresses",
        "luxury evening wear",
        "cocktail dresses",
        "formal dresses",
        "casual dresses",
        "premium fashion",
        "women's apparel",
        "elegant clothing",
        "fashion boutique",
        "women's fashion boutique",
        "online dress store",
        "premium clothing",
        "designer apparel",
        // Add featured collection keywords if available
        ...(promoBanner?.collection?.name ? [promoBanner.collection.name.toLowerCase()] : []),
        ...(heroCollections || []).map(name => name?.toLowerCase()).filter((name): name is string => Boolean(name)),
      ],
      openGraph: {
        title: "Premium Women's Dresses & Fashion Apparel - Abaz Exclusive",
        description: dynamicDescription,
        images: [
          {
            url: promoBanner?.collection?.image &&
              typeof promoBanner.collection.image === 'object' &&
              promoBanner.collection.image !== null &&
              'url' in promoBanner.collection.image
              ? promoBanner.collection.image.url as string
              : "/images/og-default.jpg",
            width: 1200,
            height: 630,
            alt: "Abaz Exclusive - Premium Women's Dresses",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Premium Women's Dresses & Fashion Apparel - Abaz Exclusive",
        description: dynamicDescription,
        images: [
          promoBanner?.collection?.image &&
            typeof promoBanner.collection.image === 'object' &&
            promoBanner.collection.image !== null &&
            'url' in promoBanner.collection.image
            ? promoBanner.collection.image.url as string
            : "/images/og-default.jpg"
        ],
      },
      alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://abazexclusive.com",
      },
    };
  } catch (error) {
    console.error("Error generating homepage metadata:", error);
    // Fallback to static metadata
    return generateHomepageMetadata();
  }
}

export default async function HomePage() {
  const [settings, heroItems, promoBanner] = await Promise.all([
    getSettingsSA(),
    getCachedHeroItems(),
    getCachedPromoBanner(),
  ]);

  return (
    <>
      {/* Hero Banner */}
      <DynamicHeroSection settings={settings} heroItems={heroItems} />

      {/* Main content */}
      <div className="space-y-8 py-8 sm:space-y-12 sm:py-12 lg:space-y-20 lg:py-20">
        {/* New Arrivals */}
        <NewArrivals />

        {/* Promo Banner */}
        <PromoBanner promoBanner={promoBanner} />

        {/* Best Sellers */}
        <BestSellers />

        {/* Shop by Category */}
        <ShopByCategory />
      </div>
    </>
  );
}
