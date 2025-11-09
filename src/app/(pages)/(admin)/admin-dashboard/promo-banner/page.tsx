import { redirect } from "next/navigation";

import { getSessionServer } from "@/helpers/getSessionServer";
import { promoBannerService } from "@/services/promoBanner/promoBannerService";

import PromoBannerClient from "./_components/PromoBannerClient";

const PromoBannerPage = async () => {
  const session = await getSessionServer();
  if (!session?.user?.isAdmin) redirect("/");

  try {
    const [promoBanner, collections] = await Promise.all([
      promoBannerService.getPromoBanner(),
      promoBannerService.getAvailableCollections(),
    ]);

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Promo Banner</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage your homepage promotional banner. Select a collection to feature or leave empty for default content.
          </p>
        </div>
        <PromoBannerClient
          promoBanner={promoBanner}
          collections={collections}
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching promo banner data:", error);
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold md:text-3xl">Promo Banner</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Manage your homepage promotional banner. Select a collection to feature or leave empty for default content.
          </p>
        </div>
        <PromoBannerClient
          promoBanner={null}
          collections={[]}
        />
      </div>
    );
  }
};

export default PromoBannerPage;