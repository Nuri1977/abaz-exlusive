import BestSellers from "@/components/home/BestSellers";
import DynamicHeroSection from "@/components/home/DynamicHeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import ShopByCategory from "@/components/home/ShopByCategory";
import { getCachedHeroItems } from "@/lib/cache/heroItems";
import { getSettingsSA } from "@/services/settings/settingsService";

export default async function HomePage() {
  const [settings, heroItems] = await Promise.all([
    getSettingsSA(),
    getCachedHeroItems(),
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
        <PromoBanner />

        {/* Best Sellers */}
        <BestSellers />

        {/* Shop by Category */}
        <ShopByCategory />
      </div>
    </>
  );
}
