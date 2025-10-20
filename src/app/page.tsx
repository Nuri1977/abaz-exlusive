import BestSellers from "@/components/home/BestSellers";
import HeroSection from "@/components/home/HeroSection";
import NewArrivals from "@/components/home/NewArrivals";
import PromoBanner from "@/components/home/PromoBanner";
import ShopByCategory from "@/components/home/ShopByCategory";
import { getSettingsSA } from "@/services/settings/settingsService";

export default async function HomePage() {
  const settings = await getSettingsSA();

  return (
    <>
      {/* Hero Banner */}
      <HeroSection settings={settings} />

      {/* Main content */}
      <div className="space-y-20 py-20">
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
