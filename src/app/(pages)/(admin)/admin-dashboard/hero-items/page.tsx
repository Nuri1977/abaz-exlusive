import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";
import { heroItemService } from "@/services/heroItems/heroItemService";

import HeroItemsClient from "./_components/HeroItemsClient";

const HeroItemsPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  try {
    const heroItems = await heroItemService.getAllHeroItems();

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Hero Items</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage your homepage hero carousel items and featured content.
          </p>
        </div>
        <HeroItemsClient heroItems={heroItems} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching hero items:", error);
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Hero Items</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage your homepage hero carousel items and featured content.
          </p>
        </div>
        <HeroItemsClient heroItems={[]} />
      </div>
    );
  }
};

export default HeroItemsPage;